import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens, API_BASE_URL } from "./api";

interface User {
  id: number;
  username: string;
  // Add other fields your DB returns
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
    const storedUser = localStorage.getItem("app_user");
      const storedToken = getAccessToken();
      const storedRefresh = getRefreshToken();

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setLoading(false);
        return;
      }

      if (storedRefresh) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefresh }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
              setAuthTokens(data.accessToken, data.refreshToken);
              setToken(data.accessToken);

              const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${data.accessToken}` },
              });

              if (meResponse.ok) {
                const meData = await meResponse.json();
                if (meData.user) {
                  setUser(meData.user);
                  localStorage.setItem("app_user", JSON.stringify(meData.user));
                }
              }
            }
          }
        } catch {
          clearAuthTokens();
          localStorage.removeItem("app_user");
        }
      }

      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("app_user", JSON.stringify(userData));
    setAuthTokens(accessToken, refreshToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("app_user");
    clearAuthTokens();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};