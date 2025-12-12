import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { StoryStyle, UserVoice } from '../types';
import { getMyVoices } from '../api/voices';

const CreateStoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { token, openLoginModal } = useAuth();
    const { manifest, loading: manifestLoading, error: manifestError } = useStoryManifest();

    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<number | ''>(''); // Voice ID
    const [userVoices, setUserVoices] = useState<UserVoice[]>([]);

    // State for Pending Modal
    const [showPendingModal, setShowPendingModal] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableStyles: StoryStyle[] = useMemo(() => {
        const uniqueStyles = new Map<string, StoryStyle>();
        manifest.forEach(story => {
            story.styles.forEach(style => {
                if (!uniqueStyles.has(style.id)) {
                    uniqueStyles.set(style.id, style);
                }
            });
        });
        return Array.from(uniqueStyles.values());
    }, [manifest]);

    useEffect(() => {
        if (!token) {
            // Use global login modal instead of alert/redirect to separate page
            openLoginModal('login');
            navigate('/');
        } else {
            // Load user voices
            getMyVoices().then(setUserVoices).catch(err => console.error("Failed to load voices", err));
        }
    }, [token, navigate, openLoginModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!prompt.trim()) {
            setError('故事创意不能为空！');
            return;
        }
        if (!selectedStyle) {
            setError('请选择一个风格！');
            return;
        }
        if (!token) {
            setError('用户未登录，请重新登录。');
            return;
        }

        setIsLoading(true);
        try {
            const requestBody: any = { prompt, style: selectedStyle };
            if (selectedVoice) {
                requestBody.voiceId = selectedVoice;
            }

            const response = await fetch('/api/stories/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '故事生成失败，请重试。');
            }

            const data = await response.json();
            alert(`故事生成请求已发送！ID: ${data.storyId}。请在我的创作中查看进度。`);
            navigate('/'); // Navigate to home/bookshelf page

        } catch (err) {
            setError(err instanceof Error ? err.message : '发生未知错误。');
            console.error('Failed to generate story:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (manifestLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-brand-yellow/30">
                <p className="text-xl font-bold text-brand-dark">加载风格中...</p>
            </div>
        );
    }

    if (manifestError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-brand-yellow/30">
                <p className="text-xl font-bold text-red-600">错误：{manifestError}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-yellow/30 p-4 relative">
            {/* Back Navigation */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-brand-dark font-bold hover:text-brand-blue transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm"
            >
                <span>🏠</span>
                <span>返回书架</span>
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-brand-orange/50 max-w-2xl w-full">
                <h1 className="text-4xl font-bold text-center text-brand-dark mb-8 font-sans drop-shadow-md">
                    开始创作你的故事 ✍️
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-lg font-bold text-brand-dark mb-2">
                            故事创意 / 提示词:
                        </label>
                        <textarea
                            id="prompt"
                            className={twMerge(
                                "w-full p-4 rounded-xl border-2 border-brand-blue/30 focus:border-brand-blue focus:ring-brand-blue/50 outline-none resize-y",
                                "text-lg font-medium h-40 shadow-inner bg-blue-50/20 transition-all"
                            )}
                            placeholder="例如：一只小企鹅梦想着飞向月亮的故事..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="style" className="block text-lg font-bold text-brand-dark mb-2">
                            选择风格:
                        </label>
                        <select
                            id="style"
                            className={twMerge(
                                "w-full p-4 rounded-xl border-2 border-brand-blue/30 focus:border-brand-blue focus:ring-brand-blue/50 outline-none appearance-none",
                                "text-lg font-medium bg-blue-50/20 shadow-inner cursor-pointer transition-all"
                            )}
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- 请选择一个风格 --</option>
                            {availableStyles.map((style) => (
                                <option key={style.id} value={style.id}>
                                    {style.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="voice" className="block text-lg font-bold text-brand-dark mb-2">
                            朗读声音 (可选):
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="voice"
                                className={twMerge(
                                    "flex-1 p-4 rounded-xl border-2 border-brand-blue/30 focus:border-brand-blue focus:ring-brand-blue/50 outline-none appearance-none",
                                    "text-lg font-medium bg-blue-50/20 shadow-inner cursor-pointer transition-all"
                                )}
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(Number(e.target.value))}
                                disabled={isLoading}
                            >
                                <option value="">默认 (标准语音)</option>
                                {userVoices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} (我的克隆)
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowPendingModal(true)}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-colors"
                            >
                                管理声音
                            </button>
                        </div>
                    </div>

                    {error && !error.includes('Daily limit reached') && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
                            <strong className="font-bold">错误! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={twMerge(
                            "w-full py-4 rounded-2xl bg-pink-500 text-white text-xl font-bold border-b-4 border-pink-700 shadow-lg",
                            "hover:bg-pink-600 active:translate-y-1 active:border-b-0 transition-all duration-200",
                            isLoading && "opacity-60 cursor-not-allowed bg-gray-400 border-gray-500"
                        )}
                        disabled={isLoading}
                    >
                        {isLoading ? '生成中...' : '开始生成故事 ✨'}
                    </button>
                </form>
            </div>

            {/* Voice Pending Modal */}
            {showPendingModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPendingModal(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center animate-bounce-in border-4 border-yellow-300">
                        <button onClick={() => setShowPendingModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                            <span className="text-3xl">🎤</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">功能待上线</h3>
                        <p className="text-gray-600 mb-6">声音克隆功能正在加急开发中，敬请期待！</p>
                        <button onClick={() => setShowPendingModal(false)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-md">
                            我知道了
                        </button>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {error && (error.includes('Daily limit reached') || error.includes('limit reached')) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setError(null)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 text-center border-4 border-yellow-300 animate-bounce-in">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">👑</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">今日免费额度已用完</h2>
                        <p className="text-gray-600 mb-6">您今天已经创作了 2 个故事啦！升级 Pro 会员，每天可以创作 9 个故事哦！</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/payment')}
                                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                立即升级 Pro 🚀
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="text-gray-400 hover:text-gray-600 font-medium text-sm"
                            >
                                明天再来
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateStoryPage;