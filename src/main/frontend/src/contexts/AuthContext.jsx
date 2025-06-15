import { createContext, useState } from 'react';

export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwt'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch {
      return null;
    } //undefined 해결
  });

  const save = (t, u) => {
    localStorage.setItem('jwt', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  return (
      <AuthCtx.Provider value={{ token, user, save }}>
        {children}
      </AuthCtx.Provider>
  );
}
