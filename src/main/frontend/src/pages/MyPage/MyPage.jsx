import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext'; // TODO: 위치 관리 기능 구현
import axios from 'axios';
import { useNavigate as useRouterNavigate } from 'react-router-dom';

const MyPageContainer = styled.div`
  padding: 2rem 1rem 4rem;
  max-width: 1200px;
  width: 100%;  
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: var(--background);
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem 4rem;
    gap: 2.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 3rem 4rem;
    gap: 3rem;
    display: grid;
    grid-template-columns: 0.8fr 1.2fr;
    grid-template-rows: auto;
    align-items: start;
  }
`;

const ProfileCard = styled.div`
  background: var(--surface);
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  @media (min-width: 1024px) {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem;
    gap: 2rem;
  }
`;

const ProfileInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  text-align: center;
`;

const ProfileNameRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const ProfileNameLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;
// ---
const ProfileNameRightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`;

const ProfileNameRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const ProfileEmail = styled.div`
  color: var(--text-light);
  font-size: 1.02rem;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;
// ---

const ProfileImageBig = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: visible;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--score-color, #D97706) 0deg var(--score-percentage, 306deg),
      #e5e7eb var(--score-percentage, 306deg) 360deg
    );
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: white;
    z-index: 1;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    position: relative;
    z-index: 2;
  }
  
  i {
    font-size: 48px;
    color: var(--primary);
    position: relative;
    z-index: 2;
  }
  
  @media (max-width: 1024px) {
    width: 100px;
    height: 100px;
    
    i {
      font-size: 40px;
    }
  }
`;

const StyledPhotoChangeButton = styled.button`
  position: absolute;
  right: -5px;
  bottom: -5px;
  background: none;
  color: var(--primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.05rem;
  z-index: 5;
  transition: all 0.2s;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: var(--primary-dark);
  }
  @media (max-width: 600px) {
    right: -4px;
    bottom: -4px;
    font-size: 0.04rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// ---
const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
  h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--background);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius);
  box-shadow: none;
  z-index: 1;
`;

const AverageRating = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => {
    const rating = props.rating;
    if (rating >= 7) return 'var(--primary)';
    if (rating >= 4) return 'var(--secondary)';
    return 'var(--accent)';
  }};
`;

const RatingCount = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }

  .label {
    font-size: 0.875rem;
    color: var(--text-light);
  }
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
  width: 100%;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
  justify-content: center;
`;

const TabButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.active ? 'var(--primary)' : 'var(--text-light)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    color: var(--primary);
  }
`;
// ---

const SettingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    gap: 2.5rem;
  }
`;

const SettingsSection = styled.div`
  background: var(--surface);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .verification-status {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--background);
    border: 1px solid var(--border);
    transition: all 0.2s ease;
    
    &.verified {
      color: var(--primary);
      background: rgba(124, 58, 237, 0.1);
      border-color: rgba(124, 58, 237, 0.2);
    }
    
    &.not-verified {
      color: var(--accent);
      background: rgba(249, 115, 22, 0.1);
      border-color: rgba(249, 115, 22, 0.2);
    }
    
    i {
      font-size: 0.9rem;
    }
  }
  
  p {
    color: var(--text-light);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
  }
  
  @media (min-width: 1024px) {
    padding: 2.5rem;
    
    h3 {
      font-size: 1.35rem;
      margin-bottom: 2rem;
    }
  }
`;

// 최근 본 게시글 카드 스타일
const RecentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const RecentCard = styled.div`
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    border-color: var(--primary);
  }
`;

const RecentThumb = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  overflow: hidden;
  margin-bottom: 0.5rem;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const RecentTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RecentMeta = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 확인 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: min(520px, 92vw);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  border: 1px solid var(--border);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-weight: 700;
  color: var(--text);
`;

const ModalBody = styled.div`
  padding: 1rem 1.25rem;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 1rem;
`;

const ModalThumb = styled.div`
  width: 96px;
  height: 96px;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const ModalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  .title { font-weight: 700; color: var(--text); line-height: 1.3; }
  .meta { font-size: 0.9rem; color: var(--text-light); }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 1.25rem;
`;

const ModalButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  transition: all 0.15s;
  &:hover { background: #f8fafc; }
  &.primary {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
  &.primary:hover { filter: brightness(0.95); }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  }

  &.danger {
    background: var(--accent);
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);

    &:hover {
      background: #ea580c;
      box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
    }
  }
`;

const LocationSection = styled(SettingsSection)`
  .location-list {
    margin-bottom: 2rem;
  }

  .location-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--background);
    border-radius: 1rem;
    border: 1px solid var(--border);
    margin-bottom: 1rem;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }
    
    &:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .location-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .location-name {
        font-weight: 600;
        color: var(--text);
        font-size: 1.125rem;
      }

      .location-address {
        font-size: 0.875rem;
        color: var(--text-light);
      }
    }

    .location-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  }

  .add-location {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .add-location-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    
    @media (max-width: 480px) {
      flex-direction: column;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--background);
  color: var(--text);
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    background: var(--surface);
  }
  
  &::placeholder {
    color: var(--text-light);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--primary);
    background: rgba(124, 58, 237, 0.1);
    transform: scale(1.1);
  }

  &.danger:hover {
    color: var(--accent);
    background: rgba(249, 115, 22, 0.1);
  }
`;

const VerificationForm = styled.div`
  background: var(--background);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--border);
`;

// ---
const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const VerificationInput = styled(Input)`
  flex: 1;
  font-size: 1.25rem;
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  color: var(--text);
  padding: 1rem;
  height: 3.5rem;

  &::placeholder {
    letter-spacing: normal;
    font-size: 1rem;
    font-weight: normal;
  }
`;
// ---

const VerificationMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.success {
    background: rgba(124, 58, 237, 0.1);
    color: var(--primary);
    border: 1px solid rgba(124, 58, 237, 0.2);
  }

  &.error {
    background: rgba(249, 115, 22, 0.1);
    color: var(--accent);
    border: 1px solid rgba(249, 115, 22, 0.2);
  }

  &.info {
    background: rgba(14, 165, 233, 0.1);
    color: var(--secondary);
    border: 1px solid rgba(14, 165, 233, 0.2);
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);

  &:hover {
    color: var(--primary-dark);
  }

  &:disabled {
    color: var(--text-light);
    cursor: not-allowed;
  }
`;

const VerificationSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 1rem;

  .step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &.active {
      color: var(--primary);
      font-weight: 600;
    }

    &.completed {
      color: var(--text);
    }
  }

  .step-divider {
    flex: 1;
    height: 1px;
    background: var(--border);
    margin: 0 0.5rem;
  }
`;

const SettingsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SettingsItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 1rem;
  transition: background-color 0.2s ease;
  
  &:last-child { 
    border-bottom: none; 
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
    margin: 0 -1rem;
    padding: 1rem;
    border-radius: 0.5rem;
  }
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.5em 1.2em;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4B5563;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
  outline: none;
  
  &:hover {
    background: #E5E7EB;
    color: #374151;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.danger {
    color: #DC2626;
    background: #FEF2F2;
    border-color: #FCA5A5;
    
    &:hover { 
      background: #DC2626;
      color: white;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }
  }
`;

const EmailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const SchoolRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const MyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState(''); // 사용자가 입력할 학교 이메일
  // 인증 요청 후 서버 메시지를 담을 상태
  const [verificationMessage, setVerificationMessage] = useState({ type: '', text: '' }); 
  const [isSubmitting, setIsSubmitting] = useState(false); // API 호출 중복 방지

  const { locations, setDefaultLocation, addLocation, deleteLocation } = useLocation();


  const [profileImage, setProfileImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const photoMenuRef = useRef();
  const [editingName, setEditingName] = useState(false);
  const [profileName, setProfileName] = useState(t('profileName', 'John Doe'));
  const nameInputRef = useRef();
  
  // 평점에 따른 색상 계산 함수
  const getScoreColor = (score) => {
    if (score <= 25) return '#FEF3C7'; // 연노랑
    if (score <= 50) return '#FDE68A'; // 노랑
    if (score <= 75) return '#F59E0B'; // 주황
    return '#D97706'; // 진주황
  };
  
  const userScore = 85; // 사용자 평점 (실제로는 API에서 가져올 값)

  const fetchProfile = useCallback(async () => {
    // 페이지가 로드될 때마다 항상 최신 정보를 가져오도록 setLoading(true) 추가
    setLoading(true); 
    try {
      const response = await axios.get('/api/my/profile', { headers: getAuthHeader() });
      if (response.data.success) {
        const userProfile = response.data.data;
        setProfile(userProfile);
        setProfileName(userProfile.username); // 닉네임 수정용 상태에도 반영
        if (userProfile.universityEmail) {
          setSchoolEmail(userProfile.universityEmail);
        }
      }
    } catch (error) {
      console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
      // 토큰 만료 등의 이유로 실패 시 로그인 페이지로 이동
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 최근 본 게시글 목록
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const routerNavigate = useRouterNavigate();
  const [confirmPost, setConfirmPost] = useState(null);

  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const res = await axios.get('/api/posts/recent?limit=10', { headers: getAuthHeader() });
      setRecentPosts(res.data || []);
    } catch (e) {
      setRecentPosts([]);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const openConfirm = (post) => setConfirmPost(post);
  const closeConfirm = () => setConfirmPost(null);
  const goToPost = () => {
    if (confirmPost) {
      const id = confirmPost.postId;
      setConfirmPost(null);
      routerNavigate(`/posts/${id}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (photoMenuRef.current && !photoMenuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    }
    if (showPhotoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoMenu]);

  const handleSetDefault = (locationId) => {
    setDefaultLocation(locationId);
  };

  const handleDeleteLocation = (locationId) => {
    deleteLocation(locationId);
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      addLocation({
        name: newLocation.name,
        address: newLocation.address,
        lat: 37.5519, // 기본값 (실제로는 지오코딩 API 사용)
        lng: 126.9259
      });
      setNewLocation({ name: '', address: '' });
      setShowAddForm(false);
    }
  };

  const handlePhotoMenuClick = () => {
    setShowPhotoMenu((prev) => !prev);
  };

  const handlePhotoMenuSelect = (option) => {
    setShowPhotoMenu(false);
    if (option === 'default') {
      setProfileImage(null);
    } else if (option === 'upload') {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e) => {
    // 기능 보류
    alert('프로필 사진 변경 기능은 현재 준비 중입니다.');
  };

  const handleSendVerification = async () => {
    setIsSubmitting(true);
    setVerificationMessage({ type: '', text: '' });

    // 이메일 형식 검증 (두 도메인 모두 허용)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(mail\.hongik\.ac\.kr|g\.hongik\.ac\.kr)$/;
    if (!emailRegex.test(schoolEmail)) {
      setVerificationMessage({ type: 'error', text: '홍익대학교 메일 형식(@mail.hongik.ac.kr 또는 @g.hongik.ac.kr)이 올바르지 않습니다.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('/api/my/verification/request-code', { schoolEmail }, { headers: getAuthHeader() });
      setVerificationMessage({ type: 'info', text: `${schoolEmail}로 인증 메일을 보냈습니다. 메일함의 링크를 클릭하면 인증이 완료됩니다.` });
      setShowVerificationForm(false); // 성공 시 폼 숨기기
    } catch (error) {
      const message = error.response?.data?.message || "인증 메일 발송 중 오류가 발생했습니다.";
      setVerificationMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !profile) {
    return <MyPageContainer><h2>로딩 중...</h2></MyPageContainer>;
  }

  return (
    <MyPageContainer>
      <ProfileCard>
        <ProfileImageBig style={{
          '--score-color': getScoreColor(userScore),
          '--score-percentage': `${userScore * 3.6}deg`
        }}>
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="Profile" />
          ) : (
            <i className="fas fa-user" style={{ fontSize: '48px', color: 'var(--primary)' }}></i>
          )}
          <StyledPhotoChangeButton type="button" onClick={() => fileInputRef.current.click()}>
            <i className="fas fa-camera-retro" style={{ position: 'relative', zIndex: 6, fontSize: '16px' }}></i>
          </StyledPhotoChangeButton>
          {showPhotoMenu && (
            <div ref={photoMenuRef} style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              minWidth: '160px',
              padding: '0.75rem 0',
              overflow: 'hidden',
            }}>
              <button style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #f1f5f9',
              }} 
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
              onClick={() => handlePhotoMenuSelect('default')}>
                <i className="fas fa-user" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i> 
                기본 아이콘
              </button>
              <button style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
              }} 
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
              onClick={() => handlePhotoMenuSelect('upload')}>
                <i className="fas fa-upload" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i> 
                사진 업로드
              </button>
            </div>
          )}
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </ProfileImageBig>
        <ProfileInfoBox>
          <ProfileNameRow>
            <ProfileNameLeft>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                {editingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setEditingName(false);
                    }}
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      border: '1.5px solid var(--primary)',
                      borderRadius: 6,
                      padding: '0.2rem 0.5rem',
                      outline: 'none',
                      minWidth: 80,
                      marginRight: 2,
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 style={{margin:0}}>{profileName}</h2>
                    <SmallButton style={{marginLeft:2}} onClick={() => setEditingName(true)}>
                      <i className="fas fa-pen"></i>
                    </SmallButton>
                  </>
                )}
              </div>

            </ProfileNameLeft>
          </ProfileNameRow>
        </ProfileInfoBox>
      </ProfileCard>

      {/* 오른쪽 열 - 설정 섹션들 */}
      <SettingsContainer>
        <SettingsSection>
          <h3><i className="fas fa-history" style={{color: 'var(--primary)'}}></i> 최근 본 게시글</h3>
          {recentLoading ? (
            <div style={{ padding: '0.5rem', color: 'var(--text-light)' }}>불러오는 중…</div>
          ) : recentPosts.length === 0 ? (
            <div style={{ padding: '0.5rem', color: 'var(--text-light)' }}>최근 본 게시글이 없습니다.</div>
          ) : (
            <RecentGrid>
              {recentPosts.map(p => (
                <RecentCard key={p.postId} onClick={() => openConfirm(p)}>
                  <RecentThumb>
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.postTitle} />
                    ) : (
                      <span>{p.postTitle}</span>
                    )}
                  </RecentThumb>
                  <RecentTitle>{p.postTitle}</RecentTitle>
                  <RecentMeta>
                    <span>{(p.price ?? 0).toLocaleString()}원</span>
                    <span style={{ fontSize: '0.75rem' }}>{p.author}</span>
                  </RecentMeta>
                </RecentCard>
              ))}
            </RecentGrid>
          )}
        </SettingsSection>

        {confirmPost && (
          <ModalOverlay onClick={closeConfirm}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalHeader>게시글로 이동할까요?</ModalHeader>
              <ModalBody>
                <ModalThumb>
                  {confirmPost.thumbnailUrl ? (
                    <img src={confirmPost.thumbnailUrl} alt={confirmPost.postTitle} />
                  ) : (
                    <span>{confirmPost.postTitle}</span>
                  )}
                </ModalThumb>
                <ModalInfo>
                  <div className="title">{confirmPost.postTitle}</div>
                  <div className="meta">{confirmPost.author}</div>
                  <div className="meta">{(confirmPost.price ?? 0).toLocaleString()}원</div>
                </ModalInfo>
              </ModalBody>
              <ModalActions>
                <ModalButton onClick={closeConfirm}>취소</ModalButton>
                <ModalButton className="primary" onClick={goToPost}>이동</ModalButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
        <SettingsSection>
          <h3>계정 정보</h3>
          <SettingsList>
            <SettingsItem>
              <span><i className="fas fa-envelope" style={{marginRight:8, color: '#6B7280'}}></i>{profile.email}</span>
            </SettingsItem>
          </SettingsList>
        </SettingsSection>

        <SettingsSection>
          <h3>학생 인증</h3>
          <SettingsList>
            <SettingsItem>
              <span><i className="fas fa-university" style={{marginRight:8, color: '#6B7280'}}></i>재학생 인증</span>
              <span className={`verification-status ${profile.studentVerified ? 'verified' : 'not-verified'}`}>
                <i className={`fas fa-${profile.studentVerified ? 'check-circle' : 'exclamation-circle'}`}></i>
                {profile.studentVerified ? '인증 완료' : '미인증'}
              </span>
              {!profile.studentVerified && !showVerificationForm && (
                <SmallButton onClick={() => setShowVerificationForm(true)}>인증하기</SmallButton>
              )}
            </SettingsItem>
          </SettingsList>

          {showVerificationForm && !profile.studentVerified && (
            <VerificationForm style={{padding:'1rem 0.5rem', marginTop:'0.5rem'}}>
              <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem'}}>
                학교 이메일(@g.hongik.ac.kr / @mail.hongik.ac.kr)을 입력하고 '인증 메일 발송' 버튼을 누르세요. 메일함의 링크를 클릭하면 인증이 완료됩니다.
              </p>
              <Input
                type="email"
                placeholder="id@g.hongik.ac.kr / id@mail.hongik.ac.kr"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <SmallButton onClick={handleSendVerification} disabled={isSubmitting}>
                {isSubmitting ? '전송 중...' : '인증 메일 발송'}
              </SmallButton>
            </VerificationForm>
          )}

          {/* 서버 응답 메시지 표시 UI */}
          {verificationMessage.text && (
            <VerificationMessage className={verificationMessage.type}>
              <i className={`fas fa-${verificationMessage.type === 'success' || verificationMessage.type === 'info' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {verificationMessage.text}
            </VerificationMessage>
          )}

          {profile.studentVerified && (
            <VerificationMessage className="success">
              <i className="fas fa-check-circle"></i>
              {profile.universityEmail} 계정으로 재학생 인증이 완료되었습니다.
            </VerificationMessage>
          )}
        </SettingsSection>

        <LocationSection>
          <h3>{t('myLocation', '나의 위치')}</h3>
          <div className="location-list">
            {locations.map(location => (
              <div key={location.id} className="location-item">
                <div className="location-info">
                  <span className="location-name">{location.name}</span>
                  <span className="location-address">{location.address}</span>
                </div>
                <div className="location-actions">
                  <IconButton 
                    onClick={() => handleSetDefault(location.id)}
                    title={location.isDefault ? t('defaultLocation') : t('setDefault')}
                  >
                    <i className={`fas fa-star`} style={{ color: location.isDefault ? 'var(--primary)' : 'inherit' }}></i>
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteLocation(location.id)}
                    className="danger"
                    title={t('deleteLocation')}
                  >
                    <i className="fas fa-trash"></i>
                  </IconButton>
                </div>
              </div>
            ))}
          </div>

          <div className="add-location">
            {showAddForm ? (
              <div className="add-location-form">
                <Input
                  type="text"
                  placeholder={t('locationName')}
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder={t('address')}
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                />
                <div className="button-group">
                  <Button onClick={handleAddLocation}>{t('addNewLocation')}</Button>
                  <Button onClick={() => setShowAddForm(false)}>{t('cancel')}</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowAddForm(true)}>
                <i className="fas fa-plus"></i> {t('addNewLocation')}
              </Button>
            )}
          </div>
        </LocationSection>

        <SettingsSection>
          <SettingsList>
            <SettingsItem>
              <span><i className="fas fa-user-slash" style={{marginRight:6}}></i>{t('deleteAccount')}</span>
              <SmallButton className="danger">{t('deleteAccount')}</SmallButton>
            </SettingsItem>
          </SettingsList>
        </SettingsSection>
      </SettingsContainer>
    </MyPageContainer>
  );
};

export default MyPage; 
