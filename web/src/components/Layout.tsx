import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBEB] font-sans text-gray-800" style={{ backgroundImage: 'radial-gradient(#FDE68A 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      {children}
    </div>
  );
};
