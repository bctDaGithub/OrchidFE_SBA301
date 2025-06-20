import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginForm from './components/LoginForm';
import OrchidAdmin from './components/admin/OrchidAdmin';
import UserAdmin from './components/admin/UserAdmin';
import MyProfile from './components/MyProfile';
import './App.css';
import Home from './components/Home';
import DetailOrchid from './components/admin/DetailOrchid';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import OrderManagement from './components/admin/OrderManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<Home />} />

            {/* Protected Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orchids"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <OrchidAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <OrderManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orchid/:id"
              element={
                <ProtectedRoute>
                  <DetailOrchid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-tracking"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;