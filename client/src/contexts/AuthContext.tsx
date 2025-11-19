"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/api";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get current user from API
    const loadUser = async () => {
      try {
        // Check if we have a token
        const accessToken = localStorage.getItem("access_token") || 
                           localStorage.getItem("token") || 
                           localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refresh_token");
        
        // If we have refresh token but no access token, try to refresh
        if (refreshToken && !accessToken) {
          console.log("No access token but have refresh token, attempting refresh...");
          try {
            const newAccessToken = await apiClient.refreshToken();
            if (newAccessToken) {
              // Retry getting user with new token
              try {
                const currentUser = await apiClient.getCurrentUser();
                setUser(currentUser);
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                setIsLoading(false);
                return;
              } catch (error) {
                console.warn("Failed to get user after token refresh:", error);
              }
            }
          } catch (error) {
            console.warn("Failed to refresh token:", error);
          }
        }
        
        if (accessToken) {
          // Try to get current user from API
          try {
            const currentUser = await apiClient.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          } catch (error) {
            // If API call fails, try localStorage fallback
            console.warn("Failed to get user from API, using localStorage:", error);
            const savedUser = localStorage.getItem("currentUser");
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch (parseError) {
                console.error("Failed to parse saved user:", parseError);
              }
            }
          }
        } else {
          // No token, check localStorage for saved user (but don't trust it for auth)
          const savedUser = localStorage.getItem("currentUser");
          if (savedUser) {
            try {
              // Only use saved user if we have refresh token (token might have expired)
              if (refreshToken) {
                setUser(JSON.parse(savedUser));
              } else {
                // No tokens at all, clear saved user
                localStorage.removeItem("currentUser");
              }
            } catch (parseError) {
              console.error("Failed to parse saved user:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await apiClient.login(username, password);
    if (response.user) {
      setUser(response.user);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    // Also call API logout if available
    apiClient.logout().catch(console.error);
  };

  // Always provide the context value, even if there's an error
  const contextValue: AuthContextType = {
    user,
    isLoading,
    setUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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

