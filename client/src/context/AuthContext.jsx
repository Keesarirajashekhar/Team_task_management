import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// create axios instance with base url
const api = axios.create({
  baseURL: API_URL,
});

// add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (err) {
          console.error("Failed to load user:", err);
          // token might be expired, clear it
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post("/auth/signup", { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export default AuthContext;
