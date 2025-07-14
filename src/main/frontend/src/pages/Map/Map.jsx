import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaStar, FaRoute, FaClock, FaSearch, FaQuestionCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

// 네이버 지도 컴포넌트 placeholder (동료가 구현 예정)
const NaverMap = () => <div style={{width: '100%', height: '100%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>NaverMap Placeholder</div>;

const MapPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([
    { id: 'restaurant', name: '음식점', color: '#FF6B6B' },
    { id: 'cafe', name: '카페', color: '#4ECDC4' },
    { id: 'bookstore', name: '서점', color: '#45B7D1' },
    { id: 'library', name: '도서관', color: '#96CEB4' },
    { id: 'park', name: '공원', color: '#FFEAA7' }
  ]);
  const [places, setPlaces] = useState([
    {
      id: 1,
      name: '홍대 서점',
      lat: 37.5575,
      lng: 126.9250,
      category: 'bookstore',
      rating: 4.5,
      reviews: [
        { id: 1, rating: 5, comment: '책이 정말 많아요!', author: '김철수' },
        { id: 2, rating: 4, comment: '좋은 분위기입니다.', author: '이영희' }
      ]
    },
    {
      id: 2,
      name: '홍대 카페',
      lat: 37.5580,
      lng: 126.9260,
      category: 'cafe',
      rating: 4.2,
      reviews: [
        { id: 3, rating: 4, comment: '커피가 맛있어요', author: '박민수' }
      ]
    }
  ]);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showPlaceDetail, setShowPlaceDetail] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#FF6B6B' });
  const [newPlace, setNewPlace] = useState({ name: '', category: 'restaurant' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // 카테고리별 장소 필터링 + 검색
  const filteredPlaces = places.filter(place => {
    const categoryMatch = selectedCategory === 'all' || place.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 평균 별점 계산
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // 새 카테고리 추가
  const addCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: Date.now().toString(),
        name: newCategory.name,
        color: newCategory.color
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', color: '#FF6B6B' });
      setShowCategoryModal(false);
    }
  };

  // 카테고리 삭제
  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    setPlaces(places.filter(place => place.category !== categoryId));
  };

  // 새 장소 추가
  const addPlace = () => {
    if (newPlace.name.trim()) {
      const place = {
        id: Date.now(),
        name: newPlace.name,
        lat: 0, // 네이버 지도에서 실제 좌표 받아서 넣으세요
        lng: 0,
        category: newPlace.category,
        rating: 0,
        reviews: []
      };
      setPlaces([...places, place]);
      setNewPlace({ name: '', category: 'restaurant' });
      setShowAddPlace(false);
      setIsAddingPlace(false);
    }
  };

  // 리뷰 추가
  const addReview = (placeId) => {
    if (newReview.comment.trim()) {
      const review = {
        id: Date.now(),
        rating: newReview.rating,
        comment: newReview.comment,
        author: '사용자'
      };
      setPlaces(places.map(place => 
        place.id === placeId 
          ? { ...place, reviews: [...place.reviews, review] }
          : place
      ));
      setNewReview({ rating: 5, comment: '' });
    }
  };

  // 장소 추가 모드 토글
  const toggleAddPlaceMode = () => {
    setIsAddingPlace(!isAddingPlace);
    if (!isAddingPlace) {
      setShowAddPlace(true);
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        setShowAddPlace(false);
        setShowPlaceDetail(null);
        setShowCategoryModal(false);
        setIsAddingPlace(false);
      }
      if (event.key === 'a' && event.ctrlKey) {
        event.preventDefault();
        toggleAddPlaceMode();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAddingPlace]);

  return (
    <MapPageContainer>
      <Sidebar>
        <SidebarHeader>
          <h2>지도</h2>
          <HeaderButtons>
            <AddButton 
              onClick={toggleAddPlaceMode}
              active={isAddingPlace}
            >
              <FaPlus /> {isAddingPlace ? '추가 모드 해제' : '장소 추가'}
            </AddButton>
            <HelpButton onClick={() => setShowHelp(!showHelp)}>
              <FaQuestionCircle />
            </HelpButton>
          </HeaderButtons>
        </SidebarHeader>
        <CategorySection>
          <CategoryHeader>
            <h3>카테고리</h3>
            <AddButton onClick={() => setShowCategoryModal(true)}>
              <FaPlus />
            </AddButton>
          </CategoryHeader>
          <CategoryList>
            <CategoryItem 
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </CategoryItem>
            {categories.map(category => (
              <CategoryItem 
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
                color={category.color}
              >
                <span>{category.name}</span>
                <DeleteButton onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(category.id);
                }}>
                  <FaTrash />
                </DeleteButton>
              </CategoryItem>
            ))}
          </CategoryList>
        </CategorySection>
        <PlacesSection>
          <h3>장소 목록</h3>
          <SearchContainer>
            <SearchInput
              placeholder="장소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch style={{ color: '#666', marginLeft: '10px' }} />
          </SearchContainer>
          <PlacesList>
            {filteredPlaces.map(place => (
              <PlaceItem 
                key={place.id}
                onClick={() => setShowPlaceDetail(place)}
              >
                <PlaceInfo>
                  <PlaceName>{place.name}</PlaceName>
                  <PlaceCategory>
                    {categories.find(cat => cat.id === place.category)?.name}
                  </PlaceCategory>
                  <PlaceRating>
                    <FaStar style={{ color: '#FFD700' }} />
                    {calculateAverageRating(place.reviews)}
                    <span>({place.reviews.length}개 리뷰)</span>
                  </PlaceRating>
                </PlaceInfo>
                <RouteButton onClick={(e) => {
                  e.stopPropagation();
                  // 네이버 지도 경로 안내 기능 구현 필요
                }}>
                  <FaRoute />
                </RouteButton>
              </PlaceItem>
            ))}
          </PlacesList>
        </PlacesSection>
        <StatsSection>
          <h3>통계</h3>
          <StatsGrid>
            <StatItem>
              <StatNumber>{places.length}</StatNumber>
              <StatLabel>총 장소</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{categories.length}</StatNumber>
              <StatLabel>카테고리</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>
                {places.reduce((total, place) => total + place.reviews.length, 0)}
              </StatNumber>
              <StatLabel>총 리뷰</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>
                {places.length > 0 
                  ? (places.reduce((total, place) => total + calculateAverageRating(place.reviews), 0) / places.length).toFixed(1)
                  : '0.0'
                }
              </StatNumber>
              <StatLabel>평균 별점</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsSection>
        {showHelp && (
          <HelpSection>
            <h3>사용법</h3>
            <HelpList>
              <HelpItem>
                <strong>장소 추가:</strong> "장소 추가" 버튼을 클릭한 후 지도를 클릭하세요
              </HelpItem>
              <HelpItem>
                <strong>카테고리 관리:</strong> 카테고리 옆의 + 버튼으로 새 카테고리를 추가할 수 있습니다
              </HelpItem>
              <HelpItem>
                <strong>경로 확인:</strong> 장소 옆의 경로 버튼을 클릭하면 내 위치에서의 경로를 확인할 수 있습니다
              </HelpItem>
              <HelpItem>
                <strong>단축키:</strong> Ctrl+A로 장소 추가 모드를 토글할 수 있습니다
              </HelpItem>
            </HelpList>
          </HelpSection>
        )}
      </Sidebar>
      <StyledMapContainer>
        {/* 네이버 지도 컴포넌트로 교체 예정 */}
        <NaverMap />
      </StyledMapContainer>
      {/* 장소 추가 모달 */}
      {showAddPlace && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>새 장소 추가</h3>
              <CloseButton onClick={() => setShowAddPlace(false)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Input
                placeholder="장소 이름"
                value={newPlace.name}
                onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
              />
              <Select
                value={newPlace.category}
                onChange={(e) => setNewPlace({...newPlace, category: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Button onClick={addPlace}>추가</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {/* 장소 상세 모달 */}
      {showPlaceDetail && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{showPlaceDetail.name}</h3>
              <CloseButton onClick={() => setShowPlaceDetail(null)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <PlaceDetailInfo>
                <p>카테고리: {categories.find(cat => cat.id === showPlaceDetail.category)?.name}</p>
                <p>평균 별점: {calculateAverageRating(showPlaceDetail.reviews)}</p>
              </PlaceDetailInfo>
              <ReviewsSection>
                <h4>리뷰</h4>
                {showPlaceDetail.reviews.map(review => (
                  <ReviewItem key={review.id}>
                    <ReviewHeader>
                      <span>{review.author}</span>
                      <span>{'★'.repeat(review.rating)}</span>
                    </ReviewHeader>
                    <ReviewComment>{review.comment}</ReviewComment>
                  </ReviewItem>
                ))}
                <AddReviewSection>
                  <h5>리뷰 작성</h5>
                  <RatingInput>
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarButton
                        key={star}
                        active={star <= newReview.rating}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      >
                        ★
                      </StarButton>
                    ))}
                  </RatingInput>
                  <TextArea
                    placeholder="리뷰를 작성해주세요"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  />
                  <Button onClick={() => addReview(showPlaceDetail.id)}>
                    리뷰 작성
                  </Button>
                </AddReviewSection>
              </ReviewsSection>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {/* 카테고리 추가 모달 */}
      {showCategoryModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>새 카테고리 추가</h3>
              <CloseButton onClick={() => setShowCategoryModal(false)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Input
                placeholder="카테고리 이름"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
              <ColorInput
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
              />
              <Button onClick={addCategory}>추가</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </MapPageContainer>
  );
};

// Styled Components
const MapPageContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  margin-top: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: calc(100vh - 60px);
    margin-top: 60px;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const HelpButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #5a6268;
  }
`;

const AddButton = styled.button`
  background: ${props => props.active ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.active ? '#c82333' : '#0056b3'};
  }
`;

const CategorySection = styled.div`
  margin-bottom: 30px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  h3 {
    margin: 0;
    color: #333;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  border-left: 3px solid ${props => props.color || '#007bff'};
  
  &:hover {
    background: #e3f2fd;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 2px;
  
  &:hover {
    color: #cc0000;
  }
`;

const PlacesSection = styled.div`
  h3 {
    margin: 0 0 15px 0;
    color: #333;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  
  &::placeholder {
    color: #999;
  }
`;

const StatsSection = styled.div`
  margin-top: 30px;
  
  h3 {
    margin: 0 0 15px 0;
    color: #333;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  margin-top: 60px;
  background: #f8f9fa;
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  margin-top: 60px;
  background: #f8f9fa;
  gap: 20px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #dc3545;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const HelpSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  
  h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
  }
`;

const HelpList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const HelpItem = styled.li`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  
  strong {
    color: #333;
  }
`;

const PlacesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlaceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const PlaceInfo = styled.div`
  flex: 1;
`;

const PlaceName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const PlaceCategory = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const PlaceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
`;

const RouteButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #0056b3;
  }
`;

// MapContainer styled-component를 StyledMapContainer로 변경
const StyledMapContainer = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  
  @media (max-width: 768px) {
    height: calc(100vh - 260px);
  }
`;

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background: #f8f9fa;
  }
`;

const MarkerContent = styled.div`
  color: ${props => props.color || '#FF6B6B'};
  font-size: 24px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  
  h3 {
    margin: 0;
  }
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

const ModalBody = styled.div`
  padding: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const PlaceDetailInfo = styled.div`
  margin-bottom: 20px;
  
  p {
    margin: 5px 0;
  }
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const ReviewsSection = styled.div`
  h4 {
    margin: 0 0 15px 0;
  }
`;

const ReviewItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
`;

const ReviewComment = styled.div`
  font-size: 14px;
`;

const AddReviewSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  
  h5 {
    margin: 0 0 10px 0;
  }
`;

const RatingInput = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${props => props.active ? '#FFD700' : '#ddd'};
  
  &:hover {
    color: #FFD700;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  min-height: 80px;
  resize: vertical;
`;

export default MapPage; 