import React, { useState } from 'react';
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.min.css';

const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';

const MyPageContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background);
  min-height: 100vh;
`;

const ProfileSection = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow);
  display: flex;
  gap: 2rem;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: visible;
  position: relative;
  background: var(--background);
  border: 3px solid var(--primary);
  box-shadow: var(--shadow-lg);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const PhotoChangeButton = styled.button`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: var(--shadow);
  z-index: 2;
  transition: var(--transition);

  &:hover {
    transform: scale(1.1);
    background: var(--primary-dark);
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
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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
`;

const SettingsSection = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  width: 100%;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .verification-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--background);
    border: 1px solid var(--border);
    transition: var(--transition);

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
      font-size: 1rem;
    }
  }

  p {
    color: var(--text-light);
    margin-bottom: 1.5rem;
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

const MyPage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [schoolEmail, setSchoolEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState('email');
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [locations, setLocations] = useState([
    { id: 1, name: 'Hongik University Main Gate', address: '94 Wausan-ro, Mapo-gu, Seoul', isDefault: true },
    { id: 2, name: 'Hongik University Station', address: 'Exit 3, Hongik University Station', isDefault: false },
  ]);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (locationId) => {
    setLocations(locations.map(loc => ({
      ...loc,
      isDefault: loc.id === locationId
    })));
  };

  const handleDeleteLocation = (locationId) => {
    setLocations(locations.filter(loc => loc.id !== locationId));
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      setLocations([
        ...locations,
        {
          id: Date.now(),
          name: newLocation.name,
          address: newLocation.address,
          isDefault: locations.length === 0
        }
      ]);
      setNewLocation({ name: '', address: '' });
      setShowAddForm(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setIsDefaultImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerification = () => {
    // Validate school email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(schoolEmail)) {
      setVerificationStatus('error');
      return;
    }

    // TODO: Implement API call to send verification code
    setVerificationStep('code');
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = () => {
    // TODO: Implement API call to verify code
    if (verificationCode.length === 6) {
      // Simulate verification success
      setIsVerified(true);
      setVerificationStatus('success');
      setShowVerificationForm(false);
    } else {
      setVerificationStatus('error');
    }
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      handleSendVerification();
    }
  };

  return (
    <MyPageContainer>
      <ProfileSection>
        <ProfileImage>
          <img src={profileImage} alt="Profile" />
          <PhotoChangeButton as="label">
            <i className="fas fa-camera"></i>
            <HiddenFileInput
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </PhotoChangeButton>
        </ProfileImage>
        <ProfileInfo>
          <ProfileName>
            <h2>John Doe</h2>
            <RatingSection>
              <AverageRating rating={8.5}>8.5</AverageRating>
              <RatingCount>(24)</RatingCount>
            </RatingSection>
          </ProfileName>
        </ProfileInfo>
      </ProfileSection>

      <SettingsContainer>
        <SettingsSection>
          <h3>Email Address</h3>
          <div className="email-display">
            <i className="fas fa-envelope"></i>
            <span>john.doe@example.com</span>
          </div>
        </SettingsSection>

        <SettingsSection>
          <h3>
            School Verification
            <span className={`verification-status ${isVerified ? 'verified' : 'not-verified'}`}>
              <i className={`fas fa-${isVerified ? 'check-circle' : 'exclamation-circle'}`}></i>
              {isVerified ? 'Verified' : 'Not Verified'}
            </span>
          </h3>
          <p>Verify your school email to access all features</p>
          
          {!isVerified && !showVerificationForm && (
            <Button onClick={() => setShowVerificationForm(true)}>Verify School Email</Button>
          )}

          {showVerificationForm && !isVerified && (
            <VerificationForm>
              <VerificationSteps>
                <StepIndicator>
                  <div className={`step ${verificationStep === 'email' ? 'active' : 'completed'}`}>
                    <i className={`fas fa-${verificationStep === 'email' ? 'envelope' : 'check-circle'}`}></i>
                    Enter School Email
                  </div>
                  <div className="step-divider"></div>
                  <div className={`step ${verificationStep === 'code' ? 'active' : ''}`}>
                    <i className={`fas fa-${verificationStep === 'code' ? 'key' : 'key'}`}></i>
                    Enter Verification Code
                  </div>
                </StepIndicator>

                {verificationStep === 'email' ? (
                  <>
                    <EmailInput
                      type="email"
                      placeholder="Enter your school email address"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                    />
                    <Button onClick={handleSendVerification}>Send Verification Code</Button>
                    {verificationStatus === 'error' && (
                      <VerificationMessage className="error">
                        <i className="fas fa-exclamation-circle"></i>
                        Please enter a valid school email address.
                      </VerificationMessage>
                    )}
                  </>
                ) : (
                  <>
                    <InputGroup>
                      <VerificationInput
                        type="text"
                        placeholder="Enter 6-digit code"
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
                    </InputGroup>

                    {verificationStatus === 'error' && (
                      <VerificationMessage className="error">
                        <i className="fas fa-exclamation-circle"></i>
                        Invalid verification code. Please try again.
                      </VerificationMessage>
                    )}

                    <VerificationMessage className="info">
                      <i className="fas fa-info-circle"></i>
                      We've sent a verification code to {schoolEmail}
                    </VerificationMessage>

                    <ResendButton 
                      onClick={handleResendCode}
                      disabled={resendTimer > 0}
                    >
                      <i className="fas fa-redo"></i>
                      {resendTimer > 0 
                        ? `Resend code in ${resendTimer}s` 
                        : 'Resend verification code'}
                    </ResendButton>
                  </>
                )}
              </VerificationSteps>
            </VerificationForm>
          )}

          {isVerified && (
            <VerificationMessage className="success">
              <i className="fas fa-check-circle"></i>
              Your school email has been successfully verified.
            </VerificationMessage>
          )}
        </SettingsSection>

        <LocationSection>
          <h3>Location Management</h3>
          <p>Manage your preferred meeting locations for book exchanges</p>
          
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
                    title={location.isDefault ? "Default Location" : "Set as Default"}
                  >
                    <i className={`fas fa-${location.isDefault ? 'star' : 'star'}`} 
                       style={{ color: location.isDefault ? 'var(--primary)' : 'inherit' }}></i>
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteLocation(location.id)}
                    className="danger"
                    title="Delete Location"
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
                  placeholder="Location Name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                />
                <div className="button-group">
                  <Button onClick={handleAddLocation}>Add Location</Button>
                  <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowAddForm(true)}>
                <i className="fas fa-plus"></i> Add New Location
              </Button>
            )}
          </div>
        </LocationSection>

        <SettingsSection>
          <h3>Change Password</h3>
          <p>Update your account password</p>
          <Button>Change Password</Button>
        </SettingsSection>

        <SettingsSection>
          <h3>Delete Account</h3>
          <p>Permanently delete your account and all associated data</p>
          <Button className="danger">Delete Account</Button>
        </SettingsSection>
      </SettingsContainer>
    </MyPageContainer>
  );
};

export default MyPage; 