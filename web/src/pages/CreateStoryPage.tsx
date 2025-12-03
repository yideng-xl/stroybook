import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { StoryStyle } from '../types';

const CreateStoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { manifest, loading: manifestLoading, error: manifestError } = useStoryManifest();

    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
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
            // Optionally, redirect to login if not authenticated
            navigate('/login');
            alert('请先登录才能创作故事。');
        }
    }, [token, navigate]);

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
            const response = await fetch('/api/stories/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt, style: selectedStyle }),
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-yellow/30 p-4">
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

                    {error && (
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
        </div>
    );
};

export default CreateStoryPage;
