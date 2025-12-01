import React, { forwardRef, useCallback, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { StoryMetadata, LanguageMode } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '../../utils/url';

interface FlipBookViewerProps {
  story: StoryMetadata;
  styleId: string;
  langMode: LanguageMode;
}

// Ensure pages receive ref for react-pageflip
const Page = forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div className="demoPage bg-[#FFFBF0] shadow-inner h-full overflow-hidden" ref={ref} style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'}}>
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")'}}></div>
        {props.children}
    </div>
  );
});

export const FlipBookViewer: React.FC<FlipBookViewerProps> = ({ story, styleId, langMode }) => {
  const bookRef = useRef<any>(null);

  // Helper to construct image path
  const getImagePath = (pageIndex: number) => {
    return getAssetUrl(`/stories/${story.id}/${styleId}/page-${pageIndex + 1}.png`);
  };

  const nextFlip = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const prevFlip = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  // Calculate book dimensions
  const width = 1000;
  const height = 700;

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      
      {/* Prev Button */}
      <button onClick={prevFlip} className="hidden absolute left-4 md:left-10 z-40 bg-yellow-400 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 border-white text-white hover:bg-yellow-300 shadow-lg transition-transform active:scale-95">
        <ArrowLeft strokeWidth={3} />
      </button>

      {/* Book Container */}
      <div className="shadow-2xl rounded-sm" style={{perspective: '1500px'}}>
        {/* @ts-ignore */}
        <HTMLFlipBook 
            width={width} 
            height={height} 
            size="fixed"
            minWidth={300}
            maxWidth={1200}
            minHeight={400}
            maxHeight={800}
            showCover={true}
            ref={bookRef}
            className="book-shadow"
            style={{boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}
            startPage={0}
        >
            {/* Cover Page */}
            <Page number="0">
                <div className="h-full flex flex-col items-center justify-center p-8 bg-amber-100 text-center border-r border-gray-200">
                    <h1 className="text-4xl font-serif font-bold text-amber-900 mb-4">{story.titleZh}</h1>
                    <h2 className="text-xl font-sans text-amber-700 mb-8">{story.titleEn}</h2>
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-8">
                        <img src={getImagePath(0)} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-gray-500">点击或拖拽翻页</p>
                </div>
            </Page>

            {/* Content Pages: Left Image, Right Text (Side-by-Side) */}
            {story.pages.map((page, index) => (
                <Page key={index} number={(index + 1).toString()}>
                    <div className="h-full flex flex-row relative">
                        {/* Left: Image (50%) */}
                        <div className="w-1/2 h-full p-1 bg-white flex items-center justify-center border-r-4 border-amber-100 border-dashed relative">
                             <div className="w-full h-full rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                                <img 
                                    src={getImagePath(index)} 
                                    alt={`Page ${page.pageNumber}`} 
                                    className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                             </div>
                             {/* Page Number (Left Bottom Center) */}
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 font-bold text-lg">{index + 1}</div>
                        </div>

                        {/* Right: Text (50%) */}
                        <div className="w-1/2 h-full p-4 md:p-6 flex flex-col overflow-y-auto bg-[#FFFBF0] scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                            <div className="my-auto w-full flex flex-col items-center">
                                {/* ZH Text */}
                                {(langMode === 'zh' || langMode === 'dual') && (
                                    <p className="font-serif text-gray-800 text-lg md:text-xl leading-relaxed text-left w-full mb-6">
                                        {page.textZh}
                                    </p>
                                )}

                                {/* Divider */}
                                {langMode === 'dual' && <div className="w-full h-px bg-amber-200 mb-6 shrink-0"></div>}

                                {/* EN Text */}
                                {(langMode === 'en' || langMode === 'dual') && (
                                    <p className="font-sans text-gray-600 text-base italic leading-relaxed text-left w-full">
                                        {page.textEn}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Page>
            ))}

            {/* Back Cover */}
            <Page number="End">
                 <div className="h-full flex flex-col items-center justify-center bg-amber-100 border-l border-gray-200">
                     <h3 className="text-2xl font-serif text-amber-800">The End</h3>
                     <p className="text-amber-600 mt-2">完</p>
                     <button onClick={() => window.location.href='/'} className="mt-8 px-6 py-2 bg-white rounded-full text-amber-600 font-bold shadow hover:bg-amber-50">再读一本</button>
                 </div>
            </Page>

        </HTMLFlipBook>
      </div>

      {/* Next Button */}
      <button onClick={nextFlip} className="hidden absolute right-4 md:right-10 z-40 bg-green-400 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 border-white text-white hover:bg-green-300 shadow-lg transition-transform active:scale-95">
        <ArrowRight strokeWidth={3} />
      </button>

    </div>
  );
};
