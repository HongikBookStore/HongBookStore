// src/main/frontend/src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles.js';
import Header from './components/Header/Header.jsx';
import Hero from './components/Hero/Hero.jsx';
import Footer from './components/Footer/Footer.jsx';
import Marketplace from './pages/Marketplace/Marketplace.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import FindId from './pages/FindId/FindId.jsx';
import FindPw from './pages/FindPw/FindPw.jsx';

// 임시 컴포넌트
const Community = () => <div>Community Page</div>;
const Map = () => <div>Map Page</div>;

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt'); // key 이름 변경

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);

                if (payload.exp && payload.exp < now) {
                    localStorage.removeItem('jwt');
                    window.location.href = '/login';
                }
            } catch (e) {
                console.error('토큰 파싱 에러:', e);
                localStorage.removeItem('jwt');
                window.location.href = '/login';
            }
        }

        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '20%' }}>로딩 중...</div>;
    }

    return (
        <Router>
            <GlobalStyles />
            <Header />
            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/community" element={<Community />} />
                <Route path="/map" element={<Map />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/find-id" element={<FindId />} />
                <Route path="/find-pw" element={<FindPw />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
