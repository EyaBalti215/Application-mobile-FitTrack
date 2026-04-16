import { createContext, useState } from 'react';

export const AuthContext = createContext({
  token: null,
  setToken: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
