"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMutation } from "@apollo/client/react";
import { REGISTER } from "@/graphql/mutations";
import type { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RegisterResponse {
  register: {
    token: string;
    user: User;
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | undefined>();
  const [registerMutation] = useMutation<RegisterResponse>(REGISTER);

  // Map NextAuth session to our AuthState
  const authState: AuthState = {
    user: session?.user as User | null,
    token: session?.accessToken || null,
    isAuthenticated: status === "authenticated",
  };

  const login = async (email: string, password: string) => {
    setError(undefined);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(undefined);
    try {
      // 1. Register via GraphQL
      const { data } = await registerMutation({
        variables: {
          input: { name, email, password },
        },
      });

      if (data?.register) {
        // 2. Auto-login via NextAuth
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error("Registration successful but auto-login failed");
        }
      } else {
        throw new Error("Registration failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register. Please try again.";
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    signOut({ redirect: true, callbackUrl: "/login" });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    isLoading: status === "loading",
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
