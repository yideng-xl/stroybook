import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStoryData } from '../hooks/useStoryData';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { useMedia } from '../hooks/useMedia';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ReaderControls } from '../components/reader/ReaderControls';
import { LanguageMode, StoryStyle } from '../types';

import { FlipBookViewer } from '../components/reader/FlipBookViewer';
import { ScrollViewer } from '../components/reader/ScrollViewer';

const ReadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openLoginModal } = useAuth(); // Add this

  // 1. Fetch Story Data
  const { story, loading: storyLoading, error: storyError } = useStoryData(id);

  // Handle specific error for rate limit
  useEffect(() => {
    if (storyError && storyError.includes('403')) {
        if(confirm('您今天已免费阅读了2个故事！\n登录后可无限阅读所有绘本。\n要去登录吗？')) {
            openLoginModal();
            // We should also probably redirect to Home because background is blocked? 
            // Or stay here and wait for login success to retry?
            // For MVP, redirect home THEN open modal is safer, or just open modal.
            // Let's redirect home to avoid broken state background
            navigate('/');
            // Small timeout to allow navigate to happen, then open modal? 
            // Actually, AuthContext state persists across routes.
            setTimeout(() => openLoginModal(), 100);
        } else {
            navigate('/');
        }
    }
  }, [storyError, navigate, openLoginModal]);
  
  // 2. Fetch Manifest (to know available styles for this story)
  // Optimization: In a real app, we might store manifest in a global context to avoid refetching.
  const { manifest } = useStoryManifest();
  
  // 3. State Management
  const [langMode, setLangMode] = useState<LanguageMode>('zh');
  const [currentStyle, setCurrentStyle] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // 4. Responsive Check
  const isDesktop = useMedia('(min-width: 768px)');

  // 5. Timer for Reading Duration
  useEffect(() => {
    const startTime = Date.now();
    
    // Save progress function
    const saveProgress = () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 0 && id) {
             api.history.save({ 
                storyId: id, 
                styleName: currentStyle, 
                currentPage: currentPage, 
                durationSeconds: duration 
            }).catch(() => {}); // Ignore error on exit
        }
    };

    return () => {
        saveProgress();
    };
  }, [id, currentStyle, currentPage]); // Re-save if page changes? Actually we want to save accumulate duration. 
  // Wait, if we depend on currentPage, every page flip triggers saveProgress (and resets timer!).
  // Correct logic:
  // Timer should NOT reset on page flip. It should count total time in this session.
  // BUT we need latest currentPage when unmounting.
  // Solution: Use a ref for currentPage.

  const currentPageRef = React.useRef(1);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  useEffect(() => {
    const startTime = Date.now();
    const save = () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 0 && id) {
             api.history.save({ 
                storyId: id, 
                styleName: currentStyle, 
                currentPage: currentPageRef.current, 
                durationSeconds: duration 
            }).catch(() => {});
        }
    };
    return save;
  }, [id, currentStyle]); // Only reset timer if story/style changes. Page flip updates ref.

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
              onPageChange={setCurrentPage}
           />
        </div>

      </div>
    </Layout>
  );
};

export default ReadPage;