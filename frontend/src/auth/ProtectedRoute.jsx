// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // show a small loader while auth state is resolved
    return <div style={{ padding: 20 }}>Checking session…</div>;
  }

  if (!user) {
    // not authenticated -> redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
