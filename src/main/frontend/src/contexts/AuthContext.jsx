import { createContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../api/auth'; // api/auth.js의 logout 함수 import

// Context의 기본 모양을 정의합니다. 자동완성 등 개발 편의성을 높여줍니다.
export const AuthCtx = createContext({
  token: null,
  user: null,
  isLoggedIn: false,
  save: (token, user) => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!token;

  const save = (newToken, newUser) => {
    localStorage.setItem('accessToken', newToken);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      // api/auth.js의 logout을 호출하여 서버와 통신하고 로컬 스토리지를 정리합니다.
      await apiLogout();
    } finally {
      // React에게 상태가 변했음을 알려 UI를 다시 그리도록 합니다.
      // 이 부분이 바로 UI가 즉시 바뀌는 마법의 코드입니다!
      setToken(null);
      setUser(null);
    }
  };

  const contextValue = {
    token,
    user,
    isLoggedIn, // isLoggedIn 추가
    save,
    logout,     // logout 함수 추가
  };

  return (
      <AuthCtx.Provider value={contextValue}>
        {children}
      </AuthCtx.Provider>
  );
}
