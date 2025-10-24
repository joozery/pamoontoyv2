
import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import AdminLayout from '@/components/admin/AdminLayout';
import PublicLayout from '@/components/public/PublicLayout';
import Home from '@/components/public/Home';
import UserAuth from '@/components/public/UserAuth';
import Profile from '@/components/public/Profile';
import Orders from '@/components/public/Orders';
import OrderDetail from '@/components/public/OrderDetail';
import Favorites from '@/components/public/Favorites';
import Search from '@/components/public/Search';
import ProductDetail from '@/components/public/ProductDetail';
import MyBids from '@/components/public/MyBids';
import Payment from '@/components/public/Payment';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import ProductManagement from '@/components/ProductManagement';
import ProductAdd from '@/components/ProductAdd';
import ProductEdit from '@/components/ProductEdit';
import UserManagement from '@/components/UserManagement';
import OrderManagement from '@/components/OrderManagement';
import PaymentManagement from '@/components/PaymentManagement';
import AdminUserManagement from '@/components/AdminUserManagement';
import DiscountManagement from '@/components/DiscountManagement';
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
        <Routes location={location}>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="my-bids" element={<MyBids />} />
            <Route path="payment/bulk" element={<Payment />} />
            <Route path="payment/:orderId" element={<Payment />} />
          </Route>
          <Route path="/login" element={<UserAuth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<ProductAdd />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="admins" element={<AdminUserManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="messages" element={<ContactMessages />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
        </Routes>
      <Toaster />
    </>
  );
}

export default App;
