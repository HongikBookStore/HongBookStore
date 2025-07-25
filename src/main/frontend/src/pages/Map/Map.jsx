import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaStar, FaRoute, FaClock, FaSearch, FaCamera, FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaEdit, FaShare, FaUser, FaHeart, FaCrosshairs, FaMinus } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';

import NaverMap from '../../components/NaverMap/Navermap';
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
  const [places, setPlaces] = useState([]);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '', category: 'restaurant', address: '', detailedAddress: '',
    description: '', photos: [], coordinates: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapClickMode, setMapClickMode] = useState(false);

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
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPlacesFromBackend(searchQuery).then(results => {
          setSearchResults(results);
          setShowSearchResults(true);
        });
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

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
        setSelectedCategory('all');

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

  const mapPlaces = places.filter(place => selectedCategory === 'all' || place.category === selectedCategory);

  return (
      <MapPageContainer>
        <Sidebar>
          <SidebarHeader>
            <h2>지도</h2>
            <HeaderButtons>
              <AddButton onClick={startMapAddPlace}>
                <FaMapMarkerAlt /> 지도에서 장소 추가
              </AddButton>
            </HeaderButtons>
          </SidebarHeader>
          {/* ... 나머지 사이드바 UI ... */}
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

          <SearchResultsContainer show={showSearchResults && searchResults.length > 0}>
            <SearchResultsHeader>
              <SearchResultsTitle>검색 결과 ({searchResults.length})</SearchResultsTitle>
              <CloseSearchButton onClick={() => setShowSearchResults(false)}><IoMdClose /></CloseSearchButton>
            </SearchResultsHeader>
            <SearchResultsList>
              {searchResults.map(place => (
                  <SearchResultItem key={place.id} onClick={() => handleSearchResultClick(place)}>
                    <SearchResultHeader>
                      <SearchResultName>{place.name}</SearchResultName>
                      <SearchResultCategory>{place.category.split('>').pop() || '정보 없음'}</SearchResultCategory>
                    </SearchResultHeader>
                    <SearchResultAddress><FaMapMarkerAlt /> {place.address}</SearchResultAddress>
                  </SearchResultItem>
              ))}
            </SearchResultsList>
          </SearchResultsContainer>

          <NaverMap
              ref={mapRef}
              places={mapPlaces}
              categories={categories}
              onMapClick={handleMapClick}
              mapClickMode={mapClickMode}
              userLocation={userLocation}
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
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  z-index: 100;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const SidebarHeader = styled.div``;
const HeaderButtons = styled.div``;
const AddButton = styled.button``;
const MapSearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
`;
const MapSearchIcon = styled.div``;
const SearchResultsContainer = styled.div`
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  z-index: 100;
  display: ${props => props.show ? 'block' : 'none'};
  max-height: 400px;
  overflow-y: auto;
`;
const SearchResultsHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
`;
const SearchResultsTitle = styled.h3`
  margin: 0;
`;
const CloseSearchButton = styled.button``;
const SearchResultsList = styled.div``;
const SearchResultItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;
const SearchResultHeader = styled.div``;
const SearchResultName = styled.h4`margin:0;`;
const SearchResultCategory = styled.span``;
const SearchResultAddress = styled.p`margin: 5px 0 0;`;
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
  padding: 20px;
  border-radius: 8px;
  width: 400px;
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;
const CloseButton = styled.button``;
const ModalBody = styled.div``;
const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;
const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 80px;
`;
const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
