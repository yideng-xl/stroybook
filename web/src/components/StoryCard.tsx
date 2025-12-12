import React from 'react';
import { Story } from '../types';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/url';
import { Play, User } from 'lucide-react';

interface StoryCardProps {
    story: Story | any; // Using any for compatibility with diverse backend DTOs if needed
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
    // Helper to get cover image.
    // If story has 'styles', use the first style's cover.
    // If story has direct coverImage property, use it.
    let coverImage = '';
    let styleName = '';

    if (story.styles && story.styles.length > 0) {
        coverImage = getAssetUrl(story.styles[0].coverImage);
        styleName = story.styles[0].name;
    } else if (story.coverImage) {
        // Fallback for flat structure
        coverImage = getAssetUrl(story.coverImage);
    }

    // Status Badge Logic
    const isGenerating = story.status === 'GENERATING';
    const isFailed = story.status === 'FAILED';

    // Style color generator
    const getStyleColor = (name: string) => {
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
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    return (
        <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-4 border-transparent hover:border-blue-300">
            {/* Cover Image */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-200 relative">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={story.titleZh || story.titleEn}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = '/assets/default-cover.png';
                            e.currentTarget.onerror = null;
                        }}
                    />
                ) : (
                    <img
                        src="/assets/default-cover.png"
                        alt="Default Cover"
                        className="w-full h-full object-cover opacity-80"
                    />
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 p-3 rounded-full shadow-lg">
                        <Play className="w-8 h-8 text-blue-500 fill-current ml-1" />
                    </div>
                </div>

                {/* Status Badges */}
                {isGenerating && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md">
                        ✨ 创作中...
                    </div>
                )}
                {isFailed && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        ⚠️ 失败
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {story.titleZh || '未命名故事'}
                </h3>
                {story.titleEn && (
                    <p className="text-sm text-gray-500 mb-3 font-medium">{story.titleEn}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStyleColor(styleName || '默认')}`}>
                        {styleName || '默认风格'}
                    </span>
                    <div className="flex items-center text-gray-500">
                        <User size={12} className="mr-1" />
                        <span>{story.userId || 'Storybook'}</span>
                    </div>
                </div>
            </div>

            {/* Click Area */}
            {!isGenerating && !isFailed && (
                <Link
                    to={`/read/${story.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${story.titleZh}`}
                />
            )}
        </div>
    );
};
