import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaStar, FaRoute, FaClock, FaSearch, FaCamera, FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaEdit, FaShare, FaUser, FaHeart, FaCrosshairs, FaMinus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
<<<<<<< Updated upstream

// 네이버 지도 컴포넌트 placeholder (동료가 구현 예정)
const NaverMap = () => <div style={{width: '100%', height: '100%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>NaverMap Placeholder</div>;
=======
import NaverMap from '../../components/NaverMap/Navermap';
import { useLocation } from '../../contexts/LocationContext';
>>>>>>> Stashed changes

const MapPage = () => {
  // LocationContext에서 사용자 위치 정보 가져오기
  const { userLocation, getDefaultLocation } = useLocation();
  const mapRef = useRef(null);

  // 사용자 정보 (실제로는 AuthContext에서 가져와야 함)
  const [currentUser] = useState({
    id: 1,
    name: '사용자',
    email: 'user@example.com'
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([
    { id: 'restaurant', name: '음식점', color: '#FF6B6B' },
    { id: 'cafe', name: '카페', color: '#4ECDC4' },
    { id: 'bookstore', name: '서점', color: '#45B7D1' },
    { id: 'library', name: '도서관', color: '#96CEB4' },
    { id: 'park', name: '공원', color: '#FFEAA7' },
    { id: 'print', name: '인쇄', color: '#A8E6CF' },
    { id: 'partner', name: '제휴업체', color: '#FFB3BA' }
  ]);
  
  const [places, setPlaces] = useState([
    {
      id: 1,
      name: '홍대 서점',
      lat: 37.5575,
      lng: 126.9250,
      category: 'bookstore',
      rating: 4.5,
      address: '서울 마포구 홍대로 123',
      photos: [],
      createdBy: 1,
      reviews: [
        { 
          id: 1, 
          rating: 5, 
          comment: '책이 정말 많아요!', 
          author: '김철수', 
          authorId: 2,
          date: '2024-01-15',
          likes: 3,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        },
        { 
          id: 2, 
          rating: 4, 
          comment: '좋은 분위기입니다.', 
          author: '이영희', 
          authorId: 3,
          date: '2024-01-10',
          likes: 1,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 2,
      name: '홍대 카페',
      lat: 37.5580,
      lng: 126.9260,
      category: 'cafe',
      rating: 4.2,
      address: '서울 마포구 홍대로 456',
      photos: [],
      createdBy: 1,
      reviews: [
        { 
          id: 3, 
          rating: 4, 
          comment: '커피가 맛있어요', 
          author: '박민수', 
          authorId: 4,
          date: '2024-01-12',
          likes: 2,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    }
  ]);

  // 상태 관리
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showPlaceDetail, setShowPlaceDetail] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMapAddPlace, setShowMapAddPlace] = useState(false);
  const [showExistingPlaceModal, setShowExistingPlaceModal] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#FF6B6B' });
  const [newPlace, setNewPlace] = useState({ 
    name: '', 
    category: 'restaurant', 
    address: '', 
    description: '',
    photos: []
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapClickMode, setMapClickMode] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routePath, setRoutePath] = useState(null); // State for route path coordinates
  const [currentZoom, setCurrentZoom] = useState(16); // Current zoom level
  const [isDragging, setIsDragging] = useState(false); // Slider drag state

  // 카테고리별 장소 필터링 + 검색
  const filteredPlaces = places.filter(place => {
    const categoryMatch = selectedCategory === 'all' || place.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // 선택된 카테고리의 기존 장소들
  const existingPlacesInCategory = places.filter(place => 
    place.category === selectedCategoryForAdd
  );

  // 내가 작성한 리뷰들
  const myReviews = places.flatMap(place => 
    place.reviews
      .filter(review => review.authorId === currentUser.id)
      .map(review => ({ ...review, placeName: place.name, placeId: place.id }))
  );

  // 평균 별점 계산
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // 베스트 리뷰 찾기 (좋아요가 가장 많은 리뷰)
  const getBestReview = (reviews) => {
    if (reviews.length === 0) return null;
    return reviews.reduce((best, current) => 
      current.likes > best.likes ? current : best
    );
  };

  // 장소 검색
  const searchPlaces = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = places.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  // 검색어 변경 시 검색 실행
  useEffect(() => {
    searchPlaces(searchQuery);
  }, [searchQuery]);

  // 경로 정보 가져오기 (실제로는 네이버 지도 API 사용)
  const getRouteInfo = (destination) => {
    console.log('getRouteInfo 호출됨:', destination);
    const currentLoc = userLocation || getDefaultLocation();
    console.log('현재 위치:', currentLoc);
    
    if (!currentLoc) {
      setRouteInfo({ error: '현재 위치를 찾을 수 없습니다.' });
      return;
    }

    // 거리 계산 (간단한 유클리드 거리)
    const distance = Math.sqrt(
      Math.pow(destination.lat - currentLoc.lat, 2) + 
      Math.pow(destination.lng - currentLoc.lng, 2)
    ) * 111000; // 대략적인 미터 단위

    // 예상 시간 계산 (도보 기준)
    const timeMinutes = Math.round(distance / 80); // 분당 80m

    const routeData = {
      distance: `${Math.round(distance)}m`,
      time: `${timeMinutes}분`,
      method: '도보',
      description: `${currentLoc.name}에서 ${destination.name}까지`
    };

    setRouteInfo(routeData);

    // 경로를 지도에 표시하기 위한 데이터 설정
    const pathData = {
      start: { lat: currentLoc.lat, lng: currentLoc.lng },
      end: { lat: destination.lat, lng: destination.lng }
    };
    
    console.log('경로 데이터 설정:', pathData);
    setRoutePath(pathData);
  };

  // 장소 상세 정보 열 때 자동으로 경로 정보 계산
  useEffect(() => {
    console.log('showPlaceDetail 변경됨:', showPlaceDetail);
    if (showPlaceDetail) {
      console.log('경로 정보 계산 시작');
      getRouteInfo(showPlaceDetail);
    } else {
      console.log('경로 정보 초기화');
      setRoutePath(null);
    }
  }, [showPlaceDetail]);

  // 장소 공유
  const sharePlace = async (place) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `${place.name} - ${place.address}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 복사
      const text = `${place.name} - ${place.address}`;
      await navigator.clipboard.writeText(text);
      alert('장소 정보가 클립보드에 복사되었습니다.');
    }
  };

  // 나의 위치로 지도 이동
  const moveToMyLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentLoc = userLocation || getDefaultLocation();
    if (!currentLoc) {
      alert('현재 위치를 찾을 수 없습니다. 마이페이지에서 위치를 설정해주세요.');
      return;
    }

    // ref를 통해 NaverMap 컴포넌트의 moveToLocation 메서드 호출
    if (mapRef.current) {
      mapRef.current.moveToLocation(currentLoc.lat, currentLoc.lng, 16);
    }
  };

  // 지도 확대
  const zoomIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setCurrentZoom(prev => Math.min(20, prev + 1));
    }
  };

  // 지도 축소
  const zoomOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setCurrentZoom(prev => Math.max(1, prev - 1));
    }
  };

  // 슬라이더 드래그 시작
  const handleSliderMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleSliderMouseMove);
    document.addEventListener('mouseup', handleSliderMouseUp);
  };

  // 슬라이더 드래그 중
  const handleSliderMouseMove = (e) => {
    if (!isDragging) return;
    
    const track = e.currentTarget.querySelector('.zoom-track');
    if (!track) return;
    
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // 줌 레벨 계산 (1-20 범위)
    const zoomLevel = Math.max(1, Math.min(20, 21 - Math.round((y / height) * 20)));
    
    if (mapRef.current && zoomLevel !== currentZoom) {
      mapRef.current.setZoom(zoomLevel);
      setCurrentZoom(zoomLevel);
    }
  };

  // 슬라이더 드래그 종료
  const handleSliderMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleSliderMouseMove);
    document.removeEventListener('mouseup', handleSliderMouseUp);
  };

  // 슬라이더 클릭
  const handleSliderClick = (e) => {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    const zoomLevel = Math.max(1, Math.min(20, 21 - Math.round((y / height) * 20)));
    
    if (mapRef.current) {
      mapRef.current.setZoom(zoomLevel);
      setCurrentZoom(zoomLevel);
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowAddPlace(false);
        setShowPlaceDetail(null);
        setShowCategoryModal(false);
        setShowMapAddPlace(false);
        setShowExistingPlaceModal(false);
        setShowMyReviews(false);
        setShowSearchResults(false);
        setMapClickMode(false);
      }
      // Ctrl + L 또는 Cmd + L로 내 위치로 이동
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        moveToMyLocation();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [userLocation]);

  // 카테고리 추가
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
    if (selectedCategory === categoryId) {
      setSelectedCategory('all');
    }
  };

  // 카테고리에 장소 추가
  const addPlaceToCategory = (categoryId) => {
    setSelectedCategoryForAdd(categoryId);
    setShowExistingPlaceModal(true);
  };

  // 장소 추가
  const addPlace = () => {
    if (newPlace.name.trim()) {
      const place = {
        id: Date.now(),
        name: newPlace.name,
        lat: selectedLocation ? selectedLocation.lat : 37.5665,
        lng: selectedLocation ? selectedLocation.lng : 126.978,
        category: newPlace.category,
        address: newPlace.address,
        description: newPlace.description,
        rating: 0,
        photos: newPlace.photos,
        createdBy: currentUser.id,
        reviews: []
      };
      setPlaces([...places, place]);
      setNewPlace({ 
        name: '', 
        category: 'restaurant', 
        address: '', 
        description: '',
        photos: []
      });
      setShowAddPlace(false);
      setShowMapAddPlace(false);
      setSelectedLocation(null);
      setMapClickMode(false);
    }
  };

  // 지도 클릭으로 장소 추가 시작
  const startMapAddPlace = () => {
    setMapClickMode(true);
    setShowMapAddPlace(true);
    console.log('지도 클릭 모드 활성화');
  };

  // 지도 클릭 이벤트 처리
  const handleMapClick = (lat, lng) => {
    console.log('지도 클릭됨:', lat, lng, 'mapClickMode:', mapClickMode);
    if (mapClickMode) {
      setSelectedLocation({ lat, lng });
      setShowAddPlace(true);
      setMapClickMode(false);
      console.log('장소 추가 모달 열림');
    }
  };

  // 사진 업로드 처리
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setNewPlace({ ...newPlace, photos: [...newPlace.photos, ...photoUrls] });
  };

  // 리뷰 추가
  const addReview = () => {
    if (newReview.comment.trim() && showPlaceDetail) {
      const review = {
        id: Date.now(),
        rating: newReview.rating,
        comment: newReview.comment,
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        dislikes: 0,
        userLiked: false,
        userDisliked: false
      };

      setPlaces(places.map(place => 
        place.id === showPlaceDetail.id 
          ? { ...place, reviews: [...place.reviews, review] }
          : place
      ));

      setNewReview({ rating: 5, comment: '' });
    }
  };

  // 리뷰 수정
  const editReview = (reviewId, newContent, newRating) => {
    setPlaces(places.map(place => ({
      ...place,
      reviews: place.reviews.map(review => 
        review.id === reviewId 
          ? { ...review, comment: newContent, rating: newRating }
          : review
      )
    })));
    setEditingReview(null);
  };

  // 리뷰 삭제
  const deleteReview = (reviewId) => {
    setPlaces(places.map(place => ({
      ...place,
      reviews: place.reviews.filter(review => review.id !== reviewId)
    })));
  };

  // 리뷰 좋아요/싫어요 토글
  const toggleReviewReaction = (reviewId, reaction) => {
    setPlaces(places.map(place => ({
      ...place,
      reviews: place.reviews.map(review => {
        if (review.id === reviewId) {
          const newReview = { ...review };
          
          if (reaction === 'like') {
            if (newReview.userLiked) {
              newReview.likes--;
              newReview.userLiked = false;
            } else {
              newReview.likes++;
              newReview.userLiked = true;
              if (newReview.userDisliked) {
                newReview.dislikes--;
                newReview.userDisliked = false;
              }
            }
          } else if (reaction === 'dislike') {
            if (newReview.userDisliked) {
              newReview.dislikes--;
              newReview.userDisliked = false;
            } else {
              newReview.dislikes++;
              newReview.userDisliked = true;
              if (newReview.userLiked) {
                newReview.likes--;
                newReview.userLiked = false;
              }
            }
          }
          
          return newReview;
        }
        return review;
      })
    })));
  };

  return (
    <MapPageContainer>
      <Sidebar>
        <SidebarHeader>
          <h2>지도</h2>
          <HeaderButtons>
            <AddButton onClick={startMapAddPlace}>
              <FaMapMarkerAlt /> 지도에서 장소 추가
            </AddButton>
            <AddButton onClick={() => setShowMyReviews(true)}>
              <FaUser /> 내 리뷰
            </AddButton>
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
                <CategoryActions>
                  <AddButton 
                    small
                    onClick={(e) => {
                      e.stopPropagation();
                      addPlaceToCategory(category.id);
                    }}
                  >
                    <FaPlus />
                  </AddButton>
                  <DeleteButton onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }}>
                    <FaTrash />
                  </DeleteButton>
                </CategoryActions>
              </CategoryItem>
            ))}
          </CategoryList>
        </CategorySection>
        <PlacesSection>
          <h3>장소</h3>
          <SearchContainer>
            <FaSearch />
            <SearchInput
              placeholder="장소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <PlacesList>
            {(searchQuery ? searchResults : filteredPlaces).map(place => (
              <PlaceItem key={place.id} onClick={() => setShowPlaceDetail(place)}>
                <PlaceInfo>
                  <PlaceName>{place.name}</PlaceName>
                  <PlaceCategory>{categories.find(c => c.id === place.category)?.name}</PlaceCategory>
                  <PlaceAddress>{place.address}</PlaceAddress>
                  <PlaceRating>
                    <FaStar style={{ color: '#FFD700' }} />
                    {calculateAverageRating(place.reviews)}
                  </PlaceRating>
                  {searchQuery && getBestReview(place.reviews) && (
                    <BestReview>
                      <FaHeart style={{ color: '#dc3545' }} />
                      {getBestReview(place.reviews).comment}
                    </BestReview>
                  )}
                </PlaceInfo>
                <RouteButton onClick={(e) => {
                  e.stopPropagation();
                  getRouteInfo(place);
                }}>
                  <FaRoute />
                </RouteButton>
              </PlaceItem>
            ))}
          </PlacesList>
        </PlacesSection>
      </Sidebar>

      <StyledMapContainer>
<<<<<<< Updated upstream
        {/* 네이버 지도 컴포넌트로 교체 예정 */}
        <NaverMap />
=======
        {console.log('NaverMap에 전달되는 routePath:', routePath)}
        <NaverMap 
          ref={mapRef}
          places={filteredPlaces}
          categories={categories}
          onMapClick={handleMapClick}
          mapClickMode={mapClickMode}
          userLocation={userLocation}
          routePath={routePath}
        />
        
        {mapClickMode && (
          <MapClickOverlay>
            <MapClickMessage>
              지도를 클릭하여 장소를 추가하세요
            </MapClickMessage>
          </MapClickOverlay>
        )}
        <MapControls>
          <LocationButton onClick={moveToMyLocation} title="내 위치로 이동">
            <FaCrosshairs />
          </LocationButton>
          <ZoomControls>
            <ZoomButton onClick={zoomIn} title="확대">
              <FaPlus />
            </ZoomButton>
            <ZoomSlider 
              className="zoom-track"
              onClick={handleSliderClick}
              onMouseDown={handleSliderMouseDown}
            >
              <ZoomThumb 
                style={{ 
                  top: `${100 - ((currentZoom - 1) / 19) * 100}%` 
                }} 
              />
              <ZoomLevel>{currentZoom}</ZoomLevel>
            </ZoomSlider>
            <ZoomButton onClick={zoomOut} title="축소">
              <FaMinus />
            </ZoomButton>
          </ZoomControls>
        </MapControls>
>>>>>>> Stashed changes
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
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              />
              <Select
                value={newPlace.category}
                onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="주소"
                value={newPlace.address}
                onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
              />
              <TextArea
                placeholder="설명 (선택사항)"
                value={newPlace.description}
                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
              />
              <PhotoUploadSection>
                <h5>사진 추가</h5>
                <PhotoUploadButton htmlFor="photo-upload">
                  <FaCamera /> 사진 선택
                </PhotoUploadButton>
                <PhotoUploadInput
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <PhotoPreview>
                  {newPlace.photos.map((photo, index) => (
                    <PhotoItem key={index}>
                      <img src={photo} alt={`사진 ${index + 1}`} />
                    </PhotoItem>
                  ))}
                </PhotoPreview>
              </PhotoUploadSection>
              {selectedLocation && (
                <LocationInfo>
                  <FaMapMarkerAlt />
                  선택된 위치: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </LocationInfo>
              )}
              <Button onClick={addPlace}>장소 추가</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 장소 상세 정보 모달 */}
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
                <p><strong>카테고리:</strong> {categories.find(c => c.id === showPlaceDetail.category)?.name}</p>
                <p><strong>주소:</strong> {showPlaceDetail.address}</p>
                <p><strong>평점:</strong> {calculateAverageRating(showPlaceDetail.reviews)}</p>
                {showPlaceDetail.description && (
                  <p><strong>설명:</strong> {showPlaceDetail.description}</p>
                )}
              </PlaceDetailInfo>

              <ActionButtons>
                <ActionButton onClick={() => sharePlace(showPlaceDetail)}>
                  <FaShare /> 공유
                </ActionButton>
                <ActionButton onClick={() => {
                  setSelectedCategoryForAdd(showPlaceDetail.category);
                  setShowExistingPlaceModal(true);
                }}>
                  <FaPlus /> 카테고리 추가
                </ActionButton>
              </ActionButtons>

              {routeInfo && (
                <RouteInfo>
                  <FaRoute />
                  {routeInfo.error ? routeInfo.error : 
                    `${routeInfo.description} - ${routeInfo.distance} (${routeInfo.time})`
                  }
                </RouteInfo>
              )}

              {showPlaceDetail.photos.length > 0 && (
                <PhotosSection>
                  <h4>사진</h4>
                  <PhotoGrid>
                    {showPlaceDetail.photos.map((photo, index) => (
                      <PhotoItem key={index}>
                        <img src={photo} alt={`사진 ${index + 1}`} />
                      </PhotoItem>
                    ))}
                  </PhotoGrid>
                </PhotosSection>
              )}

              <ReviewsSection>
                <h4>리뷰 ({showPlaceDetail.reviews.length})</h4>
                {showPlaceDetail.reviews.map(review => (
                  <ReviewItem key={review.id}>
                    <ReviewHeader>
                      <span>{review.author} • {review.date}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            style={{ 
                              color: i < review.rating ? '#FFD700' : '#e0e0e0',
                              fontSize: '12px'
                            }} 
                          />
                        ))}
                      </div>
                    </ReviewHeader>
                    <ReviewComment>{review.comment}</ReviewComment>
                    <ReviewReactions>
                      <ReactionButton
                        active={review.userLiked}
                        onClick={() => toggleReviewReaction(review.id, 'like')}
                      >
                        <FaThumbsUp />
                        {review.likes}
                      </ReactionButton>
                      <ReactionButton
                        active={review.userDisliked}
                        onClick={() => toggleReviewReaction(review.id, 'dislike')}
                      >
                        <FaThumbsDown />
                        {review.dislikes}
                      </ReactionButton>
                    </ReviewReactions>
                    {review.authorId === currentUser.id && (
                      <ReviewActions>
                        <ActionButton 
                          small 
                          onClick={() => setEditingReview(review)}
                        >
                          <FaEdit /> 수정
                        </ActionButton>
                        <ActionButton 
                          small 
                          onClick={() => deleteReview(review.id)}
                        >
                          <FaTrash /> 삭제
                        </ActionButton>
                      </ReviewActions>
                    )}
                  </ReviewItem>
                ))}
              </ReviewsSection>

              <AddReviewSection>
                <h5>리뷰 작성</h5>
                <RatingInput>
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarButton
                      key={star}
                      active={star <= newReview.rating}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      ★
                    </StarButton>
                  ))}
                </RatingInput>
                <TextArea
                  placeholder="리뷰를 작성하세요..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                />
                <Button onClick={addReview}>리뷰 추가</Button>
              </AddReviewSection>
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
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <ColorInput
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
              <Button onClick={addCategory}>카테고리 추가</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 기존 장소 추가 모달 */}
      {showExistingPlaceModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>카테고리에 장소 추가</h3>
              <CloseButton onClick={() => setShowExistingPlaceModal(false)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <PlacesList>
                {existingPlacesInCategory.map(place => (
                  <PlaceItem key={place.id} onClick={() => setShowExistingPlaceModal(false)}>
                    <PlaceInfo>
                      <PlaceName>{place.name}</PlaceName>
                      <PlaceAddress>{place.address}</PlaceAddress>
                    </PlaceInfo>
                  </PlaceItem>
                ))}
              </PlacesList>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 내 리뷰 모달 */}
      {showMyReviews && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>내 리뷰</h3>
              <CloseButton onClick={() => setShowMyReviews(false)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <MyReviewsList>
                {myReviews.map(review => (
                  <MyReviewItem key={review.id}>
                    <MyReviewHeader>
                      <h4>{review.placeName}</h4>
                      <span>{review.date}</span>
                    </MyReviewHeader>
                    <MyReviewComment>{review.comment}</MyReviewComment>
                    <MyReviewActions>
                      <ActionButton 
                        small 
                        onClick={() => setEditingReview(review)}
                      >
                        <FaEdit /> 수정
                      </ActionButton>
                      <ActionButton 
                        small 
                        onClick={() => deleteReview(review.id)}
                      >
                        <FaTrash /> 삭제
                      </ActionButton>
                    </MyReviewActions>
                  </MyReviewItem>
                ))}
              </MyReviewsList>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>리뷰 수정</h3>
              <CloseButton onClick={() => setEditingReview(null)}>
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <RatingInput>
                {[1, 2, 3, 4, 5].map(star => (
                  <StarButton
                    key={star}
                    active={star <= editingReview.rating}
                    onClick={() => setEditingReview({ ...editingReview, rating: star })}
                  >
                    ★
                  </StarButton>
                ))}
              </RatingInput>
              <TextArea
                placeholder="리뷰를 작성하세요..."
                value={editingReview.comment}
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
              />
              <Button onClick={() => editReview(editingReview.id, editingReview.comment, editingReview.rating)}>
                수정 완료
              </Button>
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
  background: #ffffff;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: calc(100vh - 60px);
    margin-top: 60px;
  }
`;

const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 20px;
    font-weight: 600;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AddButton = styled.button`
  background: ${props => props.active ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  padding: ${props => props.small ? '4px 8px' : '8px 12px'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.small ? '10px' : '12px'};
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#c82333' : '#0056b3'};
  }
`;

const CategorySection = styled.div`
  margin-bottom: 24px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.active ? '#f8f9fa' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#666'};
  border-left: 3px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  span {
    font-weight: 500;
  }
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${CategoryItem}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 8px;
  
  &:hover {
    background: #c82333;
  }
`;

const PlacesSection = styled.div`
  h3 {
    margin: 0 0 12px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  
  &:focus-within {
    border-color: #007bff;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
`;

const PlacesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlaceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }
`;

const PlaceInfo = styled.div`
  flex: 1;
`;

const PlaceName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: #1a1a1a;
  font-size: 14px;
`;

const PlaceCategory = styled.div`
  font-size: 11px;
  color: #007bff;
  margin-bottom: 2px;
  font-weight: 500;
  text-transform: uppercase;
`;

const PlaceAddress = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
`;

const PlaceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
`;

const BestReview = styled.div`
  font-size: 10px;
  color: #dc3545;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RouteButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 10px;
  
  &:hover {
    background: #0056b3;
  }
`;

const StyledMapContainer = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  margin: 16px;
  
  @media (max-width: 768px) {
    height: calc(100vh - 216px);
    margin: 8px;
  }
`;

const MapClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const MapClickMessage = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
  font-size: 16px;
  color: #333;
  max-width: 300px;
`;

const MapControls = styled.div`
  position: absolute;
  bottom: 40px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
`;

const LocationButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.2s ease;
  border-radius: 8px;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ZoomControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  position: relative;
`;

const ZoomButton = styled.button`
  background: rgba(0, 123, 255, 0.6);
  color: white;
  border: none;
  width: 28px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;

  svg {
    width: 10px;
    height: 10px;
  }

  &:hover {
    background: rgba(0, 86, 179, 0.7);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1);
  }
`;

const ZoomSlider = styled.div`
  width: 3px;
  height: 80px;
  background: rgba(233, 236, 239, 0.8);
  position: relative;
  cursor: pointer;
  border-radius: 2px;
  margin: 2px 0;
`;

const ZoomThumb = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 12px;
  background: rgba(0, 123, 255, 0.4);
  border-radius: 2px;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0, 123, 255, 0.2);

  &:active {
    cursor: grabbing;
  }
`;

const ZoomLevel = styled.div`
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);

  ${ZoomSlider}:hover & {
    opacity: 1;
  }

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 4px solid rgba(0, 0, 0, 0.6);
  }
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
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
`;

const CloseButton = styled.button`
  background: none;
  color: #666;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ColorInput = styled.input`
  width: 50px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: #0056b3;
  }
`;

const PlaceDetailInfo = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  
  p {
    margin: 6px 0;
    color: #666;
    font-size: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => props.small ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  padding: ${props => props.small ? '4px 8px' : '8px 12px'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.small ? '10px' : '12px'};
  font-weight: 500;
  
  &:hover {
    background: ${props => props.small ? '#5a6268' : '#0056b3'};
  }
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const PhotosSection = styled.div`
  h4 {
    margin: 0 0 12px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 6px;
`;

const PhotoItem = styled.div`
  width: 100%;
  height: 80px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ReviewsSection = styled.div`
  h4 {
    margin: 0 0 16px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const ReviewItem = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background: white;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #666;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ReviewComment = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const ReviewReactions = styled.div`
  display: flex;
  gap: 6px;
`;

const ReactionButton = styled.button`
  background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

const AddReviewSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  
  h5 {
    margin: 0 0 12px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const RatingInput = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${props => props.active ? '#ffc107' : '#e0e0e0'};
  
  &:hover {
    color: #ffc107;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  min-height: 80px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PhotoUploadSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  
  h5 {
    margin: 0 0 12px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const PhotoUploadInput = styled.input`
  display: none;
`;

const PhotoPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const PhotoUploadButton = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  
  &:hover {
    background: #0056b3;
  }
`;

const LocationInfo = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const MyReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MyReviewItem = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  background: white;
`;

const MyReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h4 {
    margin: 0;
    color: #1a1a1a;
    font-size: 14px;
    font-weight: 600;
  }
  
  span {
    font-size: 12px;
    color: #666;
  }
`;

const MyReviewComment = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.4;
`;

const MyReviewActions = styled.div`
  display: flex;
  gap: 6px;
`;

export default MapPage; 