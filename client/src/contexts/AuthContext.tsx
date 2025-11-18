"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/api";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get current user from API
    // For now, we'll use a mock user or get from localStorage
    const loadUser = async () => {
      try {
        // TODO: Replace with actual auth check API
        // const currentUser = await apiClient.getCurrentUser();
        // setUser(currentUser);
        
        // For development: Check localStorage or use mock
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Mock user for development - remove in production
          const mockUser: User = {
            id: 1,
            username: "admin",
            email: "admin@orientclassics.vn",
            full_name: "Administrator",
            role: "thu_ky_hop_phan",
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(mockUser);
          localStorage.setItem("currentUser", JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

