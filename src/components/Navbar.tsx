import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-semibold">
        FRAMEWORKD <span className="text-gray-400">/</span> STRUCTURAL ENGINE
      </div>
      <div className="flex items-center gap-3">
        <span className="px-4 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">TEAM PLAN</span>
        <div className="w-8 h-8 bg-gray-800 text-white text-sm font-medium flex items-center justify-center rounded-full">KN</div>
      </div>
    </nav>
  );
};

export default Navbar;