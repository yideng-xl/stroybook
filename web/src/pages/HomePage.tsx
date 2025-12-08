import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Clock, Loader2, XCircle } from 'lucide-react';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { getAssetUrl } from '../utils/url';
import { api } from '../api/client';
import { useUserStories } from '../hooks/useUserStories'; // Import the new hook
import { Story, StoryStatus } from '../types'; // Import Story and StoryStatus types
import { twMerge } from 'tailwind-merge'; // For conditional class merging

// A reusable StoryCard component that handles different statuses
const StoryCard: React.FC<{ story: Story | any; historyDuration?: number; isUserStory?: boolean }> = 
  ({ story, historyDuration, isUserStory = false }) => {
    const navigate = useNavigate();

    // Determine the style to render based on selection or default. For user stories, use selectedStyleId
    const styleToRender = isUserStory && story.selectedStyleId
      ? story.styles.find((s:any) => s.name === story.selectedStyleId) // Corrected from s.id to s.name
      : story.styles.find((s:any) => s.name === (story.defaultStyle || story.styles[0]?.name)); // Corrected from s.id to s.name

    const imageUrl = styleToRender ? getAssetUrl(styleToRender.coverImage) : 'https://placehold.co/300x400/e2e8f0/94a3b8?text=No+Image';

    let cardContent;
    let linkPath = `/read/${story.id}?style=${styleToRender?.name || ''}`;

    switch (story.status) {
      case StoryStatus.GENERATING:
        cardContent = (
          <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center text-gray-500 font-bold">
            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
            <p className="text-lg">故事生成中...</p>
            <p className="text-sm">请稍候</p>
          </div>
        );
        linkPath = ''; // Make card unclickable while generating
        break;
      case StoryStatus.FAILED:
        cardContent = (
          <div className="aspect-[3/4] bg-red-100 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center text-red-700 font-bold">
            <XCircle size={48} className="text-red-500 mb-4" />
            <p className="text-lg">生成失败</p>
            <p className="text-sm truncate max-w-full">{story.errorMessage || '未知错误'}</p>
          </div>
        );
        linkPath = ''; // Make card unclickable if failed (or link to a retry page)
        break;
      case StoryStatus.PUBLISHED:
      default:
        cardContent = (
          <>
            <div className="aspect-[3/4] bg-blue-100 relative overflow-hidden">
              <img
                src={imageUrl}
                alt={story.titleZh}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x400/e2e8f0/94a3b8?text=No+Image';
                }}
              />
              {styleToRender && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm transform rotate-3 group-hover:rotate-6 transition-transform whitespace-nowrap max-w-[90%] truncate">
                  {styleToRender.name}
                </div>
              )}
              {historyDuration !== undefined && historyDuration > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <Clock size={10} />
                  {Math.ceil(historyDuration / 60)} 分钟
                </div>
              )}
              <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
                <span className="bg-black/60 text-white text-[8px] font-bold px-1 rounded backdrop-blur-sm">
                    作者: {story.userId || 'storybook'}
                </span>
              </div>
            </div>
            <div className="p-4 bg-white text-center">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-500 transition-colors truncate">
                {story.titleZh}
              </h3>
            </div>
          </>
        );
        break;
    }

    const cardClasses = twMerge(
        "group bg-white rounded-3xl overflow-hidden border-4 border-white shadow-md relative transition-all duration-300",
        story.status === StoryStatus.GENERATING && "opacity-70 cursor-wait",
        story.status === StoryStatus.FAILED && "opacity-80 cursor-not-allowed border-red-400",
        story.status === StoryStatus.PUBLISHED && "cursor-pointer hover:-translate-y-2 hover:rotate-1 hover:shadow-xl hover:border-blue-400"
    )

    return (
        <div 
            className={cardClasses}
            onClick={() => linkPath && navigate(linkPath)}
        >
            {cardContent}
        </div>
    );
};


const HomePage: React.FC = () => {
  const { manifest, loading, error } = useStoryManifest();
  const { user, logout, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [historyMap, setHistoryMap] = useState<Record<string, number>>({});

  // Fetch user's own stories
  const { userStories, isLoading: userStoriesLoading, error: userStoriesError } = useUserStories({
    userId: user?.username || null, // Use username because backend stores username as userId
    enabled: !!user, // Only fetch if user is logged in
  });

  // Scroll to top on mount to avoid scroll position issues
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch history duration if logged in
  useEffect(() => {
    if (user) {
        api.history.list().then(res => {
            const map: Record<string, number> = {};
            res.data.forEach((item: any) => {
                map[item.storyId] = (map[item.storyId] || 0) + item.durationSeconds;
            });
            setHistoryMap(map);
        }).catch(console.error);
    } else {
        setHistoryMap({});
    }
  }, [user]);

  // Extract all unique styles from manifest for the dropdown
  const allStyles = useMemo(() => {
    const styles = new Set<string>();
    // Combine styles from manifest and userStories
    manifest.forEach(story => {
      story.styles.forEach(s => styles.add(s.id));
    });
    userStories.forEach(story => {
        if (story.selectedStyleId) {
            styles.add(story.selectedStyleId);
        }
    });
    return Array.from(styles);
  }, [manifest, userStories]);

  // Filter public stories (exclude current user's own stories)
  const filteredPublicStories = useMemo(() => {
    return manifest.filter(story => {
      const matchTitle = story.titleZh.includes(searchTerm) || story.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStyle = selectedStyle ? story.styles.some(s => s.id === selectedStyle) : true;
      // Only show PUBLISHED stories in the public list
      // And exclude stories created by the current user to avoid duplication
      const isNotMyStory = !user || story.userId !== user.username;
      
      return matchTitle && matchStyle && story.status === StoryStatus.PUBLISHED && isNotMyStory;
    });
  }, [manifest, searchTerm, selectedStyle, user]);

  // Filter user's stories (all statuses)
  const filteredUserStories = useMemo(() => {
    return userStories.filter(story => {
        const matchTitle = (story.titleZh || '').includes(searchTerm) || (story.titleEn || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchStyle = true;
        if (selectedStyle) {
            // For GENERATING stories, check selectedStyleId directly
            if (story.status === StoryStatus.GENERATING && story.selectedStyleId) {
                matchStyle = story.selectedStyleId === selectedStyle;
            } else {
                // For PUBLISHED/FAILED stories, check the styles array
                // IMPORTANT: The backend API returns styles with numeric IDs in `id` and style names in `name`.
                // selectedStyle contains the style name (e.g., "迪士尼").
                // So we must compare s.name, not s.id.
                matchStyle = story.styles.some(s => s.name === selectedStyle);
            }
        }
        
        return matchTitle && matchStyle; 
    });
  }, [userStories, searchTerm, selectedStyle]);

  // Parallax Effect Logic (Simple version for React)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (window.innerWidth - e.clientX * 2) / 100,
        y: (window.innerHeight - e.clientY * 2) / 100
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (loading || userStoriesLoading) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-yellow-600">加载魔法故事中...✨</div>;
  if (error || userStoriesError) return <div className="min-h-screen flex items-center justify-center text-red-500">哎呀，魔法书打不开了: {error || userStoriesError}</div>;

  return (
    <Layout>
      {/* Background Parallax Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[10%] text-6xl opacity-20 transition-transform duration-100 ease-out" 
             style={{ transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)` }}>☁️</div>
        <div className="absolute top-[20%] right-[15%] text-4xl opacity-20 transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)` }}>☁️</div>
        <div className="absolute bottom-[10%] left-[20%] text-5xl opacity-10 transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}>🏰</div>
      </div>

      {/* Navbar */}
      <header className="py-6 px-4 sticky top-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
          {/* Logo */}
          <div className="shrink-0 bg-amber-600 px-6 py-3 rounded-full flex items-center gap-3 transform -rotate-2 shadow-lg hover:rotate-0 transition-transform cursor-pointer border-4 border-amber-800"
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)' }}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl animate-bounce">🏰</div>
            <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">奇妙绘本馆</h1>
          </div>

          {/* Search & Filter Container (Centered) */}
          <div className="w-full md:flex-1 flex md:justify-center md:px-8">
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-full border-4 border-blue-400 shadow-lg hover:shadow-xl transition-shadow w-full md:w-auto md:min-w-[400px] md:max-w-2xl flex-1">
                <input 
                type="text" 
                placeholder="找故事..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none pl-4 text-lg w-full placeholder-gray-400 font-bold text-blue-500 flex-1 min-w-0"
                />
                <button className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors shrink-0">
                <Search size={24} strokeWidth={3} />
                </button>
                <div className="w-px h-8 bg-gray-200 hidden md:block shrink-0"></div>
                <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="hidden md:block bg-transparent border-none outline-none text-gray-600 font-bold cursor-pointer pr-4 hover:text-blue-500 shrink-0"
                >
                <option value="">全部风格</option>
                {allStyles.map(style => (
                    <option key={style} value={style}>🎨 {style}</option>
                ))}
                </select>
            </div>
          </div>

          {/* User Auth Widget */}
          <div className="shrink-0 flex items-center gap-2 bg-white/90 p-2 rounded-full border-4 border-pink-300 shadow-lg cursor-pointer hover:scale-105 transition-transform">
             {user ? (
                 <div className="flex items-center gap-2 px-2">
                    <Link to="/bookshelf" className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-blue-500 mr-2">
                        <span>📚</span> 书架
                    </Link>
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold" onClick={() => navigate('/change-password')}>
                        {user.username[0].toUpperCase()}
                    </div>
                    <LogOut size={18} className="text-gray-400 cursor-pointer" onClick={() => { if(confirm('要退出登录吗?')) logout(); }} />
                 </div>
             ) : (
                 <button onClick={() => openLoginModal()} className="flex items-center gap-2 px-2 text-pink-500 font-bold">
                    <UserIcon size={20} />
                    <span>登录</span>
                 </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-4 pb-20 pt-8 relative z-10">
        {/* My Creations Section - Visible if logged in */}
        {user && (
            <section className="mb-12 border-b-2 border-dashed border-gray-200 pb-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-6 drop-shadow-sm flex items-center gap-2">
                    <span>我的创作 ✨</span>
                    <span className="text-sm font-normal text-gray-500 bg-white/50 px-3 py-1 rounded-full">{filteredUserStories.length} 个故事</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Add New Story Link - Always first */}
                    <Link to="/create" className="group bg-white rounded-3xl overflow-hidden border-4 border-dashed border-gray-300 shadow-sm cursor-pointer relative flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all aspect-[3/4]">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                        <span className="text-4xl text-gray-400 group-hover:text-blue-500">+</span>
                        </div>
                        <span className="font-bold text-gray-400 group-hover:text-blue-500">创作新故事</span>
                    </Link>

                    {filteredUserStories.map(story => (
                        <StoryCard key={story.id} story={story} isUserStory={true} />
                    ))}
                </div>
            </section>
        )}

        {/* Public Stories Section */}
        <h2 className="text-3xl font-bold text-brand-dark mb-6 drop-shadow-sm">精选故事 📚</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredPublicStories.map(story => (
            <StoryCard 
                key={story.id} 
                story={story as unknown as Story} // Cast manifest item to Story type, assuming it has enough info
                historyDuration={historyMap[story.id]}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 font-medium bg-white/50 backdrop-blur-sm border-t-4 border-dashed border-gray-200 mt-12">
        <p className="mb-2">Built with ❤️ for Kids</p>
        <div className="flex justify-center gap-4 text-sm">
             <Link to="/benefits" className="text-blue-500 hover:text-blue-600 font-bold hover:underline">💎 会员权益说明</Link>
             <span>|</span>
             <span>© 2025 StoryBook</span>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePage;