import { useState, createContext, useContext } from 'react';

interface IAuthContext {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// 1. Create the context
const AuthContext = createContext<IAuthContext>(null as any);

// 2. Create the "Provider"
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // For the demo, we'll start in the "logged in" state.
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
    {children}
    </AuthContext.Provider>
  );
}

// 3. Create the "useAuth" hook
export function useAuth() {
  return useContext(AuthContext);
}