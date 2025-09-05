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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {/* Background decoration for larger screens */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-100/20 to-primary-200/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gold-100/20 to-gold-200/10 rounded-full blur-3xl" />
      </div>
      
      {/* Main container with responsive max-width */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen bg-white/80 backdrop-blur-sm shadow-large md:shadow-none">
        <Header 
          title={title}
          showBackButton={showBackButton}
          onBack={onBack}
          actions={headerActions}
        />
        
        <main className={`relative z-10 transition-all duration-300 ${
          showBottomNav ? 'pb-24' : 'pb-6'
        }`}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {showBottomNav && <BottomNavigation />}
      
    </div>
  );
};

export default Layout;