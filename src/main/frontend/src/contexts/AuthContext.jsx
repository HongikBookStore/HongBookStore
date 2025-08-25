import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMyInfo, logout as apiLogout } from '../api/auth';
import api from '../lib/api';

// Context의 기본 모양을 정의
export const AuthCtx = createContext({
  token: null,
  user: null,
  isLoggedIn: false,
  isLoading: true, // 사용자 정보를 불러오는 중인지 확인하는 상태
  login: (token) => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 토큰이 있으면 서버에 내 정보를 물어보는 useEffect
  useEffect(() => {
    // axios 인터셉터를 설정해서, 모든 요청에 토큰을 자동으로 담아주도록 설정
    const setAuthHeader = (token) => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    };

    const fetchUser = async () => {
      if (token) {
        setAuthHeader(token); // 헤더 설정
        try {
          const userData = await getMyInfo();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData)); // 추가!
        }  catch (error) {
          // 토큰이 유효하지 않은 경우 등...
          console.error("자동 로그인 실패. 토큰을 삭제합니다.", error);
          // 실패 시 토큰을 지우고 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setToken(null);
          setUser(null);
          setAuthHeader(null);
        }
      }
      setIsLoading(false); // 정보 조회가 끝나면 로딩 상태 해제
    };

    fetchUser();
  }, [token]); // 이 effect는 'token' 상태가 바뀔 때마다 실행

  const isLoggedIn = !!token && !!user;

  // 소셜 로그인 콜백 페이지에서 토큰을 저장할 때 사용할 함수
  const login = (newToken) => {
    localStorage.setItem('accessToken', newToken);
    setToken(newToken); // 토큰 상태를 업데이트하면, 위의 useEffect가 자동으로 실행
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('user'); // 추가!
    }
  };

  const contextValue = {
    token,
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
  };

  return (
      <AuthCtx.Provider value={contextValue}>
        {/* 로딩 중일 때는 아무것도 안 보여주거나 로딩 스피너 */}
        {!isLoading && children}
      </AuthCtx.Provider>
  );
}
