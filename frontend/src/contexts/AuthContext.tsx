"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN, REGISTER } from "@/graphql/mutations";
import { GET_ME } from "@/graphql/queries";
import type { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL mutation response types
interface AuthPayload {
  token: string;
  user: User;
}

interface LoginResponse {
  login: AuthPayload;
}

interface RegisterResponse {
  register: AuthPayload;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const [loginMutation] = useMutation<LoginResponse>(LOGIN);
  const [registerMutation] = useMutation<RegisterResponse>(REGISTER);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (err) {
        // Invalid user data, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(undefined);
    setIsLoading(true);

    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (data?.login) {
        const { token, user } = data.login;

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login. Please check your credentials.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginMutation]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(undefined);
    setIsLoading(true);

    try {
      const { data } = await registerMutation({
        variables: {
          input: { name, email, password },
        },
      });

      if (data?.register) {
        const { token, user } = data.register;

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        throw new Error("Registration failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to register. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [registerMutation]);

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear Apollo cache
    // Note: The client will be reset on next page load

    // Update state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    // Optionally redirect to login page
    // router.push("/login");
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
