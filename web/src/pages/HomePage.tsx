import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { StoryCard } from '../components/StoryCard'; // Assuming this component exists, if not need to create or mock
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserStories } from '../hooks/useUserStories';

const HomePage: React.FC = () => {
    const { manifest, loading: manifestLoading } = useStoryManifest();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Use useUserStories for "My Stories" section (polling enabled)
    const { userStories, isLoading: userStoriesLoading } = useUserStories({
        userId: user?.id ? String(user.id) : null,
        enabled: !!user
    });

    const filteredManifest = manifest.filter(story =>
        (story.titleZh?.includes(searchTerm) || story.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Layout showFooter>
            {/* Hero Section */}
            <div className="relative h-[400px] bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
                    <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">探索奇妙的绘本世界</h1>
                    <p className="text-xl mb-8 max-w-2xl drop-shadow">在这里，每一个故事都是一次奇妙的冒险。为您和您的孩子精心挑选的互动绘本。</p>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="搜索喜欢的故事..."
                            className="w-full px-6 py-4 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all font-medium text-lg pl-14"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => navigate('/create')}
                        className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        ✨ 我要创作故事
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* My Creations Section (Only if logged in) */}
                {user && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 border-l-8 border-purple-500 pl-4">我的创作</h2>
                            <button onClick={() => navigate('/bookshelf')} className="text-purple-600 hover:text-purple-700 font-medium">查看全部 &rarr;</button>
                        </div>

                        {userStoriesLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>
                        ) : userStories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {userStories.slice(0, 4).map(story => (
                                    <StoryCard key={story.id} story={story} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-purple-50 rounded-2xl p-8 text-center text-purple-700">
                                <p className="mb-4">您还没有创作过故事哦，快去试试吧！</p>
                                <button onClick={() => navigate('/create')} className="text-purple-600 font-bold hover:underline">开始创作</button>
                            </div>
                        )}
                    </section>
                )}

                {/* Main Library Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 border-l-8 border-blue-500 pl-4">精选绘本</h2>
                        <span className="text-gray-500 text-sm">共 {filteredManifest.length} 本书</span>
                    </div>

                    {manifestLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredManifest.map((story) => (
                                <StoryCard key={story.id} story={story} /> // Need to ensure StoryCard accepts this shape or adapt it
                            ))}
                        </div>
                    )}

                    {!manifestLoading && filteredManifest.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl">
                            <p className="text-gray-400 text-xl">没有找到相关故事，换个关键词试试？</p>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
};

export default HomePage;
