import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Layout } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import { PlusCircle, User, Loader2 } from 'lucide-react';

interface HistoryItem {
    storyId: string;
    storyTitle: string;
    styleName: string;
    currentPage: number;
    durationSeconds: number;
    updatedAt: string;
}

export const Bookshelf: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const { manifest, loading: manifestLoading } = useStoryManifest();
    const navigate = useNavigate();

    // Filter My Creations
    const myCreations = React.useMemo(() => {
        if (!user || !manifest) return [];
        return manifest.filter(story => story.userId === user.username);
    }, [manifest, user]);

    useEffect(() => {
        api.history.list()
            .then(res => setHistory(res.data))
            .catch(() => { })
            .finally(() => setHistoryLoading(false));
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 1) return '< 1分钟';
        if (mins < 60) return `${mins} 分钟`;
        return `${(mins / 60).toFixed(1)} 小时`;
    };

    const getCoverImage = (item: HistoryItem) => {
        const story = manifest.find(s => s.id === item.storyId);
        if (!story) return '';
        const style = story.styles.find(s => s.name === item.styleName) || story.styles[0];
        return style ? getAssetUrl(style.coverImage) : '';
    };

    const getStoryCover = (story: any) => {
        const style = story.styles[0];
        return style ? getAssetUrl(style.coverImage) : '';
    };

    const getStyleColor = (styleName: string) => {
        const colors = [
            'bg-blue-100 text-blue-700',
            'bg-green-100 text-green-700',
            'bg-purple-100 text-purple-700',
            'bg-pink-100 text-pink-700',
            'bg-yellow-100 text-yellow-800',
            'bg-indigo-100 text-indigo-700',
            'bg-red-100 text-red-700',
            'bg-orange-100 text-orange-800',
        ];
        let hash = 0;
        for (let i = 0; i < styleName.length; i++) {
            hash = styleName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

                {/* My Creations Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            🎨 我的创作
                        </h2>
                        <button
                            onClick={() => navigate('/create')}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95"
                        >
                            <PlusCircle size={20} />
                            去创作
                        </button>
                    </div>

                    {manifestLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-yellow-400" size={40} /></div>
                    ) : myCreations.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-yellow-100">
                            <div className="text-5xl mb-4">✨</div>
                            <p className="text-gray-500 mb-6">你还没有创作过故事哦</p>
                            <button onClick={() => navigate('/create')} className="text-yellow-600 font-bold hover:underline">
                                开始我的第一个故事 &rarr;
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myCreations.map(story => (
                                <Link to={`/read/${story.id}?style=${story.defaultStyle}`} key={story.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-yellow-300">
                                    <div className="aspect-[3/4] bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={getStoryCover(story)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.currentTarget.src = '/assets/default-cover.png'; e.currentTarget.onerror = null; }}
                                        />
                                        <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm ${story.status === 'PUBLISHED' ? 'bg-green-500' :
                                            story.status === 'FAILED' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}>
                                            {story.status === 'PUBLISHED' ? '已发布' :
                                                story.status === 'GENERATING' ? '生成中' :
                                                    story.status === 'FAILED' ? '生成失败' : '未知状态'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 truncate mb-1">{story.titleZh}</h3>
                                        <p className="text-xs text-gray-400 mb-2">{story.titleEn}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getStyleColor(story.styles[0]?.name || '默认')}`}>
                                                {story.styles[0]?.name || '默认风格'}
                                            </span>
                                            <div className="flex items-center">
                                                <User size={12} className="mr-1" />
                                                <span>{story.userId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <hr className="border-gray-200" />

                {/* Reading History Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">📚 阅读历史</h2>
                        <button onClick={() => navigate('/')} className="text-blue-500 font-bold hover:underline">去书库找书 &rarr;</button>
                    </div>

                    {historyLoading ? (
                        <div>加载中...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4">🕸️</div>
                            <p>书架空空如也，快去阅读吧！</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map(item => (
                                <Link to={`/read/${item.storyId}?style=${encodeURIComponent(item.styleName || '')}`} key={item.storyId} className="bg-white rounded-2xl p-4 shadow-lg flex gap-4 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300">
                                    <div className="w-24 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                        <img
                                            src={getCoverImage(item)}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = '/assets/default-cover.png'; e.currentTarget.onerror = null; }}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{item.storyTitle}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStyleColor(item.styleName || '默认')}`}>{item.styleName}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <div className="flex justify-between">
                                                <span>读到第 {item.currentPage} 页</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${Math.min(item.currentPage * 10, 100)}%` }}></div>
                                            </div>
                                            <div className="text-xs pt-1">
                                                累计阅读: {formatDuration(item.durationSeconds)} <br />
                                                <span className="text-gray-400">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
};
