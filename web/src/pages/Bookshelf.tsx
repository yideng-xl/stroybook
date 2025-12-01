import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Layout } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { getAssetUrl } from '../utils/url';

interface HistoryItem {
    storyId: string;
    storyTitle: string;
    styleName: string;
    currentPage: number;
    durationSeconds: number;
    updatedAt: string;
}

export const Bookshelf: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { manifest } = useStoryManifest(); // To get cover images

    useEffect(() => {
        api.history.list()
            .then(res => setHistory(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
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

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">📚 我的书架</h1>
                    <button onClick={() => navigate('/')} className="text-blue-500 font-bold">← 去找新书</button>
                </div>

                {loading ? (
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
                                    <img src={getCoverImage(item)} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{item.storyTitle}</h3>
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{item.styleName}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>读到第 {item.currentPage} 页</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-green-400 h-2 rounded-full" style={{ width: `${Math.min(item.currentPage * 10, 100)}%` }}></div>
                                        </div>
                                        <div className="text-xs pt-1">
                                            累计阅读: {formatDuration(item.durationSeconds)} <br/>
                                            <span className="text-gray-400">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};
