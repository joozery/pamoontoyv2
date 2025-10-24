import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

const PublicLayout = () => {
  const location = useLocation();
  
  // Hide MobileHeader on product detail pages
  const isProductDetailPage = location.pathname.startsWith('/product/');
  
  return (
    <div className="flex flex-col min-h-screen">
      <DesktopHeader />
      {!isProductDetailPage && <MobileHeader />}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default PublicLayout;
