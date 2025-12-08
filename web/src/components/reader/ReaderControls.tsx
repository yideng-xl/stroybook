import React from 'react';
import { Home, Play, Pause, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageMode } from '../../types';
import { ReadingTimer } from './ReadingTimer';

interface ReaderControlsProps {
  title: string;
  styles: { id: string; name: string; nameEn?: string }[];
  currentStyle: string;
  langMode: LanguageMode;
  isPlaying: boolean;
  autoPlay: boolean;
  hasAudio: boolean;
  onStyleChange: (style: string) => void;
  onLangChange: (mode: LanguageMode) => void;
  onTogglePlay: () => void;
  onToggleAutoPlay: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  title,
  styles,
  currentStyle,
  langMode,
  isPlaying,
  autoPlay,
  hasAudio,
  onStyleChange,
  onLangChange,
  onTogglePlay,
  onToggleAutoPlay
}) => {
  const getStyleName = (s: { name: string; nameEn?: string }) => {
      if (langMode === 'en' && s.nameEn) return s.nameEn;
      return s.name;
  };

  return (
    <div className="fixed top-0 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-[#A6662C] border-4 border-[#754215] rounded-b-xl px-4 md:px-8 py-3 shadow-lg flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 pointer-events-auto transform -translate-y-2 hover:translate-y-0 transition-transform">
        <Link to="/" className="flex items-center gap-2 text-white font-bold hover:text-yellow-200 shrink-0">
          <Home size={20} />
          <span className="hidden md:inline">回书架</span>
        </Link>
        
        <div className="h-6 w-0.5 bg-[#754215]/30 hidden md:block"></div>
        
        <span className="text-white font-serif text-lg md:text-2xl tracking-widest drop-shadow-md truncate max-w-[150px] md:max-w-xs text-center flex-1 flex items-center justify-center gap-2 order-last md:order-none w-full md:w-auto">
          {title}
          <ReadingTimer />
        </span>
        
        <div className="h-6 w-0.5 bg-[#754215]/30 hidden md:block"></div>
        
        <div className="flex gap-2 shrink-0 items-center">
           {/* Audio Controls */}
           <button 
             onClick={onTogglePlay}
             disabled={!hasAudio}
             className={`p-1 rounded-full ${hasAudio ? 'text-white hover:text-yellow-200' : 'text-gray-400 cursor-not-allowed'}`}
             title={hasAudio ? (isPlaying ? "暂停" : "播放语音") : "本页无语音"}
           >
             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
           </button>

           <div 
             className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded border border-[#754215]/50 ${autoPlay ? 'bg-yellow-200/20 text-yellow-200' : 'text-white/70'}`}
             onClick={onToggleAutoPlay}
             title="开启翻页自动朗读"
           >
             <Volume2 size={16} />
             <span className="text-xs font-bold">自动</span>
           </div>

           <select 
             value={langMode}
             onChange={(e) => onLangChange(e.target.value as LanguageMode)}
             className="bg-white text-[#754215] px-2 py-1 rounded-full font-bold text-xs md:text-sm border-2 border-[#754215] hover:bg-yellow-100 outline-none cursor-pointer"
           >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="dual">中英对照</option>
           </select>

           <select 
             value={currentStyle}
             onChange={(e) => onStyleChange(e.target.value)}
             className="bg-[#754215] text-white text-xs md:text-sm rounded-lg border-none outline-none py-1 px-2 cursor-pointer min-w-[80px]"
           >
             {styles.map(s => (
               <option key={s.id} value={s.id}>🎨 {getStyleName(s)}</option>
             ))}
           </select>
        </div>
      </div>
    </div>
  );
};
