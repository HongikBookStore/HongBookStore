import { createContext, useState } from 'react';

export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(()=>localStorage.getItem('jwt'));
  const [user,  setUser ] = useState(()=>JSON.parse(localStorage.getItem('user')||'null'));

  const save = (t,u) => {
    localStorage.setItem('jwt', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  return (
    <AuthCtx.Provider value={{ token, user, save }}>
      {children}
    </AuthCtx.Provider>
  );
}