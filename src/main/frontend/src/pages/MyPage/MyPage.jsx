import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from '../../contexts/LocationContext';
import { getMyInfo, checkEmail, changePassword } from '../../api/auth';

const UNIVCERT_API_KEY = '77ddffda-a3e8-4363-a31d-96e507f9b19c';
const UNIVCERT_ENDPOINT = 'https://univcert.com/api/v1/certify';
// (만약 인증 코드 검증용 별도 엔드포인트가 있다면 추가 정의)
const VERIFY_ENDPOINT = "https://univcert.com/api/v1/certifycode";

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

const EmailInput = styled(Input)`
  margin-bottom: 1rem;
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

const PasswordChangeForm = styled.div`
  background: var(--background);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PasswordChangeTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
`;

const PasswordInputGroup = styled.div`
  margin-bottom: 1rem;
`;

const PasswordLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: var(--text-light);
  }
`;

const PasswordHint = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.25rem;
`;

const PasswordErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const PasswordButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const PasswordButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--primary);
  color: white;
  
  &:hover {
    background: var(--primary-dark);
  }
  
  &.cancel {
    background: var(--text-light);
    color: var(--text);
    
    &:hover {
      background: var(--border);
    }
  }
`;

const MyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locations, setDefaultLocation, addLocation, deleteLocation } = useLocation();
  
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [schoolEmail, setSchoolEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState('email');
  const [profileImage, setProfileImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef();
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const photoMenuRef = useRef();
  const [editingName, setEditingName] = useState(false);
  const [profileName, setProfileName] = useState(t('profileName', 'John Doe'));
  const nameInputRef = useRef();
  const [userEmail, setUserEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailInputRef] = useState(useRef());
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // 평점에 따른 색상 계산 함수
  const getScoreColor = (score) => {
    if (score <= 25) return '#FEF3C7'; // 연노랑
    if (score <= 50) return '#FDE68A'; // 노랑
    if (score <= 75) return '#F59E0B'; // 주황
    return '#D97706'; // 진주황
  };
  
  const userScore = 85; // 사용자 평점 (실제로는 API에서 가져올 값)

  // accessToken 체크
  const token = localStorage.getItem('accessToken');
  
  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getMyInfo();
        setUserEmail(userInfo.email || '');
        setProfileName(userInfo.username || t('profileName', 'John Doe'));
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token, t]);

  useEffect(() => {
    const isVerified = localStorage.getItem('isVerified') === 'true';
    const verifiedEmail = localStorage.getItem('verifiedEmail');

    if (isVerified && verifiedEmail) {
      setIsVerified(true);
      setVerificationStatus('success');
      setSchoolEmail(verifiedEmail); // email input에도 자동 반영
    }
  }, []);

  if (!token) {
    // jwt 없으면 아무것도 렌더하지 않음(혹은 로딩 스피너 등)
    return null;
  }

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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerification = async () => {
    console.log('🧪 함수 시작됨');
    console.log('🧪 schoolEmail 값:', schoolEmail);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@g\.hongik\.ac\.kr$/;
    if (!emailRegex.test(schoolEmail)) {
      setVerificationStatus('error');
      return;
    }

    try {
      const res = await axios.post(UNIVCERT_ENDPOINT, {
        key: UNIVCERT_API_KEY,
        email: schoolEmail,
        univName: t('hongikUniversity'),
        univ_check: true
      });

      if (res.data.success) {
        setVerificationStep('code');
        setVerificationStatus(null);
        setResendTimer(60);

        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setVerificationStatus('error');
      }
    } catch (err) {
      console.error(err);
      setVerificationStatus('error');
    }
  };

  const handleVerifyCode = async () => {
    console.log('🔍 handleVerifyCode 실행됨');
    console.log('📧 이메일:', schoolEmail);
    console.log('🔐 코드:', verificationCode);

    try {
      const res = await axios.post(VERIFY_ENDPOINT, {
        key: UNIVCERT_API_KEY,
        email: schoolEmail,
        univName: t('hongikUniversity'),
        code: verificationCode
      });

      console.log('✅ 응답:', res.data);

      if (res.data.success) {
        setIsVerified(true);
        setVerificationStatus('success');

        localStorage.setItem('isVerified', 'true');
        localStorage.setItem('verifiedEmail', schoolEmail);

        console.log("📦 JWT 토큰:", localStorage.getItem("accessToken"));
        // ⬇️ 인증 성공 시 서버에도 반영
        const token = localStorage.getItem('accessToken');
        axios.post('/api/users/verify-student', null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        setVerificationStatus('error');
      }
    } catch (err) {
      console.error('❌ 인증 오류:', err);
      setVerificationStatus('error');
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      handleSendVerification();
    }
  };

  const handleEmailEdit = () => {
    setEditingEmail(true);
    setNewEmail(userEmail);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  const handleEmailSave = async () => {
    if (!newEmail || newEmail === userEmail) {
      setEditingEmail(false);
      return;
    }

    try {
      // 이메일 중복 확인
      await checkEmail(newEmail);
      
      // TODO: 실제 이메일 업데이트 API 호출
      // await updateEmail(newEmail);
      
      setUserEmail(newEmail);
      setEditingEmail(false);
      alert(t('emailUpdated', '이메일이 성공적으로 업데이트되었습니다.'));
    } catch (error) {
      if (error.message.includes('중복')) {
        alert(t('emailAlreadyExists', '이미 사용 중인 이메일입니다.'));
      } else {
        alert(t('emailUpdateFailed', '이메일 업데이트에 실패했습니다.'));
      }
    }
  };

  const handleEmailCancel = () => {
    setEditingEmail(false);
    setNewEmail('');
  };

  const handlePasswordChangeClick = () => {
    setShowPasswordChange(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const validatePassword = (password) => {
    // 비밀번호 정규식: 영문 대소문자, 숫자, 특수문자 포함 8~16자
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');

    // 입력값 검증
    if (!currentPassword) {
      setPasswordError(t('currentPasswordRequired', '현재 비밀번호를 입력해주세요.'));
      return;
    }

    if (!newPassword) {
      setPasswordError(t('newPasswordRequired', '새 비밀번호를 입력해주세요.'));
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError(t('passwordFormatError', '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함하여 8~16자여야 합니다.'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch', '새 비밀번호가 일치하지 않습니다.'));
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(t('samePasswordError', '새 비밀번호는 현재 비밀번호와 달라야 합니다.'));
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      alert(t('passwordChangeSuccess', '비밀번호가 성공적으로 변경되었습니다.'));
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.message.includes('현재 비밀번호')) {
        setPasswordError(t('currentPasswordIncorrect', '현재 비밀번호가 올바르지 않습니다.'));
      } else {
        setPasswordError(error.message || t('passwordChangeFailed', '비밀번호 변경에 실패했습니다.'));
      }
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  return (
    <MyPageContainer>
      <ProfileCard>
        <ProfileImageBig style={{
          '--score-color': getScoreColor(userScore),
          '--score-percentage': `${userScore * 3.6}deg`
        }}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <i className="fas fa-user" style={{ fontSize: '48px', color: 'var(--primary)' }}></i>
          )}
          <StyledPhotoChangeButton type="button" onClick={handlePhotoMenuClick}>
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
          <SettingsList>
            <SettingsItem>
              {editingEmail ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%'}}>
                  <i className="fas fa-envelope" style={{marginRight:6}}></i>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEmailSave();
                      if (e.key === 'Escape') handleEmailCancel();
                    }}
                    style={{
                      fontSize: '1rem',
                      color: 'var(--text)',
                      border: '1.5px solid var(--primary)',
                      borderRadius: 6,
                      padding: '0.2rem 0.5rem',
                      outline: 'none',
                      flex: 1,
                      background: 'var(--surface)',
                    }}
                    placeholder={t('enterNewEmail', '새 이메일 입력')}
                    autoFocus
                  />
                  <SmallButton onClick={handleEmailSave}>
                    <i className="fas fa-check"></i>
                  </SmallButton>
                  <SmallButton onClick={handleEmailCancel}>
                    <i className="fas fa-times"></i>
                  </SmallButton>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '1rem', fontWeight: '500', color: '#1F2937' }}>
                    <i className="fas fa-envelope" style={{marginRight:8, color: '#6B7280'}}></i>
                    {userEmail || t('noEmail', '이메일 없음')}
                  </span>
                  <SmallButton onClick={handleEmailEdit}>{t('change', '수정')}</SmallButton>
                </>
              )}
            </SettingsItem>
          </SettingsList>
        </SettingsSection>

        <SettingsSection>
          <SettingsList>
            <SettingsItem>
              <span style={{ fontSize: '1rem', fontWeight: '500', color: '#1F2937' }}>
                <i className="fas fa-university" style={{marginRight:8, color: '#6B7280'}}></i>
                {t('schoolVerification')}
              </span>
              <span className={`verification-status ${isVerified ? 'verified' : 'not-verified'}`} style={{
                marginRight: 8,
                fontSize: '0.9rem',
                fontWeight: '500',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: isVerified ? '#F0FDF4' : '#FEF2F2',
                color: isVerified ? '#166534' : '#DC2626',
                border: `1px solid ${isVerified ? '#BBF7D0' : '#FCA5A5'}`
              }}>
                <i className={`fas fa-${isVerified ? 'check-circle' : 'exclamation-circle'}`}></i>
                {isVerified ? t('verified') : t('notVerified')}
              </span>
              {!isVerified && !showVerificationForm && (
                <SmallButton onClick={() => setShowVerificationForm(true)}>{t('verifySchoolEmail')}</SmallButton>
              )}
            </SettingsItem>
          </SettingsList>
          {showVerificationForm && !isVerified && (
            <VerificationForm style={{padding:'1rem 0.5rem', marginTop:'0.5rem'}}>
              <VerificationSteps>
                <StepIndicator>
                  <div className={`step ${verificationStep === 'email' ? 'active' : 'completed'}`}>
                    <i className={`fas fa-${verificationStep === 'email' ? 'envelope' : 'check-circle'}`}></i>
                    {t('enterSchoolEmail')}
                  </div>
                  <div className="step-divider"></div>
                  <div className={`step ${verificationStep === 'code' ? 'active' : ''}`}>
                    <i className={`fas fa-${verificationStep === 'code' ? 'key' : 'key'}`}></i>
                    {t('enterVerificationCode')}
                  </div>
                </StepIndicator>
                {verificationStep === 'email' ? (
                  <>
                    <EmailInput
                      type="email"
                      placeholder={t('enterSchoolEmail')}
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                    />
                    <SmallButton onClick={handleSendVerification}>{t('sendVerificationCode')}</SmallButton>
                    {verificationStatus === 'error' && (
                      <VerificationMessage className="error">
                        <i className="fas fa-exclamation-circle"></i>
                        {t('emailInvalid')}
                      </VerificationMessage>
                    )}
                  </>
                ) : (
                  <>
                    <InputGroup>
                      <VerificationInput
                        type="text"
                        placeholder={t('enterVerificationCode')}
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setVerificationCode(value);
                          if (value.length === 6) {
                            handleVerifyCode();
                          }
                        }}
                      />

                      <Button onClick={handleVerifyCode}>
                        인증번호 확인
                      </Button>
                    </InputGroup>

                    {verificationStatus === 'error' && (
                      <VerificationMessage className="error">
                        <i className="fas fa-exclamation-circle"></i>
                        {t('invalidVerificationCode')}
                      </VerificationMessage>
                    )}
                    <VerificationMessage className="info">
                      <i className="fas fa-info-circle"></i>
                      {t('sendVerificationCode')} {schoolEmail}
                    </VerificationMessage>
                    <ResendButton 
                      onClick={handleResendCode}
                      disabled={resendTimer > 0}
                    >
                      <i className="fas fa-redo"></i>
                      {resendTimer > 0 
                        ? t('resendCodeIn', { sec: resendTimer })
                        : t('resendCode')}
                    </ResendButton>
                  </>
                )}
              </VerificationSteps>
            </VerificationForm>
          )}
          {isVerified && (
            <VerificationMessage className="success">
              <i className="fas fa-check-circle"></i>
              {t('yourSchoolEmailVerified')}
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
              <span><i className="fas fa-lock" style={{marginRight:6}}></i>{t('changePassword')}</span>
              <SmallButton onClick={handlePasswordChangeClick}>{t('changePassword')}</SmallButton>
            </SettingsItem>
          </SettingsList>
          
          {showPasswordChange && (
            <PasswordChangeForm>
              <PasswordChangeTitle>{t('changePasswordTitle', '비밀번호 변경')}</PasswordChangeTitle>
              
              <PasswordInputGroup>
                <PasswordLabel>{t('currentPassword', '현재 비밀번호')}</PasswordLabel>
                <PasswordInput
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('enterCurrentPassword', '현재 비밀번호를 입력하세요')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordSubmit();
                    if (e.key === 'Escape') handlePasswordCancel();
                  }}
                />
              </PasswordInputGroup>

              <PasswordInputGroup>
                <PasswordLabel>{t('newPassword', '새 비밀번호')}</PasswordLabel>
                <PasswordInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('enterNewPassword', '새 비밀번호를 입력하세요')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordSubmit();
                    if (e.key === 'Escape') handlePasswordCancel();
                  }}
                />
                <PasswordHint>{t('passwordHint', '영문 대소문자, 숫자, 특수문자 포함 8~16자')}</PasswordHint>
              </PasswordInputGroup>

              <PasswordInputGroup>
                <PasswordLabel>{t('confirmNewPassword', '새 비밀번호 확인')}</PasswordLabel>
                <PasswordInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmNewPassword', '새 비밀번호를 다시 입력하세요')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordSubmit();
                    if (e.key === 'Escape') handlePasswordCancel();
                  }}
                />
              </PasswordInputGroup>

              {passwordError && (
                <PasswordErrorMessage>
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </PasswordErrorMessage>
              )}

              <PasswordButtonGroup>
                <PasswordButton onClick={handlePasswordSubmit}>
                  <i className="fas fa-check"></i>
                  {t('confirm', '확인')}
                </PasswordButton>
                <PasswordButton onClick={handlePasswordCancel} className="cancel">
                  <i className="fas fa-times"></i>
                  {t('cancel', '취소')}
                </PasswordButton>
              </PasswordButtonGroup>
            </PasswordChangeForm>
          )}
        </SettingsSection>

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