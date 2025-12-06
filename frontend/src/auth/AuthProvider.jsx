import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("marbel_access");
    if (token) {
      setUser({ loggedIn: true });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (data) => {
    const res = await api.login(data);

    // ✅ FORCE REFRESH USER AFTER TOKEN IS SAVED
    setUser({ loggedIn: true });

    return res;
  };

  const register = async (data) => {
    return await api.register(data);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
