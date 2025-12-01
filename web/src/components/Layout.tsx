import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-gray-800" style={{ backgroundImage: 'radial-gradient(#FDE68A 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      {/* Navbar - Only visible on Home usually, but let's keep a simplified version globally or just handle in pages. 
          Actually, per prototype, Home has a specific Header. ReadPage has a different one.
          So Layout might just be a container. Let's make it a simple wrapper for now. 
      */}
      {children}
    </div>
  );
};
