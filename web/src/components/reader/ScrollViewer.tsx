import React, { useEffect, useRef } from 'react';
import { StoryMetadata, LanguageMode } from '../../types';
import { Sparkles, Castle } from 'lucide-react';
import { getAssetUrl } from '../../utils/url';

interface ScrollViewerProps {
  story: StoryMetadata;
  styleId: string;
  langMode: LanguageMode;
  onPageChange?: (page: number) => void;
  autoPlay: boolean;
  audioUrl?: string;
  playAudio: (url: string) => Promise<void>;
}

export const ScrollViewer: React.FC<ScrollViewerProps> = ({ story, styleId, langMode, onPageChange, autoPlay, audioUrl, playAudio }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const articleRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
      // Initialize IntersectionObserver to track visible page
      observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  const pageIndex = Number(entry.target.getAttribute('data-page-index'));
                  if (!isNaN(pageIndex) && onPageChange) {
                      onPageChange(pageIndex + 1);
                  }
              }
          });
      }, { threshold: 0.6 }); // 60% visible

      articleRefs.current.forEach((el) => {
          if (el) observerRef.current?.observe(el);
      });

      return () => observerRef.current?.disconnect();
  }, [story.pages.length, onPageChange]);

  // Auto-play Effect
  React.useEffect(() => {
      if (autoPlay && audioUrl) {
          playAudio(audioUrl);
      }
  }, [audioUrl, autoPlay, playAudio]);

  const getImagePath = (pageIndex: number) => {
    return getAssetUrl(`/stories/${story.id}/${styleId}/page-${pageIndex + 1}.png`);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 pt-20 px-4 space-y-8">
      {/* Title Card */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-shadow">{story.titleZh}</h1>
        <p className="text-white/80">{story.titleEn}</p>
      </div>

      {story.pages.map((page, index) => (
        <article 
            key={index} 
            ref={el => articleRefs.current[index] = el}
            data-page-index={index}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" 
            style={{animationDelay: `${index * 100}ms`}}
        >
            
            {/* Image Card */}
            <div className={`bg-white p-2 rounded-3xl shadow-lg transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} transition-transform`}>
                <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden relative">
                    <img 
                        src={getImagePath(index)} 
                        alt={`Page ${page.pageNumber}`} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/40 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
                        {page.pageNumber} / {story.pages.length}
                    </div>
                </div>
            </div>

            {/* Text Bubble */}
            <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-sm relative">
                {/* Decoration Icons */}
                {index % 2 === 0 ? (
                    <div className="absolute -top-3 -left-2 text-yellow-400"><Sparkles size={24} fill="currentColor" /></div>
                ) : (
                    <div className="absolute -bottom-3 -right-2 text-pink-400"><Castle size={24} /></div>
                )}

                <div className="space-y-3">
                    {/* ZH */}
                    {(langMode === 'zh' || langMode === 'dual') && (
                        <p className="text-lg leading-relaxed text-gray-700 font-medium">
                            {page.textZh}
                        </p>
                    )}

                    {/* Divider */}
                    {langMode === 'dual' && <div className="border-t border-dashed border-gray-200"></div>}

                    {/* EN */}
                    {(langMode === 'en' || langMode === 'dual') && (
                        <p className="text-gray-500 text-sm font-sans italic">
                            {page.textEn}
                        </p>
                    )}
                </div>
                
                {/* Speech Bubble Tail */}
                <div className="absolute left-8 -top-3 w-4 h-4 bg-white border-t-2 border-l-2 border-blue-100 transform rotate-45"></div>
            </div>

        </article>
      ))}

      {/* Footer */}
      <div className="text-center py-8 text-white/60 text-sm">
        —— End ——
      </div>
    </div>
  );
};
