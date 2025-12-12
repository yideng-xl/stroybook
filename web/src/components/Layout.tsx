import React from 'react';
import { Header } from './Header'; // Ensure Header is imported

export const Layout: React.FC<{ children: React.ReactNode; showFooter?: boolean; showHeader?: boolean }> = ({ children, showFooter, showHeader = true }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBEB] font-sans text-gray-800" style={{ backgroundImage: 'radial-gradient(#FDE68A 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && (
        <footer className="bg-white/80 backdrop-blur-sm py-8 mt-auto border-t border-yellow-200">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© 2025 奇妙绘本馆 StoryBook. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for kids.</p>
          </div>
        </footer>
      )}
    </div>
  );
};
