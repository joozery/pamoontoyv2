
import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import AdminLayout from '@/components/admin/AdminLayout';
import PublicLayout from '@/components/public/PublicLayout';
import Home from '@/components/public/Home';
import UserAuth from '@/components/public/UserAuth';
import Profile from '@/components/public/Profile';
import Orders from '@/components/public/Orders';
import Favorites from '@/components/public/Favorites';
import Search from '@/components/public/Search';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import ProductManagement from '@/components/ProductManagement';
import UserManagement from '@/components/UserManagement';
import OrderManagement from '@/components/OrderManagement';
import PaymentVerification from '@/components/PaymentVerification';
import ContactMessages from '@/components/ContactMessages';
import CategoryManagement from '@/components/CategoryManagement';
import ReviewManagement from '@/components/ReviewManagement';

function App() {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>เว็บประมูลสินค้าออนไลน์</title>
        <meta name="description" content="เข้าร่วมประมูลสินค้าสุดพิเศษในราคาที่คาดไม่ถึง" />
      </Helmet>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>
          <Route path="/login" element={<UserAuth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="payments" element={<PaymentVerification />} />
            <Route path="messages" element={<ContactMessages />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;
