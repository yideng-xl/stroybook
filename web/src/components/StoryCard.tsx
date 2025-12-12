import React from 'react';
import { Story } from '../types';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/url';
import { Play } from 'lucide-react';

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
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <span>暂无封面</span>
                    </div>
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
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-500">{styleName || '默认风格'}</span>
                    {/* <span>{story.pageCount ? `${story.pageCount} 页` : ''}</span> */}
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
