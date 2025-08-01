import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaStar, FaRoute, FaClock, FaSearch, FaCamera, FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaEdit, FaShare, FaUser, FaHeart, FaCrosshairs, FaMinus, FaChevronDown } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';

import NaverMap from '../../components/NaverMap/Navermap';
import UserCategory from '../../components/UserCategory/UserCategory';
import PlaceDetailModal from '../../components/PlaceDetailModal/PlaceDetailModal';
import { useLocation } from '../../contexts/LocationContext';

// --- 백엔드 API 호출 함수들 ---

// 장소 검색 API (기존과 동일)
const searchPlacesFromBackend = async (query) => {
  if (!query.trim()) {
    return [];
  }
  const API_URL = `/api/places/search`;
  try {
    const response = await axios.get(API_URL, { params: { query } });
    const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    if (responseData && Array.isArray(responseData.items)) {
      return responseData.items.map(item => ({
        id: item.address + item.title,
        name: item.title.replace(/<[^>]*>?/g, ''),
        address: item.roadAddress || item.address,
        lat: Number(item.mapy) * 0.0000001,
        lng: Number(item.mapx) * 0.0000001,
        category: item.category,
      }));
    }
    return [];
  } catch (error) {
    console.error("Backend Search API Error:", error);
    alert('장소 검색 중 오류가 발생했습니다.');
    return [];
  }
};

// (추가) DB에 저장된 모든 장소를 가져오는 함수
const getPlacesFromBackend = async () => {
  try {
    const response = await axios.get('/api/places');
    return response.data;
  } catch (error) {
    console.error("Error fetching places from DB:", error);
    alert('저장된 장소를 불러오는 데 실패했습니다.');
    return [];
  }
};

// (추가) 새 장소를 DB에 저장하는 함수
const savePlaceToBackend = async (placeData) => {
  try {
    const response = await axios.post('/api/places', placeData);
    return response.data;
  } catch (error) {
    console.error("Error saving place to DB:", error);
    alert('장소 저장에 실패했습니다.');
    return null;
  }
};


const MapPage = () => {
  const { userLocation, getDefaultLocation } = useLocation();
  const mapRef = useRef(null);

  const [currentUser] = useState({ id: 1, name: '사용자', email: 'user@example.com' });
  const [selectedType, setSelectedType] = useState('all');
  const [userCategories, setUserCategories] = useState([
    { id: 1, name: '자주 가는 곳' },
    { id: 2, name: '맛집 리스트' },
    { id: 3, name: '스터디 카페' }
  ]);
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
      name: '홍익대학교',
      category: 'partner',
      address: '서울특별시 마포구 와우산로 94',
      description: '홍익대학교 본교',
      lat: 37.5484,
      lng: 126.9244,
      reviews: [
        {
          id: 1,
          userName: '학생1',
          rating: 5,
          content: '학교가 정말 예쁘고 분위기가 좋아요! 특히 봄철 벚꽃이 피는 모습이 환상적입니다.',
          likes: 12,
          dislikes: 0,
          photos: []
        },
        {
          id: 2,
          userName: '학생2',
          rating: 4,
          content: '교수님들이 친절하고 수업도 재미있어요.',
          likes: 8,
          dislikes: 1,
          photos: []
        }
      ]
    },
    {
      id: 2,
      name: '상수역',
      category: 'other',
      address: '서울특별시 마포구 상수동',
      description: '지하철 6호선 상수역',
      lat: 37.5477,
      lng: 126.9225,
      reviews: []
    },
    {
      id: 3,
      name: '맥도날드 홍대점',
      category: 'restaurant',
      address: '서울특별시 마포구 와우산로 23길 20',
      description: '맥도날드 홍대점',
      lat: 37.5490,
      lng: 126.9250,
      reviews: [
        {
          id: 3,
          userName: '맛집탐험가',
          rating: 3,
          content: '일반적인 맥도날드 맛이에요. 위치가 좋아서 자주 이용합니다.',
          likes: 5,
          dislikes: 2,
          photos: []
        }
      ]
    }
  ]);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newPlace, setNewPlace] = useState({
    name: '', category: 'restaurant', address: '', detailedAddress: '',
    description: '', photos: [], coordinates: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapClickMode, setMapClickMode] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- 🔥 수정된 부분: 컴포넌트 마운트 시 DB 연동 및 초기 위치 설정 ---
  useEffect(() => {
    // 1. DB에서 저장된 장소 목록을 가져와 상태에 설정
    getPlacesFromBackend().then(savedPlaces => {
      if (savedPlaces && savedPlaces.length > 0) {
        setPlaces(savedPlaces);
      }
    });

    // 2. 지도의 초기 위치를 상수역으로 설정
    const sangsuStation = { lat: 37.5484, lng: 126.9244 };
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.moveToLocation(sangsuStation.lat, sangsuStation.lng, 16);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchPlacesFromBackend(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTypeDropdown && !event.target.closest('.type-filter-dropdown')) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeDropdown]);

  const handleSearchResultClick = (place) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (mapRef.current) {
      mapRef.current.moveToLocation(place.lat, place.lng, 16);
    }
    setNewPlace({
      name: place.name,
      category: 'restaurant',
      address: place.address,
      detailedAddress: '',
      description: '',
      photos: [],
      coordinates: { lat: place.lat, lng: place.lng }
    });
    setShowAddPlace(true);
  };

  // --- 🔥 수정된 부분: '장소 추가' 시 백엔드에 저장 요청 ---
  const addPlace = async () => { // async 함수로 변경
    if (newPlace.name.trim() && newPlace.coordinates) {
      const fullAddress = newPlace.detailedAddress.trim() ? `${newPlace.address} - ${newPlace.detailedAddress}` : newPlace.address;

      const placeData = {
        name: newPlace.name,
        category: newPlace.category,
        address: fullAddress,
        description: newPlace.description,
        // photos: newPlace.photos, // 사진 저장은 별도 API 필요
        lat: newPlace.coordinates.lat,
        lng: newPlace.coordinates.lng,
      };

      const savedPlace = await savePlaceToBackend(placeData);

      if (savedPlace) {
        setPlaces([...places, savedPlace]);
        setSelectedType('all');

        if (mapRef.current) {
          mapRef.current.moveToLocation(savedPlace.lat, savedPlace.lng, 16);
        }

        setNewPlace({
          name: '', category: 'restaurant', address: '', detailedAddress: '',
          description: '', photos: [], coordinates: null
        });
        setShowAddPlace(false);
        setMapClickMode(false);
      }
    }
  };

  const startMapAddPlace = () => {
    setMapClickMode(true);
  };

  const handleMapClick = useCallback((lat, lng) => {
    setNewPlace({
      name: '',
      category: 'restaurant',
      address: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
      detailedAddress: '',
      description: '',
      photos: [],
      coordinates: { lat, lng }
    });
    setShowAddPlace(true);
    setMapClickMode(false);
  }, []);

  const mapPlaces = places.filter(place => selectedType === 'all' || place.category === selectedType);

  // 사용자 카테고리 관리 함수들
  const handleAddUserCategory = (name) => {
    const newCategory = {
      id: Date.now(),
      name: name
    };
    setUserCategories([...userCategories, newCategory]);
  };

  const handleDeleteUserCategory = (categoryId) => {
    setUserCategories(userCategories.filter(cat => cat.id !== categoryId));
  };

  const handleUpdateUserCategory = (categoryId, newName) => {
    setUserCategories(userCategories.map(cat => 
      cat.id === categoryId ? { ...cat, name: newName } : cat
    ));
  };

  const handleAddPlaceToCategory = (placeId, categoryId) => {
    // 장소를 사용자 카테고리에 추가하는 로직
    console.log('Add place', placeId, 'to category', categoryId);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };

  return (
      <MapPageContainer>
        <Sidebar>
          <SidebarHeader>
            <h2>홍익지도</h2>
            <HeaderButtons>
              <AddButton onClick={startMapAddPlace}>
                <FaMapMarkerAlt /> 지도에서 장소 추가
              </AddButton>
            </HeaderButtons>
          </SidebarHeader>
          
          <UserCategory
            categories={userCategories}
            onAddCategory={handleAddUserCategory}
            onDeleteCategory={handleDeleteUserCategory}
            onUpdateCategory={handleUpdateUserCategory}
          />
        </Sidebar>

        <StyledMapContainer>
          <MapSearchContainer>
            <MapSearchInput
                placeholder="장소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MapSearchIcon><FaSearch /></MapSearchIcon>
          </MapSearchContainer>

          <TypeFilterDropdown className="type-filter-dropdown">
            <TypeFilterButton onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
              <span>{selectedType === 'all' ? '전체' : categories.find(cat => cat.id === selectedType)?.name || '전체'}</span>
              <FaChevronDown />
            </TypeFilterButton>
            {showTypeDropdown && (
              <TypeDropdownMenu>
                <TypeDropdownItem 
                  $isSelected={selectedType === 'all'}
                  onClick={() => {
                    setSelectedType('all');
                    setShowTypeDropdown(false);
                  }}
                >
                  전체
                </TypeDropdownItem>
                {categories.map(category => (
                  <TypeDropdownItem 
                    key={category.id}
                    $isSelected={selectedType === category.id}
                    onClick={() => {
                      setSelectedType(category.id);
                      setShowTypeDropdown(false);
                    }}
                  >
                    {category.name}
                  </TypeDropdownItem>
                ))}
              </TypeDropdownMenu>
            )}
          </TypeFilterDropdown>

          <SearchResultsContainer $show={showSearchResults}>
            <SearchResultsHeader>
              <SearchResultsTitle>
                {isSearching ? '검색 중...' : `검색 결과 (${searchResults.length})`}
              </SearchResultsTitle>
              <CloseSearchButton onClick={() => setShowSearchResults(false)}><IoMdClose /></CloseSearchButton>
            </SearchResultsHeader>
            <SearchResultsList>
              {isSearching ? (
                <SearchLoadingItem>
                  <SearchLoadingText>검색 중...</SearchLoadingText>
                </SearchLoadingItem>
              ) : searchResults.length > 0 ? (
                searchResults.map(place => (
                  <SearchResultItem key={place.id} onClick={() => handleSearchResultClick(place)}>
                    <SearchResultHeader>
                      <SearchResultName>{place.name}</SearchResultName>
                      <SearchResultCategory>{place.category.split('>').pop() || '정보 없음'}</SearchResultCategory>
                    </SearchResultHeader>
                    <SearchResultAddress><FaMapMarkerAlt /> {place.address}</SearchResultAddress>
                  </SearchResultItem>
                ))
              ) : searchQuery.trim() ? (
                <SearchEmptyItem>
                  <SearchEmptyText>검색 결과가 없습니다.</SearchEmptyText>
                  <SearchEmptySubText>다른 키워드로 검색해보세요.</SearchEmptySubText>
                </SearchEmptyItem>
              ) : null}
            </SearchResultsList>
          </SearchResultsContainer>

          <NaverMap
            ref={mapRef}
            places={mapPlaces}
            categories={categories}
            onMapClick={handleMapClick}
            mapClickMode={mapClickMode}
            userLocation={userLocation}
            onPlaceClick={handlePlaceClick}
          />
        </StyledMapContainer>

        {showAddPlace && (
            <Modal>
              <ModalContent>
                <ModalHeader>
                  <h3>새 장소 추가</h3>
                  <CloseButton onClick={() => setShowAddPlace(false)}><IoMdClose /></CloseButton>
                </ModalHeader>
                <ModalBody>
                  <Input placeholder="장소 이름" value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} />
                  <Select value={newPlace.category} onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}>
                    {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
                  </Select>
                  <Input placeholder="주소" value={newPlace.address} readOnly style={{ backgroundColor: '#f8f9fa' }} />
                  <Input placeholder="세부 주소" value={newPlace.detailedAddress} onChange={(e) => setNewPlace({ ...newPlace, detailedAddress: e.target.value })} />
                  <TextArea placeholder="설명" value={newPlace.description} onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })} />
                  <Button onClick={addPlace}>장소 추가</Button>
                </ModalBody>
              </ModalContent>
            </Modal>
        )}

        {showPlaceDetail && selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            isOpen={showPlaceDetail}
            onClose={() => setShowPlaceDetail(false)}
            userCategories={userCategories}
            onAddToCategory={handleAddPlaceToCategory}
            userLocation={userLocation}
          />
        )}
      </MapPageContainer>
  );
};

export default MapPage;

const MapPageContainer = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
`;

const Sidebar = styled.div`
  width: 350px;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #eee;
  background-color: white;
  box-sizing: border-box;
`;

const StyledMapContainer = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
`;

const MapSearchContainer = styled.div`
  position: absolute;
  top: 80px;
  left: 20px;
  width: 320px;
  max-width: calc(40vw - 40px);
  min-width: 280px;
  z-index: 100;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 1200px) {
    max-width: calc(35vw - 40px);
  }
  
  @media (max-width: 900px) {
    max-width: calc(30vw - 40px);
  }
  
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    max-width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
`;

const SidebarHeader = styled.div`
  margin-bottom: 20px;
  
  h2 {
    margin: 0 0 15px 0;
    font-size: 24px;
    font-weight: 700;
    color: #333;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;
const MapSearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
`;
const MapSearchIcon = styled.div`
  padding: 0 16px;
  color: #666;
  font-size: 16px;
`;

const TypeFilterDropdown = styled.div`
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    top: 160px;
    right: 20px;
  }
`;

const TypeFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  color: #333;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  
  &:hover {
    background: #f8f9fa;
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: rotate(180deg);
  }
`;

const TypeDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 1001;
  margin-top: 4px;
`;

const TypeDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  background: ${props => props.$isSelected ? '#007bff' : 'transparent'};
  color: ${props => props.$isSelected ? 'white' : '#333'};
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:hover {
    background: ${props => props.$isSelected ? '#007bff' : '#f8f9fa'};
  }
`;

const SearchResultsContainer = styled.div`
  position: absolute;
  top: 140px;
  left: 20px;
  width: 320px;
  max-width: calc(40vw - 40px);
  min-width: 280px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  z-index: 100;
  display: ${props => props.$show ? 'block' : 'none'};
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  
  @media (max-width: 1200px) {
    max-width: calc(35vw - 40px);
  }
  
  @media (max-width: 900px) {
    max-width: calc(30vw - 40px);
  }
  
  @media (max-width: 768px) {
    top: 220px;
    width: calc(100vw - 40px);
    max-width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
`;

const SearchResultsHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
`;

const SearchResultsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const CloseSearchButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const SearchResultsList = styled.div``;

const SearchResultItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const SearchResultName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const SearchResultCategory = styled.span`
  font-size: 12px;
  color: #666;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
`;

const SearchResultAddress = styled.p`
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SearchLoadingItem = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const SearchLoadingText = styled.div`
  font-size: 14px;
  color: #666;
`;

const SearchEmptyItem = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: #666;
`;

const SearchEmptyText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const SearchEmptySubText = styled.div`
  font-size: 14px;
  color: #999;
`;
const Modal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;
