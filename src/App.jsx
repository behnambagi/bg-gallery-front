import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import InquiriesPage from './pages/InquiriesPage';
import InquiryDetailPage from './pages/InquiryDetailPage';
import SubscriptionPage from './pages/SubscriptionPage';
import WorkingHoursPage from './pages/WorkingHoursPage';
import LocationPage from './pages/LocationPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <div className="App min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/products/add" element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            } />
            
            <Route path="/products/:id" element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/products/edit/:id" element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/inquiries" element={
              <ProtectedRoute>
                <InquiriesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/inquiries/:id" element={
              <ProtectedRoute>
                <InquiryDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            
            <Route path="profile/working-hours" element={
              <ProtectedRoute>
                <WorkingHoursPage />
              </ProtectedRoute>
            } />
            
            <Route path="profile/location" element={
              <ProtectedRoute>
                <LocationPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
