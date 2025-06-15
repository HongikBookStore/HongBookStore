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

// Placeholder components for other pages
const Community = () => <div>Community Page</div>;
const Map = () => <div>Map Page</div>;

function App() {
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
