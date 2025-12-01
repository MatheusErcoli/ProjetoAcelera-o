import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiUrl } from '@/config/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'PRESTADOR' | 'CONTRATANTE';
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      // Verifica se o token é válido fazendo uma requisição ao backend
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        // Token inválido
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login');
      }

      const data = await response.json();
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('providerId');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
