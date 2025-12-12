import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStoryData } from '../hooks/useStoryData';
import { useStoryManifest } from '../hooks/useStoryManifest';
import { useMedia } from '../hooks/useMedia';
import { ReaderControls } from '../components/reader/ReaderControls';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { LanguageMode, StoryStyle } from '../types';
import { api } from '../api/client';

import { FlipBookViewer } from '../components/reader/FlipBookViewer';
import { ScrollViewer } from '../components/reader/ScrollViewer';

const ReadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Fetch Story Data
  const { story, loading: storyLoading, error: storyError } = useStoryData(id);

  // ... (Error handling code kept same)

  // 2. Fetch Manifest
  const { manifest } = useStoryManifest();

  // 3. State Management
  const [langMode, setLangMode] = useState<LanguageMode>('zh');
  const [currentStyle, setCurrentStyle] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false); // Auto-play state

  // Audio Player Hook
  const { isPlaying, play, pause, stop } = useAudioPlayer();

  // 4. Responsive Check
  const isDesktop = useMedia('(min-width: 768px)');

  // Timer Logic
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!story) return;
    startTimeRef.current = Date.now();

    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      if (duration > 1) {
        api.history.record({
          storyId: story.id,
          styleName: currentStyle,
          currentPage: currentPage,
          durationSeconds: Math.round(duration)
        }).catch(() => { });
      }
    };
  }, [currentPage, currentStyle, story?.id]);

  // Initialize style from URL or default
  useEffect(() => {
    if (story) {
      const urlStyle = searchParams.get('style');

      if (urlStyle) {
        setCurrentStyle(urlStyle);
      } else if (story.selectedStyleId) {
        // Fallback to the style used for generation
        setCurrentStyle(story.selectedStyleId);
        setSearchParams({ style: story.selectedStyleId }, { replace: true });
      } else if (manifest.length > 0) {
        // Fallback to manifest default
        const manifestItem = manifest.find(m => m.id === story.id);
        if (manifestItem) {
          const defaultStyle = manifestItem.defaultStyle || manifestItem.styles[0]?.id;
          if (defaultStyle) {
            setCurrentStyle(defaultStyle);
            setSearchParams({ style: defaultStyle }, { replace: true });
          }
        }
      }
    }
  }, [story, manifest, searchParams, setSearchParams]);

  // Derived: Available Styles
  // Ensure we display the selected style even if not fully in manifest yet
  const availableStyles: StoryStyle[] = manifest.find(m => m.id === id)?.styles || [];
  // If user story has a selected style but it's not in manifest (e.g. sync lag), we should ideally construct it.
  // For now, rely on manifest.

  if (storyLoading) return <div className="min-h-screen bg-[#5D4037] flex items-center justify-center text-white">正在打开绘本...</div>;
  if (storyError || !story) return <div className="min-h-screen bg-[#5D4037] flex items-center justify-center text-red-300">无法加载故事: {storyError}</div>;

  // Determine current audio URL based on page and language
  // NOTE: story.pages[0] is Page 1. currentPage is 1-based. index = currentPage - 1.
  const currentPageData = story.pages && story.pages[currentPage - 1];
  const currentAudioUrl = langMode === 'en' ? currentPageData?.audioUrlEn : currentPageData?.audioUrlZh;
  // If dual mode, default to Zh audio? Or allow toggle? Requirement said default Zh or toggle. Let's default Zh for dual.
  const activeAudioUrl = langMode === 'dual' ? currentPageData?.audioUrlZh : currentAudioUrl;

  // Render Logic
  const ViewerComponent = isDesktop ? FlipBookViewer : ScrollViewer;

  // Final safeguard for styleId passed to viewer
  const viewerStyleId = currentStyle || story.selectedStyleId || '';

  return (
    <Layout showHeader={false}>
      <div className="relative min-h-screen bg-[#5D4037] flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.05-8.95-20-20-20s-20 8.95-20 20 8.95 20 20 20 20-8.95 20-20zM0 20c0-11.05 8.95-20 20-20s20 8.95 20 20-8.95 20-20 20-20-8.95-20-20z' fill='%236d4c41' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}>

        <ReaderControls
          title={story.titleZh}
          styles={availableStyles}
          currentStyle={viewerStyleId}
          langMode={langMode}
          isPlaying={isPlaying}
          autoPlay={autoPlay}
          hasAudio={!!activeAudioUrl}
          onStyleChange={(style) => {
            setCurrentStyle(style);
            setSearchParams({ style });
          }}
          onLangChange={setLangMode}
          onTogglePlay={() => {
            if (isPlaying) {
              pause();
            } else if (activeAudioUrl) {
              play(activeAudioUrl);
            }
          }}
          onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
        />

        <div className="flex-1 flex items-center justify-center relative">
          <ViewerComponent
            story={story}
            styleId={viewerStyleId}
            langMode={langMode}
            onPageChange={(page) => {
              setCurrentPage(page);
              stop(); // Stop previous audio
            }}
            // Pass audio props to viewer for auto-play logic
            autoPlay={autoPlay}
            audioUrl={activeAudioUrl}
            playAudio={play}
          />
        </div>

      </div>
    </Layout>
  );
};

export default ReadPage;