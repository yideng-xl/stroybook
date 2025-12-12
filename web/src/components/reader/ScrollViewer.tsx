import React, { useRef, useEffect } from 'react';
import { StoryMetadata, LanguageMode } from '../../types';
import { getAssetUrl } from '../../utils/url';
import { Play } from 'lucide-react';

interface ScrollViewerProps {
    story: StoryMetadata;
    styleId: string;
    langMode: LanguageMode;
    onPageChange?: (page: number) => void;
    autoPlay: boolean;
    audioUrl?: string; // Current explicit explicit audio url to play usually based on page
    playAudio: (url: string) => Promise<void>;
}

export const ScrollViewer: React.FC<ScrollViewerProps> = ({ story, styleId, langMode, onPageChange, playAudio }) => {
    // ScrollViewer is simpler; "onPageChange" is less strict, typically based on visibility.
    // For MVP, we can treat each block as a page.

    // Simple implementation: List of cards

    // Intersection Observer could be used here to trigger onPageChange -> which might trigger autoPlay
    // For mobile vertical list, auto-play based on scroll is tricky.
    // We can add a "Play" button next to each paragraph.

    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        if (!isNaN(index) && onPageChange) {
                            onPageChange(index); // Report current page 1-based index (actually index 0 is page 1 here)
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.6 // 60% visibility triggers page change
            }
        );

        cardRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            observer.disconnect();
        };
    }, [onPageChange]);

    const getImagePath = (pageIndex: number) => {
        return getAssetUrl(`/stories/${story.id}/${styleId}/page-${pageIndex + 1}.png`);
    };

    return (
        <div className="w-full max-w-lg mx-auto pb-20 space-y-8">
            <div className="text-center py-8">
                <h1 className="text-2xl font-bold mb-2">{story.titleZh}</h1>
                <p className="text-gray-500">{story.titleEn}</p>
            </div>

            {(story.pages || []).map((page, index) => {
                const audioUrlZh = page.audioUrlZh ? getAssetUrl(page.audioUrlZh) : undefined;
                const audioUrlEn = page.audioUrlEn ? getAssetUrl(page.audioUrlEn) : undefined;

                // Determine which audio to play for "manual" click
                const targetAudio = langMode === 'en' ? audioUrlEn : audioUrlZh;

                return (
                    <div
                        key={index}
                        ref={el => cardRefs.current[index] = el}
                        data-index={index}
                        className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 overflow-hidden"
                    >
                        <img
                            src={getImagePath(index)}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-auto"
                            loading="lazy"
                        />
                        <div className="p-6">
                            {/* Manual Audio Trigger */}
                            {targetAudio && (
                                <button
                                    onClick={() => playAudio(targetAudio!)}
                                    className="mb-4 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200"
                                >
                                    <Play size={20} fill="currentColor" />
                                </button>
                            )}

                            {(langMode === 'zh' || langMode === 'dual') && (
                                <p className="text-lg text-gray-800 leading-relaxed font-medium mb-3">
                                    {page.textZh}
                                </p>
                            )}

                            {(langMode === 'en' || langMode === 'dual') && (
                                <p className="text-base text-gray-500 italic">
                                    {page.textEn}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
