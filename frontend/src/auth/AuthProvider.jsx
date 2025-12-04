// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api.js';
import { setNavigate } from './axiosInstance.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // give navigate() to axios for 401 auto-redirects
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // INIT — check refresh token, try silent login
  useEffect(() => {
    (async () => {
      try {
        const refresh = api.getSavedRefreshToken?.();
        if (refresh) {
          const session = await api.refresh();
          setUser(session?.user || {});
        }
      } catch (err) {
        await api.logout?.();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // LOGIN
  // LOGIN
async function doLogin(email, password) {
  try {
    const res = await api.login({ email, password });

    // res = { user, access, refresh, raw }
    setUser(res.user || { email });

    return res;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed";
    throw new Error(msg);
  }
}

  // REGISTER (clean error handling)
  async function doRegister(name, email, password) {
    try {
      const res = await api.register({ name, email, password });
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      throw new Error(msg);
    }
  }

  // LOGOUT
  async function doLogout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        doLogin,
        doRegister,
        doLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
