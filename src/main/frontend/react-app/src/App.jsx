import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Footer from './components/Footer/Footer';
import Marketplace from './pages/Marketplace/Marketplace';
import MyPage from './pages/MyPage/MyPage';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import FindId from './pages/FindId/FindId';
import FindPw from './pages/FindPw/FindPw';

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
