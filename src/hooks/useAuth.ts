import { useState, useEffect, createContext, useContext } from "react";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check sessionStorage first (non-persistent), then localStorage (persistent)
    const sessionUser = sessionStorage.getItem("starlogs_user");
    if (sessionUser) return JSON.parse(sessionUser);
    
    const savedUser = localStorage.getItem("starlogs_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [rememberUser, setRememberUser] = useState<boolean>(() => {
    return localStorage.getItem("starlogs_remember") === "true";
  });

  useEffect(() => {
    if (user) {
      if (rememberUser) {
        localStorage.setItem("starlogs_user", JSON.stringify(user));
        sessionStorage.removeItem("starlogs_user");
      } else {
        sessionStorage.setItem("starlogs_user", JSON.stringify(user));
        localStorage.removeItem("starlogs_user");
      }
    } else {
      localStorage.removeItem("starlogs_user");
      sessionStorage.removeItem("starlogs_user");
      localStorage.removeItem("starlogs_remember");
    }
  }, [user, rememberUser]);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    // Simulated login - will be connected to Cloud later
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setRememberUser(rememberMe);
    if (rememberMe) {
      localStorage.setItem("starlogs_remember", "true");
    }
    
    // For demo purposes, accept any valid email/password
    const mockUser: UserProfile = {
      id: crypto.randomUUID(),
      email,
      username: email.split("@")[0],
    };
    setUser(mockUser);
    return true;
  };

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    // Simulated signup - will be connected to Cloud later
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: UserProfile = {
      id: crypto.randomUUID(),
      email,
      username: username || email.split("@")[0],
    };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setRememberUser(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };
}

export { AuthContext };
