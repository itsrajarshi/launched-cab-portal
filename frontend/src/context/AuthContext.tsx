"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  role: "company" | "vendor";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: "company" | "vendor") => void;
  logout: () => void;
  loggingOut: boolean;
  setLoggingOut: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Restore user from localStorage if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const login = (email: string, role: "company" | "vendor") => {
    const userObj = { email, role };
    setUser(userObj);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userObj));
    }
  };
  const logout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoggingOut(false);
    }, 1200);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loggingOut, setLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
