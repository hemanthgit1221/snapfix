import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - Fixed on all screen sizes */}
        <Sidebar />
        
        {/* Main Content - Add margin for fixed sidebar on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <Header />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
