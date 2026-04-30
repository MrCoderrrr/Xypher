import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const AuthContext = createContext(null);
const home = (role) => (role === "admin" ? "/admin" : role === "creator" ? "/creator-dashboard" : "/explore");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("xypher_token"));
  const [loading, setLoading] = useState(Boolean(token));
  const navigate = useNavigate();

  const save = (data) => {
    localStorage.setItem("xypher_token", data.token);
    setToken(data.token);
    setUser(data.user);
    navigate(home(data.user.role));
  };
  const login = async (email, password) => save((await api.post("/auth/login", { email, password })).data);
  const register = async (name, email, password, role) => save((await api.post("/auth/register", { name, email, password, role })).data);
  const logout = () => { localStorage.removeItem("xypher_token"); setToken(null); setUser(null); navigate("/login"); };
  const fetchMe = async () => {
    try { setUser((await api.get("/auth/me")).data.user); } finally { setLoading(false); }
  };
  useEffect(() => { token ? fetchMe() : setLoading(false); }, []);

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchMe, refetchUser: fetchMe }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
