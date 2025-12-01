import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageMode } from '../../types';

interface ReaderControlsProps {
  title: string;
  styles: { id: string; name: string }[];
  currentStyle: string;
  langMode: LanguageMode;
  onStyleChange: (style: string) => void;
  onLangChange: (mode: LanguageMode) => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  title,
  styles,
  currentStyle,
  langMode,
  onStyleChange,
  onLangChange
}) => {
  return (
    <div className="fixed top-0 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-[#A6662C] border-4 border-[#754215] rounded-b-xl px-4 md:px-8 py-3 shadow-lg flex items-center gap-3 md:gap-6 pointer-events-auto transform -translate-y-2 hover:translate-y-0 transition-transform">
        <Link to="/" className="flex items-center gap-2 text-white font-bold hover:text-yellow-200">
          <Home size={20} />
          <span className="hidden md:inline">回书架</span>
        </Link>
        
        <div className="h-6 w-0.5 bg-[#754215]/30"></div>
        
        <span className="text-white font-serif text-lg md:text-2xl tracking-widest drop-shadow-md truncate max-w-[150px] md:max-w-xs text-center">
          {title}
        </span>
        
        <div className="h-6 w-0.5 bg-[#754215]/30"></div>
        
        <div className="flex gap-2">
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
             className="bg-[#754215] text-white text-xs md:text-sm rounded-lg border-none outline-none py-1 px-2 cursor-pointer max-w-[100px]"
           >
             {styles.map(s => (
               <option key={s.id} value={s.id}>🎨 {s.name}</option>
             ))}
           </select>
        </div>
      </div>
    </div>
  );
};
