import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';
import MobileHeader from './MobileHeader';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default PublicLayout;
