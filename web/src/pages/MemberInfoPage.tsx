import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Crown, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MemberInfoPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [creationCount, setCreationCount] = useState<number | null>(null);

    useEffect(() => {
        // In a real app, fetch count from backend stats endpoint.
        // For MVP, we might infer it or just assume 0 if we can't fetch.
        // Or fetch "My Stories" and count today's.
        if (user) {
            api.stories.list(undefined, undefined)
                .then(res => {
                    // Filter stories created today
                    const today = new Date().toDateString();
                    const count = res.data.filter((s: any) =>
                        s.userId === String(user.id) &&
                        new Date(s.createdAt).toDateString() === today
                    ).length;
                    setCreationCount(count);
                })
                .catch(() => setCreationCount(0));
        }
    }, [user]);

    const isPro = false; // Mock status
    const limit = isPro ? 9 : 2;
    const remaining = Math.max(0, limit - (creationCount || 0));

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header bg */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                    <div className="px-8 pb-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-24 left-8 bg-white p-2 rounded-full shadow-lg">
                            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 border-4 border-white">
                                <User size={48} />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="pt-20 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    {user?.username}
                                    {!isPro && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">免费会员</span>}
                                    {isPro && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Pro会员</span>}
                                </h1>
                                <p className="text-gray-500 mt-1">ID: {user?.id}</p>
                            </div>
                            <button
                                onClick={() => navigate('/payment')}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:scale-105 transition-transform"
                            >
                                升级 Pro 会员
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20} /></div>
                                    <h3 className="font-bold text-gray-700">今日创作额度</h3>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>已使用: {creationCount ?? '-'}</span>
                                        <span>上限: {limit}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${remaining === 0 ? 'bg-red-400' : 'bg-green-400'}`}
                                            style={{ width: `${Math.min(((creationCount || 0) / limit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    {remaining === 0 && (
                                        <p className="text-red-500 text-xs mt-2 flex items-center">
                                            <AlertCircle size={12} className="mr-1" /> 今日额度已用完，请明天再来或升级会员
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><ShieldCheck size={20} /></div>
                                    <h3 className="font-bold text-gray-700">会员权益</h3>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-2 mt-2">
                                    <li className="flex items-center"><Crown size={14} className="mr-2 text-yellow-500" /> 无限阅读故事</li>
                                    <li className={`flex items-center ${isPro ? '' : 'text-gray-400'}`}>
                                        <Crown size={14} className={`mr-2 ${isPro ? 'text-yellow-500' : 'text-gray-300'}`} />
                                        每天创作 9 个故事 {isPro ? '✅' : '🔒'}
                                    </li>
                                    <li className={`flex items-center ${isPro ? '' : 'text-gray-400'}`}>
                                        <Crown size={14} className={`mr-2 ${isPro ? 'text-yellow-500' : 'text-gray-300'}`} />
                                        声音克隆功能 {isPro ? '✅' : '🔒'}
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
};
