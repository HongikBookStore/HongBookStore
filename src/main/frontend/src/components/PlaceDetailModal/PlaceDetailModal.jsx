import React, { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaThumbsUp, FaThumbsDown, FaCamera, FaRoute, FaClock, FaMapMarkerAlt, FaHeart, FaTimes, FaPlus } from 'react-icons/fa';

const PlaceDetailModal = ({ place, isOpen, onClose, userCategories, onAddToCategory, userLocation }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', photos: [] });
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!isOpen || !place) return null;

  const handleAddToCategory = () => {
    if (selectedCategory) {
      onAddToCategory(place.id, selectedCategory);
      setSelectedCategory('');
    }
  };

  const handleSubmitReview = () => {
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

  const getTypeIcon = (type) => {
    const icons = {
      restaurant: '🍽️',
      cafe: '☕',
      partner: '🤝',
      print: '🖨️',
      bookstore: '📚',
      entertainment: '🎮',
      other: '📌'
    };
    return icons[type] || '📍';
  };

  const getTypeName = (type) => {
    const names = {
      restaurant: '식당',
      cafe: '카페',
      partner: '홍익대 제휴',
      print: '인쇄',
      bookstore: '서점',
      entertainment: '놀거리',
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
                <InfoTitle>주소</InfoTitle>
                <InfoContent>
                  <FaMapMarkerAlt /> {place.address}
                </InfoContent>
              </InfoSection>
              
              {place.description && (
                <InfoSection>
                  <InfoTitle>설명</InfoTitle>
                  <InfoContent>{place.description}</InfoContent>
                </InfoSection>
              )}

              <InfoSection>
                <InfoTitle>내 카테고리에 추가</InfoTitle>
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
                        review.content
                      ) : (
                        <>
                          {review.content.slice(0, 15)}
                          {review.content.length > 15 && (
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
                    <span>예상 소요시간: 약 15분</span>
                  </RouteItem>
                </RouteDetails>
              </RouteInfo>
              <RouteMap>
                {/* 여기에 경로 지도가 표시됩니다 */}
                <RouteMapPlaceholder>
                  경로 지도가 여기에 표시됩니다
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const PlaceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlaceIcon = styled.span`
  font-size: 32px;
`;

const PlaceDetails = styled.div``;

const PlaceName = styled.h2`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
`;

const PlaceType = styled.span`
  color: #666;
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.$isActive ? '#007bff' : 'white'};
  color: ${props => props.$isActive ? 'white' : '#333'};
  border: none;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.$isActive ? '#007bff' : '#f8f9fa'};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const InfoTab = styled.div``;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const InfoTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const InfoContent = styled.div`
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategorySelectContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const AddToCategoryButton = styled.button`
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const ReviewsTab = styled.div``;

const ReviewForm = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ReviewFormTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.$isSelected ? '#ffc107' : '#ddd'};
  cursor: pointer;
  
  &:hover {
    color: #ffc107;
  }
`;

const ReviewTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ReviewSubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #0056b3;
  }
`;

const ReviewsList = styled.div``;

const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ReviewsTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReviewItem = styled.div`
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ReviewerInfo = styled.div``;

const ReviewerName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${props => props.$isFilled ? '#ffc107' : '#ddd'};
  font-size: 14px;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ReviewContent = styled.div`
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReviewPhotos = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const ReviewPhoto = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
`;

const RouteTab = styled.div``;

const RouteInfo = styled.div`
  margin-bottom: 20px;
`;

const RouteTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const RouteDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RouteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
`;

const RouteMap = styled.div`
  height: 300px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RouteMapPlaceholder = styled.div`
  color: #999;
  font-size: 14px;
`;

export default PlaceDetailModal; 