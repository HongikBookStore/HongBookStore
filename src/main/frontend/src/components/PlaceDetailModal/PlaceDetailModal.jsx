import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaStar, FaThumbsUp, FaThumbsDown, FaCamera, FaRoute, FaClock, FaMapMarkerAlt, FaHeart, FaTimes, FaPlus, FaUpload, FaTrash, FaInfoCircle } from 'react-icons/fa';

const PlaceDetailModal = ({ place, isOpen, onClose, userCategories, onAddToCategory, userLocation }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', photos: [] });
  const [selectedCategory, setSelectedCategory] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !place) return null;

  // 평균 평점 계산
  const averageRating = place.reviews && place.reviews.length > 0 
    ? (place.reviews.reduce((sum, review) => sum + review.rating, 0) / place.reviews.length).toFixed(1)
    : 0;

  // 경로 시간 계산 (간단한 예시)
  const calculateRouteTime = () => {
    if (!userLocation) return '위치를 설정해주세요';
    
    // 실제로는 네이버 지도 API를 사용하여 정확한 시간 계산
    const distance = Math.sqrt(
      Math.pow(place.lat - userLocation.lat, 2) + 
      Math.pow(place.lng - userLocation.lng, 2)
    ) * 111000; // 대략적인 거리 계산 (미터)
    
    const timeInMinutes = Math.round(distance / 1000 * 15); // 1km당 15분 가정
    return `${timeInMinutes}분`;
  };

  const handleAddToCategory = () => {
    if (selectedCategory) {
      onAddToCategory(place.id, selectedCategory);
      setSelectedCategory('');
    }
  };

  const handleSubmitReview = () => {
    if (!newReview.content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    // 리뷰 제출 로직
    console.log('Submit review:', newReview);
    setNewReview({ rating: 5, content: '', photos: [] });
  };

  const handleLikeReview = (reviewId) => {
    // 리뷰 좋아요 로직
    console.log('Like review:', reviewId);
  };

  const handleDislikeReview = (reviewId) => {
    // 리뷰 싫어요 로직
    console.log('Dislike review:', reviewId);
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setNewReview({ ...newReview, photos: [...newReview.photos, ...newPhotos] });
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = newReview.photos.filter((_, i) => i !== index);
    setNewReview({ ...newReview, photos: newPhotos });
  };

  const getTypeIcon = (type) => {
    const icons = {
      restaurant: '🍽️',
      cafe: '☕',
      partner: '🤝',
      convenience: '🛍️',
      other: '📍'
    };
    return icons[type] || '📍';
  };

  const getTypeName = (type) => {
    const names = {
      restaurant: '음식점',
      cafe: '카페',
      partner: '제휴업체',
      convenience: '편의점',
      other: '기타'
    };
    return names[type] || '기타';
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <PlaceInfo>
            <PlaceIcon>{getTypeIcon(place.category)}</PlaceIcon>
            <PlaceDetails>
              <PlaceName>{place.name}</PlaceName>
              <PlaceType>{getTypeName(place.category)}</PlaceType>
              <PlaceRating>
                <Stars>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} $isFilled={star <= averageRating}>
                      <FaStar />
                    </Star>
                  ))}
                </Stars>
                <RatingText>{averageRating} ({place.reviews?.length || 0}개 리뷰)</RatingText>
              </PlaceRating>
            </PlaceDetails>
          </PlaceInfo>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <TabContainer>
          <TabButton 
            $isActive={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            정보
          </TabButton>
          <TabButton 
            $isActive={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            리뷰
          </TabButton>
          <TabButton 
            $isActive={activeTab === 'route'} 
            onClick={() => setActiveTab('route')}
          >
            경로
          </TabButton>
        </TabContainer>

        <ModalBody>
          {activeTab === 'info' && (
            <InfoTab>
              <InfoSection>
                <InfoTitle>
                  <FaMapMarkerAlt /> 주소
                </InfoTitle>
                <InfoContent>
                  <FaMapMarkerAlt /> {place.address}
                </InfoContent>
              </InfoSection>
              
              {place.description && (
                <InfoSection>
                  <InfoTitle>
                    <FaInfoCircle /> 설명
                  </InfoTitle>
                  <InfoContent>{place.description}</InfoContent>
                </InfoSection>
              )}

              <InfoSection>
                <InfoTitle>
                  <FaPlus /> 내 카테고리에 추가
                </InfoTitle>
                <CategorySelectContainer>
                  <CategorySelect 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">카테고리 선택</option>
                    {userCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </CategorySelect>
                  <AddToCategoryButton onClick={handleAddToCategory}>
                    <FaPlus />
                  </AddToCategoryButton>
                </CategorySelectContainer>
              </InfoSection>
            </InfoTab>
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab>
              <ReviewForm>
                <ReviewFormTitle>리뷰 작성</ReviewFormTitle>
                <RatingContainer>
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarButton
                      key={star}
                      $isSelected={newReview.rating >= star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <FaStar />
                    </StarButton>
                  ))}
                </RatingContainer>
                <ReviewTextarea
                  placeholder="리뷰를 작성해주세요..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                />
                
                {/* 사진 업로드 섹션 */}
                <PhotoUploadSection>
                  <PhotoUploadTitle>사진 추가</PhotoUploadTitle>
                  <PhotoUploadArea onClick={() => fileInputRef.current?.click()}>
                    <FaUpload />
                    <span>사진을 선택하거나 클릭하여 업로드</span>
                  </PhotoUploadArea>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  
                  {newReview.photos.length > 0 && (
                    <PhotoPreviewContainer>
                      {newReview.photos.map((photo, index) => (
                        <PhotoPreview key={index}>
                          <PhotoPreviewImage src={photo} alt="업로드된 사진" />
                          <RemovePhotoButton onClick={() => handleRemovePhoto(index)}>
                            <FaTrash />
                          </RemovePhotoButton>
                        </PhotoPreview>
                      ))}
                    </PhotoPreviewContainer>
                  )}
                </PhotoUploadSection>
                
                <ReviewSubmitButton onClick={handleSubmitReview}>
                  리뷰 등록
                </ReviewSubmitButton>
              </ReviewForm>

              <ReviewsList>
                <ReviewsHeader>
                  <ReviewsTitle>리뷰 ({place.reviews?.length || 0})</ReviewsTitle>
                  {place.reviews && place.reviews.length > 3 && (
                    <ShowMoreButton onClick={() => setShowAllReviews(!showAllReviews)}>
                      {showAllReviews ? '접기' : '더보기'}
                    </ShowMoreButton>
                  )}
                </ReviewsHeader>
                
                {(place.reviews || []).slice(0, showAllReviews ? undefined : 3).map((review, index) => (
                  <ReviewItem key={review.id || index}>
                    <ReviewHeader>
                      <ReviewerInfo>
                        <ReviewerName>{review.userName}</ReviewerName>
                        <ReviewRating>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} $isFilled={i < review.rating}>
                              <FaStar />
                            </Star>
                          ))}
                        </ReviewRating>
                      </ReviewerInfo>
                      <ReviewActions>
                        <ActionButton onClick={() => handleLikeReview(review.id)}>
                          <FaThumbsUp /> {review.likes || 0}
                        </ActionButton>
                        <ActionButton onClick={() => handleDislikeReview(review.id)}>
                          <FaThumbsDown /> {review.dislikes || 0}
                        </ActionButton>
                      </ReviewActions>
                    </ReviewHeader>
                    
                    <ReviewContent>
                      {expandedReview === review.id ? (
                        <>
                          {review.content}
                          <CollapseButton onClick={() => setExpandedReview(null)}>
                            접기
                          </CollapseButton>
                        </>
                      ) : (
                        <>
                          {review.content.slice(0, 100)}
                          {review.content.length > 100 && (
                            <ExpandButton onClick={() => setExpandedReview(review.id)}>
                              ...더보기
                            </ExpandButton>
                          )}
                        </>
                      )}
                    </ReviewContent>
                    
                    {review.photos && review.photos.length > 0 && (
                      <ReviewPhotos>
                        {review.photos.map((photo, photoIndex) => (
                          <ReviewPhoto key={photoIndex} src={photo} alt="리뷰 사진" />
                        ))}
                      </ReviewPhotos>
                    )}
                  </ReviewItem>
                ))}
              </ReviewsList>
            </ReviewsTab>
          )}

          {activeTab === 'route' && (
            <RouteTab>
              <RouteInfo>
                <RouteTitle>경로 안내</RouteTitle>
                <RouteDetails>
                  <RouteItem>
                    <FaMapMarkerAlt />
                    <span>출발지: {userLocation ? '현재 위치' : '위치를 설정해주세요'}</span>
                  </RouteItem>
                  <RouteItem>
                    <FaMapMarkerAlt />
                    <span>도착지: {place.name}</span>
                  </RouteItem>
                  <RouteItem>
                    <FaClock />
                    <span>예상 소요시간: {calculateRouteTime()}</span>
                  </RouteItem>
                </RouteDetails>
              </RouteInfo>
              <RouteMap>
                <RouteMapPlaceholder>
                  <FaRoute />
                  <span>경로 지도가 여기에 표시됩니다</span>
                </RouteMapPlaceholder>
              </RouteMap>
            </RouteTab>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const PlaceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const PlaceIcon = styled.span`
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
`;

const PlaceDetails = styled.div`
  flex: 1;
`;

const PlaceName = styled.h2`
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
`;

const PlaceType = styled.span`
  color: #666;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const PlaceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${props => props.$isFilled ? '#ffc107' : '#e0e0e0'};
  font-size: 16px;
`;

const RatingText = styled.span`
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #333;
    background: #f8f9fa;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 20px;
  background: ${props => props.$isActive ? 'white' : 'transparent'};
  color: ${props => props.$isActive ? '#007bff' : '#666'};
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.$isActive ? 'white' : '#f0f0f0'};
  }
  
  ${props => props.$isActive && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #007bff;
    }
  `}
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const InfoTab = styled.div``;

const InfoSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
`;

const InfoTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoContent = styled.div`
  color: #555;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
`;

const CategorySelectContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const AddToCategoryButton = styled.button`
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;

const ReviewsTab = styled.div``;

const ReviewForm = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 1px solid #e9ecef;
`;

const ReviewFormTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${props => props.$isSelected ? '#ffc107' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffc107;
    transform: scale(1.1);
  }
`;

const ReviewTextarea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  margin-bottom: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const PhotoUploadSection = styled.div`
  margin-bottom: 16px;
`;

const PhotoUploadTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
`;

const PhotoUploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
    background: rgba(0, 123, 255, 0.05);
  }
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  overflow-x: auto;
  padding: 4px;
`;

const PhotoPreview = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const PhotoPreviewImage = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: #c82333;
  }
`;

const ReviewSubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const ReviewsList = styled.div``;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

const ReviewsTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 123, 255, 0.1);
    text-decoration: none;
  }
`;

const ReviewItem = styled.div`
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewerInfo = styled.div``;

const ReviewerName = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #333;
    border-color: #ccc;
    background: #f8f9fa;
  }
`;

const ReviewContent = styled.div`
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 14px;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 123, 255, 0.1);
    text-decoration: none;
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 123, 255, 0.1);
    text-decoration: none;
  }
`;

const ReviewPhotos = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;
`;

const ReviewPhoto = styled.img`
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const RouteTab = styled.div``;

const RouteInfo = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 1px solid #e9ecef;
`;

const RouteTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const RouteDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RouteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #555;
  font-size: 14px;
  padding: 8px 0;
`;

const RouteMap = styled.div`
  height: 300px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
`;

const RouteMapPlaceholder = styled.div`
  color: #999;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  svg {
    font-size: 32px;
    color: #ccc;
  }
`;

export default PlaceDetailModal; 