import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

const Layout = ({ 
  children, 
  title, 
  showBackButton = false, 
  onBack, 
  headerActions = [],
  showBottomNav = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto relative">
      <Header 
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
        actions={headerActions}
      />
      
      <main className={`${showBottomNav ? 'pb-20' : 'pb-4'}`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default Layout;