import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles.js';
import Header from './components/Header/Header.jsx';
import Hero from './components/Hero/Hero.jsx';
import Footer from './components/Footer/Footer.jsx';
import { Loading } from './components/ui';
import Marketplace from './pages/Marketplace/Marketplace.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import FindId from './pages/FindId/FindId.jsx';
import FindPw from './pages/FindPw/FindPw.jsx';
import ResetPassword from './pages/ResetPassword/ResetPassword.jsx';
import Search from './pages/Search/Search.jsx';
import Wanted from './pages/Wanted/Wanted.jsx';
import WantedWrite from './pages/WantedWrite/WantedWrite.jsx';
import MyBookstore from './pages/MyBookstore/MyBookstore.jsx';
import MyTransactions from './pages/MyTransactions/MyTransactions.jsx';
import BookWrite from './pages/BookWrite/BookWrite.jsx';
import BookDetail from './pages/BookDetail/BookDetail';
import ChatList from './pages/Chat/ChatList.jsx';
import ChatRoom from './pages/Chat/ChatRoom.jsx';
import MapPage from './pages/Map/Map.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { WritingProvider } from './contexts/WritingContext';

import OAuth2RedirectHandler from './pages/Login/OAuth2RedirectHandler.jsx';
import FloatingChatBot from './components/ui/FloatingChatBot.jsx';

// 임시 컴포넌트
const Community = () => <div>Community Page</div>;
// const AIChatbot = () => <div style={{padding: '64px 0', textAlign: 'center', fontSize: '1.5rem'}}>AI 챗봇 준비중입니다.</div>;

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken'); // key 이름 변경

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);

                if (payload.exp && payload.exp < now) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken'); // refreshToken도 함께 삭제
                    window.location.href = '/login';
                }
            } catch (e) {
                console.error('토큰 파싱 에러:', e);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <Loading fullScreen text="로딩 중..." />;
    }

    return (
        <AuthProvider>
                <WritingProvider>
                    <Router>
                        <GlobalStyles />
                        <Header />
                        <Routes>
                            <Route path="/" element={<Hero />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/wanted" element={<Wanted />} />
                            <Route path="/wanted/write" element={<WantedWrite />} />
                            <Route path="/bookstore" element={<MyBookstore />} />
                            <Route path="/my-bookstore" element={<MyBookstore />} />
                            <Route path="/my-transactions" element={<MyTransactions />} />
                            <Route path="/bookstore/add" element={<BookWrite />} />
                            <Route path="/book/:id" element={<BookDetail />} />
                            <Route path="/chat" element={<ChatList />} />
                            <Route path="/chat/:id" element={<ChatRoom />} />
                            <Route path="/community" element={<Community />} />
                            <Route path="/hongikmap" element={<MapPage />} />
                            <Route path="/mypage" element={<MyPage />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/find-id" element={<FindId />} />
                            <Route path="/find-pw" element={<FindPw />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/marketplace/:id" element={<BookDetail />} />
                            <Route path="/bookwrite/:id" element={<BookWrite />} />
                            <Route path="/book-write" element={<BookWrite />} />
                            <Route path="/wanted/:id" element={<WantedWrite />} />
                            <Route path="/wantedwrite/:id" element={<WantedWrite />} />
                            <Route path="/oauth/callback"
                                element={<OAuth2RedirectHandler />} />
                        </Routes>
                        <FloatingChatBot />
                        <Footer />
                    </Router>
                </WritingProvider>
            </AuthProvider>
    );
}

export default App;
