import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from '../../contexts/LocationContext';

const MyPageContainer = styled.div`
  padding: 6rem 2vw 4rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--background);
  min-height: 100vh;
`;

const ProfileCard = styled.div`
  background: var(--surface);
  border-radius: 1.5rem;
  box-shadow: 0 2px 16px 0 rgba(124,58,237,0.07);
  padding: 2.2rem 2.5rem 1.5rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 2.2rem;
  margin-bottom: 2.2rem;
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    gap: 1.2rem;
  }
`;

const ProfileInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProfileNameRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 2.5rem;
  width: auto;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ProfileNameLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
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

const ProfileRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.05rem;
  color: var(--primary);
  font-weight: 600;
`;

const ProfileImageBig = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: visible;
  border: 3px solid var(--primary);
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(124,58,237,0.08);
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const StyledPhotoChangeButton = styled.button`
  position: absolute;
  right: -12px;
  bottom: -12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  box-shadow: 0 2px 10px 0 rgba(124,58,237,0.13);
  z-index: 10;
  transition: background 0.2s;
  &:hover {
    background: var(--primary-dark);
  }
  @media (max-width: 600px) {
    right: -7px;
    bottom: -7px;
    width: 30px;
    height: 30px;
    font-size: 1rem;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SettingsSection = styled.div`
  background: var(--surface);
  border-radius: var(--radius);
  padding: 0.7rem 0.8rem;
  box-shadow: none;
  width: 100%;
  min-width: 0;
  margin-bottom: 0.3rem;
  h3 {
    font-size: 0.98rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .verification-status {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.18rem 0.5rem;
    border-radius: var(--radius);
    font-size: 0.75rem;
    font-weight: 500;
    background: var(--background);
    border: 1px solid var(--border);
    transition: var(--transition);
    &.verified {
      color: var(--primary);
      background: rgba(124, 58, 237, 0.07);
      border-color: rgba(124, 58, 237, 0.12);
    }
    &.not-verified {
      color: var(--accent);
      background: rgba(249, 115, 22, 0.07);
      border-color: rgba(249, 115, 22, 0.12);
    }
    i {
      font-size: 0.8rem;
    }
  }
  p {
    color: var(--text-light);
    margin-bottom: 0.5rem;
    font-size: 0.88rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  &.danger {
    background: var(--accent);

    &:hover {
      background: #ea580c;
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
    padding: 1.25rem;
    background: var(--background);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
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
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: var(--transition);

  &:hover {
    color: var(--primary);
    background: rgba(124, 58, 237, 0.1);
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
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.98rem;
  &:last-child { border-bottom: none; }
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.32em 1.1em;
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary);
  background: #fff;
  border: 1.5px solid var(--primary);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  box-shadow: none;
  outline: none;
  &:hover {
    background: rgba(0, 123, 255, 0.07);
    color: var(--primary-dark);
    border-color: var(--primary-dark);
  }
  &.danger {
    color: var(--accent);
    border-color: var(--accent);
    &:hover { background: rgba(249,115,22,0.07); color: #ea580c; border-color: #ea580c; }
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

const MyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null); // 사용자 정보를 담을 상태
  const [isVerified, setIsVerified] = useState(false); // 재학생 인증 여부
  const { locations, setDefaultLocation, addLocation, deleteLocation } = useLocation();
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState(''); // 사용자가 입력할 학교 이메일

  // 인증 요청 후 서버 메시지를 담을 상태
  const [verificationMessage, setVerificationMessage] = useState({ type: '', text: '' }); 
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef();
  const [profileImage, setProfileImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const photoMenuRef = useRef();
  const [editingName, setEditingName] = useState(false);
  const [profileName, setProfileName] = useState(t('profileName', 'John Doe'));
  const nameInputRef = useRef();

  // 내 정보 불러오기 로직
  useEffect(() => {
    const fetchMyInfo = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login'); // 토큰 없으면 로그인 페이지로
        return;
      }
      
      try {
        // 백엔드의 /api/users/me API를 호출해서 내 정보를 가져온다.
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const userData = response.data.data;
          setUserInfo(userData);
          setProfileName(userData.username);
          // 백엔드에서 받은 재학생 인증 여부를 상태에 반영!
          setIsVerified(userData.studentVerified); 
          if(userData.universityEmail) {
            setSchoolEmail(userData.universityEmail);
          }
        }
      } catch (error) {
        console.error("내 정보 조회 실패:", error);
        // 토큰이 만료되었거나 유효하지 않은 경우 등...
        navigate('/login');
      }
    };

    fetchMyInfo();
  }, [navigate]);

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
    setIsLoading(true);
    setVerificationMessage({ type: '', text: '' });

    // 이메일 형식 검증 (두 도메인 모두 허용)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(mail\.hongik\.ac\.kr|g\.hongik\.ac\.kr)$/;
    if (!emailRegex.test(schoolEmail)) {
      setVerificationMessage({ type: 'error', text: '홍익대학교 메일 형식(@mail.hongik.ac.kr 또는 @g.hongik.ac.kr)이 올바르지 않습니다.' });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      // 우리 백엔드의 API (POST /api/users/verify-student/request) 호출
      const response = await axios.post('/api/users/verify-student/request', 
        { universityEmail: schoolEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setVerificationMessage({ type: 'success', text: response.data.message });
        setShowVerificationForm(false); // 성공 시 폼을 다시 숨겨도 좋아
      } else {
        setVerificationMessage({ type: 'error', text: response.data.message });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.';
      setVerificationMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    // 사용자 정보를 불러오는 동안 로딩 상태
    return <div>Loading...</div>;
  }

  return (
    <MyPageContainer>
      <ProfileCard>
        <ProfileImageBig>
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <i className="fas fa-user" style={{ fontSize: '48px', color: 'var(--primary)' }}></i>
          )}
          <StyledPhotoChangeButton type="button" onClick={handlePhotoMenuClick}>
            <i className="fas fa-camera"></i>
          </StyledPhotoChangeButton>
          {showPhotoMenu && (
            <div ref={photoMenuRef} style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              zIndex: 10,
              minWidth: '140px',
              padding: '0.5rem 0',
            }}>
              <button style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }} onClick={() => handlePhotoMenuSelect('default')}>
                <i className="fas fa-user"></i> Default Icon
              </button>
              <button style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }} onClick={() => handlePhotoMenuSelect('upload')}>
                <i className="fas fa-upload"></i> Upload Photo
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
              <ProfileRating>
                <i className="fas fa-star"></i>
                <span>8.5</span>
                <span style={{color:'var(--text-light)',fontWeight:400,fontSize:'0.98rem'}}>(24)</span>
              </ProfileRating>
            </ProfileNameLeft>
          </ProfileNameRow>
        </ProfileInfoBox>
      </ProfileCard>

      <SettingsContainer>
        <SettingsSection>
          <SettingsList>
            <SettingsItem>
              <span><i className="fas fa-envelope" style={{marginRight:6}}></i>{t('profileEmail', 'john.doe@example.com')}</span>
              <SmallButton>{t('change', '수정')}</SmallButton>
            </SettingsItem>
          </SettingsList>
        </SettingsSection>

        <SettingsSection>
          <SettingsList>
            <SettingsItem>
              <span><i className="fas fa-university" style={{marginRight:6}}></i>{t('schoolVerification')}</span>
              <span className={`verification-status ${isVerified ? 'verified' : 'not-verified'}`} style={{marginRight:8}}>
                <i className={`fas fa-${isVerified ? 'check-circle' : 'exclamation-circle'}`}></i>
                {isVerified ? t('verified') : t('notVerified')}
              </span>
              {/* 인증 안됐을 때만 '인증하기' 버튼 표시 */}
              {!isVerified && !showVerificationForm && (
                <SmallButton onClick={() => setShowVerificationForm(true)}>{t('verifySchoolEmail')}</SmallButton>
              )}
            </SettingsItem>
          </SettingsList>

          {showVerificationForm && !isVerified && (
            <VerificationForm style={{padding:'1rem 0.5rem', marginTop:'0.5rem'}}>
              <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem'}}>
                학교 이메일을 입력하고 '인증 메일 발송' 버튼을 누르세요. 메일함의 링크를 클릭하면 인증이 완료됩니다.
              </p>
              <EmailInput
                type="email"
                placeholder="id@hongik.ac.kr"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                disabled={isLoading}
              />
              <SmallButton onClick={handleSendVerification} disabled={isLoading}>
                {isLoading ? '전송 중...' : '인증 메일 발송'}
              </SmallButton>
            </VerificationForm>
          )}

          {/* 서버 응답 메시지 표시 UI 수정 */}
          {verificationMessage.text && (
            <VerificationMessage className={verificationMessage.type}>
              <i className={`fas fa-${verificationMessage.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {verificationMessage.text}
            </VerificationMessage>
          )}

          {isVerified && (
            <VerificationMessage className="success">
              <i className="fas fa-check-circle"></i>
              {userInfo.universityEmail} 계정으로 재학생 인증이 완료되었습니다.
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
              <SmallButton>{t('changePassword')}</SmallButton>
            </SettingsItem>
          </SettingsList>
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