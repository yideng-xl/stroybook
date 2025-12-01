import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStoryData } from '../hooks/useStoryData';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { useMedia } from '../hooks/useMedia';
import { ReaderControls } from '../components/reader/ReaderControls';
import { LanguageMode, StoryStyle } from '../types';

import { FlipBookViewer } from '../components/reader/FlipBookViewer';
import { ScrollViewer } from '../components/reader/ScrollViewer';

const ReadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Fetch Story Data
  const { story, loading: storyLoading, error: storyError } = useStoryData(id);
  
  // 2. Fetch Manifest (to know available styles for this story)
  // Optimization: In a real app, we might store manifest in a global context to avoid refetching.
  const { manifest } = useStoryManifest();
  
  // 3. State Management
  const [langMode, setLangMode] = useState<LanguageMode>('zh');
  const [currentStyle, setCurrentStyle] = useState<string>('');
  
  // 4. Responsive Check
  const isDesktop = useMedia('(min-width: 768px)');

  // Initialize style from URL or default
  useEffect(() => {
    if (story && manifest.length > 0) {
      const urlStyle = searchParams.get('style');
      const manifestItem = manifest.find(m => m.id === story.id);
      
      if (urlStyle) {
        setCurrentStyle(urlStyle);
      } else if (manifestItem) {
        // Default to first style
        const defaultStyle = manifestItem.defaultStyle || manifestItem.styles[0]?.id;
        if (defaultStyle) {
          setCurrentStyle(defaultStyle);
          // Update URL without reloading
          setSearchParams({ style: defaultStyle }, { replace: true });
        }
      }
    }
  }, [story, manifest, searchParams, setSearchParams]);

  // Derived: Available Styles
  const availableStyles: StoryStyle[] = manifest.find(m => m.id === id)?.styles || [];

  if (storyLoading) return <div className="min-h-screen bg-[#5D4037] flex items-center justify-center text-white">正在打开绘本...</div>;
  if (storyError || !story) return <div className="min-h-screen bg-[#5D4037] flex items-center justify-center text-red-300">无法加载故事: {storyError}</div>;

  // Render Logic
  const ViewerComponent = isDesktop ? FlipBookViewer : ScrollViewer;

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#5D4037] flex flex-col overflow-hidden" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.05-8.95-20-20-20s-20 8.95-20 20 8.95 20 20 20 20-8.95 20-20zM0 20c0-11.05 8.95-20 20-20s20 8.95 20 20-8.95 20-20 20-20-8.95-20-20z' fill='%236d4c41' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")` 
           }}>
        
        <ReaderControls 
          title={story.titleZh}
          styles={availableStyles}
          currentStyle={currentStyle}
          langMode={langMode}
          onStyleChange={(style) => {
            setCurrentStyle(style);
            setSearchParams({ style });
          }}
          onLangChange={setLangMode}
        />

        <div className="flex-1 flex items-center justify-center relative">
           <ViewerComponent 
              story={story} 
              styleId={currentStyle} 
              langMode={langMode} 
           />
        </div>

      </div>
    </Layout>
  );
};

export default ReadPage;