import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginReq, logoutReq, signupReq } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check existing session on mount
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const res = await loginReq(email, password);
    setUser(res.user);
    return res.user;
  };

  const signup = async (name, email, password) => {
    const res = await signupReq(name, email, password);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await logoutReq();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}