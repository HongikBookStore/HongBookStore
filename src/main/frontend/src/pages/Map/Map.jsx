import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaStar, FaRoute, FaClock, FaSearch, FaCamera, FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaEdit, FaShare, FaUser, FaHeart, FaCrosshairs, FaMinus, FaChevronDown } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import NaverMap from '../../components/NaverMap/Navermap';
import { useLocation } from '../../contexts/LocationContext';

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
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  
  // 기본 카테고리 (시스템 제공)
  const [systemCategories] = useState([
    { id: 'restaurant', name: '음식점', color: '#FF6B6B', type: 'system' },
    { id: 'cafe', name: '카페', color: '#4ECDC4', type: 'system' },
    { id: 'bookstore', name: '서점', color: '#45B7D1', type: 'system' },
    { id: 'library', name: '도서관', color: '#96CEB4', type: 'system' },
    { id: 'park', name: '공원', color: '#FFEAA7', type: 'system' },
    { id: 'print', name: '인쇄', color: '#A8E6CF', type: 'system' },
    { id: 'partner', name: '제휴업체', color: '#FFB3BA', type: 'system' }
  ]);
  
  // 사용자 정의 카테고리
  const [userCategories, setUserCategories] = useState([
    { id: 'favorite', name: '즐겨찾기', color: '#FFD93D', type: 'user' },
    { id: 'study', name: '공부하기 좋은 곳', color: '#6C5CE7', type: 'user' }
  ]);
  
  // 모든 카테고리 합치기
  const categories = [...systemCategories, ...userCategories];
  
  // 카테고리별 저장된 장소들
  const [categoryPlaces, setCategoryPlaces] = useState({
    favorite: [1, 3], // 홍대 서점, 홍대 도서관
    study: [2, 3]     // 홍대 카페, 홍대 도서관
  });
  
  const [places, setPlaces] = useState([
    {
      id: 1,
      name: '홍대 서점',
      lat: 37.5575,
      lng: 126.9250,
      category: 'bookstore',
      rating: 4.5,
      address: '서울 마포구 홍대로 123',
      photos: ['https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=서점'],
      createdBy: 1,
      reviews: [
        { 
          id: 1, 
          rating: 5, 
          comment: '책이 정말 많아요! 특히 프로그래밍 서적이 잘 정리되어 있어서 좋습니다.', 
          author: '김철수', 
          authorId: 2,
          date: '2024-01-15',
          likes: 8,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        },
        { 
          id: 2, 
          rating: 4, 
          comment: '좋은 분위기입니다. 조용해서 공부하기 좋아요.', 
          author: '이영희', 
          authorId: 3,
          date: '2024-01-10',
          likes: 5,
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
      photos: ['https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=카페'],
      createdBy: 1,
      reviews: [
        { 
          id: 3, 
          rating: 4, 
          comment: '커피가 맛있어요! 아메리카노가 특히 좋습니다.', 
          author: '박민수', 
          authorId: 4,
          date: '2024-01-12',
          likes: 6,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 3,
      name: '홍대 도서관',
      lat: 37.5565,
      lng: 126.9240,
      category: 'library',
      rating: 4.8,
      address: '서울 마포구 홍대로 789',
      photos: ['https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=도서관'],
      createdBy: 1,
      reviews: [
        { 
          id: 4, 
          rating: 5, 
          comment: '시설이 깔끔하고 책이 정말 많아요! 공부하기 최고입니다.', 
          author: '최지영', 
          authorId: 5,
          date: '2024-01-08',
          likes: 12,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        },
        { 
          id: 5, 
          rating: 4, 
          comment: '좋은 분위기이고 직원들이 친절해요.', 
          author: '정민호', 
          authorId: 6,
          date: '2024-01-05',
          likes: 7,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 4,
      name: '홍대 인쇄소',
      lat: 37.5590,
      lng: 126.9270,
      category: 'print',
      rating: 4.0,
      address: '서울 마포구 홍대로 101',
      photos: ['https://via.placeholder.com/300x200/A8E6CF/FFFFFF?text=인쇄소'],
      createdBy: 1,
      reviews: [
        { 
          id: 6, 
          rating: 4, 
          comment: '가격이 합리적이고 품질이 좋아요. 과제 인쇄하기 좋습니다.', 
          author: '김서연', 
          authorId: 7,
          date: '2024-01-14',
          likes: 4,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 5,
      name: '홍대 공원',
      lat: 37.5555,
      lng: 126.9230,
      category: 'park',
      rating: 4.3,
      address: '서울 마포구 홍대로 202',
      photos: ['https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=공원'],
      createdBy: 1,
      reviews: [
        { 
          id: 7, 
          rating: 4, 
          comment: '산책하기 좋고 분위기가 평화로워요. 휴식하기 좋습니다.', 
          author: '이준호', 
          authorId: 8,
          date: '2024-01-11',
          likes: 9,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 6,
      name: '홍대 맛집',
      lat: 37.5570,
      lng: 126.9280,
      category: 'restaurant',
      rating: 4.6,
      address: '서울 마포구 홍대로 303',
      photos: ['https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=맛집'],
      createdBy: 1,
      reviews: [
        { 
          id: 8, 
          rating: 5, 
          comment: '음식이 정말 맛있어요! 특히 파스타가 최고입니다.', 
          author: '김미영', 
          authorId: 9,
          date: '2024-01-13',
          likes: 15,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        },
        { 
          id: 9, 
          rating: 4, 
          comment: '분위기도 좋고 서비스도 친절해요.', 
          author: '박지훈', 
          authorId: 10,
          date: '2024-01-09',
          likes: 8,
          dislikes: 0,
          userLiked: false,
          userDisliked: false
        }
      ]
    },
    {
      id: 7,
      name: '홍대 제휴 서점',
      lat: 37.5585,
      lng: 126.9245,
      category: 'partner',
      rating: 4.4,
      address: '서울 마포구 홍대로 404',
      photos: ['https://via.placeholder.com/300x200/FFB3BA/FFFFFF?text=제휴서점'],
      createdBy: 1,
      reviews: [
        { 
          id: 10, 
          rating: 4, 
          comment: '학생 할인이 있어서 좋아요! 책도 다양하게 구비되어 있습니다.', 
          author: '최수진', 
          authorId: 11,
          date: '2024-01-16',
          likes: 11,
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

  const [showExistingPlaceModal, setShowExistingPlaceModal] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#FF6B6B' });
  const [newPlace, setNewPlace] = useState({ 
    name: '', 
    category: 'restaurant', 
    address: '', 
    detailedAddress: '', // 세부 주소 추가
    description: '',
    photos: [],
    coordinates: null // 좌표 정보 추가
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [routeInfo, setRouteInfo] = useState(null);
  const [routePath, setRoutePath] = useState(null); // State for route path coordinates
  const [currentRouteDestination, setCurrentRouteDestination] = useState(null); // 현재 경로 목적지
  const [currentZoom, setCurrentZoom] = useState(16); // Current zoom level
  const [isDragging, setIsDragging] = useState(false); // Slider drag state
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);


  // 카테고리별 아이콘 반환 함수
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'restaurant':
        return '🍽️';
      case 'cafe':
        return '☕';
      case 'bookstore':
        return '📚';
      case 'library':
        return '📖';
      case 'park':
        return '🌳';
      case 'print':
        return '🖨️';
      case 'partner':
        return '🤝';
      default:
        return '📍';
    }
  };

  // 선택된 카테고리에 따라 표시할 장소들 필터링
  const getFilteredPlaces = () => {
    if (selectedCategory === 'all') {
      return places;
    }
    
    // 시스템 장소 유형인 경우 해당 유형의 장소들
    if (systemCategories.find(cat => cat.id === selectedCategory)) {
      return places.filter(place => place.category === selectedCategory);
    }
    
    // 사용자 카테고리인 경우 해당 카테고리에 저장된 장소들 (모든 유형 가능)
    const categoryPlaceIds = categoryPlaces[selectedCategory] || [];
    return places.filter(place => categoryPlaceIds.includes(place.id));
  };

  // 필터링된 장소들 (카테고리 + 검색)
  const filteredPlaces = getFilteredPlaces().filter(place => {
    const searchMatch = searchQuery === '' || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  // 선택된 카테고리의 장소들만 지도에 표시
  const mapPlaces = filteredPlaces;

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

  // routePath 상태 변화 추적
  useEffect(() => {
    console.log('routePath 상태 변화 감지:', routePath);
  }, [routePath]);

  // tempMarker 상태 변화 추적
  useEffect(() => {
    console.log('tempMarker 상태 변화 감지:', tempMarker);
  }, [tempMarker]);

  // 두 지점 간의 거리와 시간 계산
  const calculateDistanceAndTime = (lat1, lng1, lat2, lng2) => {
    // Haversine 공식을 사용한 정확한 거리 계산
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // 미터 단위

    // 예상 시간 계산 (도보 기준: 분당 80m)
    const timeMinutes = Math.round(distance / 80);
    
    return { distance, timeMinutes };
  };

  // 경로 초기화
  const clearRoute = () => {
    console.log('경로 초기화');
    setRoutePath(null);
    setRouteInfo(null);
    setCurrentRouteDestination(null);
  };

  // 경로 정보 가져오기 (실제로는 네이버 지도 API 사용)
  const getRouteInfo = (destination) => {
    console.log('=== getRouteInfo 함수 시작 ===');
    console.log('getRouteInfo 호출됨:', destination);
    console.log('destination 타입:', typeof destination);
    console.log('destination 내용:', JSON.stringify(destination, null, 2));
    
    if (!destination) {
      console.error('목적지 정보가 없습니다.');
      setRouteInfo({ error: '목적지 정보가 없습니다.' });
      return;
    }
    
    const currentLoc = userLocation || getDefaultLocation();
    console.log('현재 위치:', currentLoc);
    console.log('currentLoc 타입:', typeof currentLoc);
    
    if (!currentLoc) {
      console.error('현재 위치를 찾을 수 없습니다.');
      setRouteInfo({ error: '현재 위치를 찾을 수 없습니다.' });
      return;
    }

    console.log('거리 계산 시작:', currentLoc, destination);
    try {
      const { distance, timeMinutes } = calculateDistanceAndTime(
        currentLoc.lat, currentLoc.lng, destination.lat, destination.lng
      );
      console.log('거리 계산 결과:', { distance, timeMinutes });

      const routeData = {
        distance: `${Math.round(distance)}m`,
        time: `${timeMinutes}분`,
        method: '도보',
        description: `${currentLoc.name}에서 ${destination.name}까지`
      };

      console.log('경로 데이터 생성:', routeData);
      setRouteInfo(routeData);

      // 경로를 지도에 표시하기 위한 데이터 설정
      const pathData = {
        start: { lat: currentLoc.lat, lng: currentLoc.lng },
        end: { lat: destination.lat, lng: destination.lng },
        path: [
          { lat: currentLoc.lat, lng: currentLoc.lng },
          { lat: destination.lat, lng: destination.lng }
        ]
      };
      
      console.log('경로 데이터 설정:', pathData);
      console.log('setRoutePath 호출 전');
      setRoutePath(pathData);
      setCurrentRouteDestination(destination); // 현재 경로 목적지 저장
      console.log('setRoutePath 호출 후');
      
      // 상태 업데이트 확인을 위한 추가 로그
      setTimeout(() => {
        console.log('setRoutePath 후 routePath 상태 확인:', routePath);
      }, 100);
      
      // 강제로 NaverMap에 경로 전달
      setTimeout(() => {
        console.log('강제 경로 업데이트:', pathData);
        setRoutePath({...pathData}); // 새로운 객체로 강제 업데이트
      }, 200);
      
      console.log('=== getRouteInfo 함수 완료 ===');
    } catch (error) {
      console.error('거리 계산 중 오류 발생:', error);
      setRouteInfo({ error: '거리 계산 중 오류가 발생했습니다.' });
    }
  };

  // 장소 상세 정보 열 때 자동으로 경로 정보 계산
  useEffect(() => {
    console.log('showPlaceDetail 변경됨:', showPlaceDetail);
    if (showPlaceDetail) {
      console.log('경로 정보 계산 시작');
      getRouteInfo(showPlaceDetail);
    } else {
      console.log('경로 정보 초기화');
      // 경로는 유지 (사라지지 않도록)
      // setRoutePath(null);
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
    console.log('내 위치 버튼 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    
    const currentLoc = userLocation || getDefaultLocation();
    console.log('현재 위치:', currentLoc);
    
    if (!currentLoc) {
      alert('현재 위치를 찾을 수 없습니다. 마이페이지에서 위치를 설정해주세요.');
      return;
    }

    // ref를 통해 NaverMap 컴포넌트의 moveToLocation 메서드 호출
    if (mapRef.current) {
      console.log('지도 이동 실행:', currentLoc.lat, currentLoc.lng);
      mapRef.current.moveToLocation(currentLoc.lat, currentLoc.lng, 16);
    } else {
      console.log('mapRef.current가 없음');
    }
  };

  // 지도 확대
  const zoomIn = (e) => {
    console.log('확대 버튼 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    
    if (mapRef.current) {
      console.log('확대 실행');
      const currentZoomLevel = mapRef.current.getMap().getZoom();
      const newZoom = Math.min(20, currentZoomLevel + 1);
      
      // 바로 확대 (애니메이션 없이)
      mapRef.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    } else {
      console.log('mapRef.current가 없음');
    }
  };

  // 지도 축소
  const zoomOut = (e) => {
    console.log('축소 버튼 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    
    if (mapRef.current) {
      console.log('축소 실행');
      const currentZoomLevel = mapRef.current.getMap().getZoom();
      const newZoom = Math.max(1, currentZoomLevel - 1);
      
      // 바로 축소 (애니메이션 없이)
      mapRef.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    } else {
      console.log('mapRef.current가 없음');
    }
  };

  // 슬라이더 드래그 시작
  const handleSliderMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('슬라이더 드래그 시작');
    setIsDragging(true);
    document.addEventListener('mousemove', handleSliderMouseMove);
    document.addEventListener('mouseup', handleSliderMouseUp);
    document.addEventListener('mouseleave', handleSliderMouseUp);
  };

  // 슬라이더 드래그 중
  const handleSliderMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    // document에서 마우스 위치를 가져와서 슬라이더 위치 계산
    const sliderElement = document.querySelector('.zoom-track');
    if (!sliderElement) {
      console.log('슬라이더 요소를 찾을 수 없음');
      return;
    }
    
    const rect = sliderElement.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const height = rect.height;
    
    // 줌 레벨 계산 (1-20 범위)
    const zoomLevel = Math.max(1, Math.min(20, 21 - Math.round((y / height) * 20)));
    console.log('드래그 중 줌 레벨:', zoomLevel);
    
    if (mapRef.current && zoomLevel !== currentZoom) {
      console.log('드래그로 줌 레벨 설정:', zoomLevel);
      mapRef.current.setZoom(zoomLevel);
      setCurrentZoom(zoomLevel);
    }
  };

  // 슬라이더 드래그 종료
  const handleSliderMouseUp = () => {
    console.log('슬라이더 드래그 종료');
    setIsDragging(false);
    document.removeEventListener('mousemove', handleSliderMouseMove);
    document.removeEventListener('mouseup', handleSliderMouseUp);
    document.removeEventListener('mouseleave', handleSliderMouseUp);
  };

  // 슬라이더 클릭
  const handleSliderClick = (e) => {
    console.log('=== 슬라이더 클릭 이벤트 시작 ===');
    console.log('클릭 이벤트:', e);
    console.log('현재 줌 레벨:', currentZoom);
    
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    console.log('트랙 정보:', { rect, y, height });
    
    const zoomLevel = Math.max(1, Math.min(20, 21 - Math.round((y / height) * 20)));
    console.log('계산된 줌 레벨:', zoomLevel);
    
    if (mapRef.current) {
      console.log('줌 레벨 설정:', zoomLevel);
      
      // 바로 줌 설정 (애니메이션 없이)
      mapRef.current.setZoom(zoomLevel);
      setCurrentZoom(zoomLevel);
      
      console.log('줌 레벨 설정 완료');
    } else {
      console.log('mapRef.current가 없음');
    }
    
    console.log('=== 슬라이더 클릭 이벤트 완료 ===');
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowAddPlace(false);
        setShowPlaceDetail(null);
        setShowCategoryModal(false);

        setShowExistingPlaceModal(false);
        setShowMyReviews(false);
        setShowSearchResults(false);
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

  // 사용자 카테고리 추가
  const addCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: `user_${Date.now()}`,
        name: newCategory.name,
        color: newCategory.color,
        type: 'user'
      };
      setUserCategories([...userCategories, category]);
      setCategoryPlaces({ ...categoryPlaces, [category.id]: [] });
      setNewCategory({ name: '', color: '#FF6B6B' });
      setShowCategoryModal(false);
    }
  };

  // 사용자 카테고리 삭제 (시스템 카테고리는 삭제 불가)
  const deleteCategory = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.type === 'user') {
      setUserCategories(userCategories.filter(cat => cat.id !== categoryId));
      const newCategoryPlaces = { ...categoryPlaces };
      delete newCategoryPlaces[categoryId];
      setCategoryPlaces(newCategoryPlaces);
      if (selectedCategory === categoryId) {
        setSelectedCategory('all');
      }
    }
  };

  // 장소를 카테고리에 추가/제거
  const togglePlaceInCategory = (placeId, categoryId) => {
    const currentPlaces = categoryPlaces[categoryId] || [];
    const isInCategory = currentPlaces.includes(placeId);
    
    if (isInCategory) {
      // 카테고리에서 제거
      setCategoryPlaces({
        ...categoryPlaces,
        [categoryId]: currentPlaces.filter(id => id !== placeId)
      });
    } else {
      // 카테고리에 추가
      setCategoryPlaces({
        ...categoryPlaces,
        [categoryId]: [...currentPlaces, placeId]
      });
    }
  };

  // 카테고리에 속한 장소인지 확인
  const isPlaceInCategory = (placeId, categoryId) => {
    return (categoryPlaces[categoryId] || []).includes(placeId);
  };

  // 카테고리에 장소 추가 (기존 함수 유지)
  const addPlaceToCategory = (categoryId) => {
    setSelectedCategoryForAdd(categoryId);
    setShowExistingPlaceModal(true);
  };



  // 장소 추가
  const addPlace = () => {
    if (newPlace.name.trim()) {
      // 기본 위치 설정 (사용자가 입력하지 않은 경우)
      const defaultLocation = getDefaultLocation();
      const coordinates = newPlace.coordinates || { lat: defaultLocation.lat, lng: defaultLocation.lng };
      
      // 전체 주소 구성
      const fullAddress = newPlace.detailedAddress.trim() 
        ? `${newPlace.address || defaultLocation.address} - ${newPlace.detailedAddress}`
        : (newPlace.address || defaultLocation.address);

      const place = {
        id: Date.now(),
        name: newPlace.name,
        lat: coordinates.lat,
        lng: coordinates.lng,
        category: newPlace.category,
        address: fullAddress,
        description: newPlace.description,
        rating: 0,
        photos: newPlace.photos,
        createdBy: currentUser.id,
        reviews: []
      };
      
      console.log('새 장소 추가:', place);
      setPlaces([...places, place]);
      
      // 폼 초기화
      setNewPlace({ 
        name: '', 
        category: 'restaurant', 
        address: '', 
        detailedAddress: '',
        description: '',
        photos: [],
        coordinates: null
      });
      setShowAddPlace(false);
      setSelectedLocation(null);
      
      // 성공 메시지 (선택사항)
      alert('장소가 성공적으로 추가되었습니다!');
    } else {
      alert('장소 이름을 입력해주세요.');
    }
  };



  // 장소 추가 모드 시작 (바로 모달 열기)
  const startAddPlaceMode = () => {
    console.log('장소 추가 모달 열기');
    
    // 기본 위치 설정
    const defaultLocation = getDefaultLocation();
    
    // 새로운 장소 정보 초기화
    setNewPlace({
      name: '',
      category: 'restaurant',
      address: defaultLocation.address,
      detailedAddress: '',
      description: '',
      photos: [],
      coordinates: { lat: defaultLocation.lat, lng: defaultLocation.lng }
    });
    
    // 모달 열기
    setShowAddPlace(true);
  };

  // 장소 추가 모드 종료
  const cancelAddPlaceMode = () => {
    console.log('취소 버튼 클릭됨');
    console.log('장소 추가 모드 종료');
    setIsAddingPlace(false);
    setTempMarker(null);
  };

  // 임시 마커 위치 업데이트
  const updateTempMarkerPosition = (lat, lng, address = null) => {
    if (isAddingPlace) {
      console.log('임시 마커 위치 업데이트:', lat, lng);
      setTempMarker({ lat, lng, address });
    }
  };

  // 임시 마커로 장소 추가 확인
  const confirmAddPlace = () => {
    console.log('확인 버튼 클릭됨, tempMarker:', tempMarker);
    if (tempMarker) {
      console.log('장소 추가 확인:', tempMarker);
      setSelectedLocation({ lat: tempMarker.lat, lng: tempMarker.lng });
      
      // 주소가 있으면 사용하고, 없으면 좌표 표시
      const displayAddress = tempMarker.address || `위도: ${tempMarker.lat.toFixed(6)}, 경도: ${tempMarker.lng.toFixed(6)}`;
      
      // 새로운 장소 정보 초기화 (좌표 포함)
      setNewPlace({
        name: '',
        category: 'restaurant',
        address: displayAddress,
        detailedAddress: '',
        description: '',
        photos: [],
        coordinates: { lat: tempMarker.lat, lng: tempMarker.lng }
      });
      
      setShowAddPlace(true);
      setIsAddingPlace(false);
      setTempMarker(null);
    } else {
      console.log('tempMarker가 없어서 장소 추가 모달을 열 수 없음');
    }
  };

  // 지도 클릭 이벤트 처리
  const handleMapClick = (lat, lng, address = null) => {
    console.log('지도 클릭:', lat, lng, 'isAddingPlace:', isAddingPlace);
    if (isAddingPlace) {
      updateTempMarkerPosition(lat, lng, address);
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

  // 검색 결과 클릭 핸들러
  const handleSearchResultClick = (place) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setShowPlaceDetail(place);
    
    // 지도에서 해당 장소로 이동
    if (mapRef.current && mapRef.current.moveToLocation) {
      mapRef.current.moveToLocation(place.lat, place.lng);
    }
  };

  // 검색 결과 닫기
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // 유형 드롭다운 토글
  const toggleTypeDropdown = () => {
    setIsTypeDropdownOpen(!isTypeDropdownOpen);
  };

  // 유형 드롭다운 닫기
  const closeTypeDropdown = () => {
    setIsTypeDropdownOpen(false);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTypeDropdownOpen && !event.target.closest('.map-type-dropdown')) {
        closeTypeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeDropdownOpen]);



  // 검색어 변경 시 검색 결과 표시
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // 카테고리 변경 시 지도 이동
  useEffect(() => {
    if (selectedCategory !== 'all' && mapPlaces.length > 0 && mapRef.current) {
      // 선택된 카테고리의 모든 장소들의 중심점 계산
      const totalLat = mapPlaces.reduce((sum, place) => sum + place.lat, 0);
      const totalLng = mapPlaces.reduce((sum, place) => sum + place.lng, 0);
      const centerLat = totalLat / mapPlaces.length;
      const centerLng = totalLng / mapPlaces.length;
      
      // 지도를 해당 위치로 이동 (애니메이션과 함께)
      setTimeout(() => {
        mapRef.current.moveToLocation(centerLat, centerLng, 15);
      }, 100);
    }
  }, [selectedCategory, mapPlaces]);

  return (
    <MapPageContainer>
      <Sidebar>
        <SidebarHeader>
          <h2>지도</h2>
          <HeaderButtons>
            <AddButton onClick={startAddPlaceMode}>
              <FaMapMarkerAlt /> 장소 추가
            </AddButton>
            <AddButton onClick={() => setShowMyReviews(true)}>
              <FaUser /> 내 리뷰
            </AddButton>
          </HeaderButtons>
        </SidebarHeader>
        {/* 사용자 카테고리 */}
        <CategorySection>
          <CategoryHeader>
            <h3>내 카테고리</h3>
            <AddButton onClick={() => setShowCategoryModal(true)}>
              <FaPlus />
            </AddButton>
          </CategoryHeader>
          <CategoryList>
            <CategoryItem 
              $active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              <span>전체 ({places.length})</span>
            </CategoryItem>
            {userCategories.map(category => {
              const categoryPlaceCount = (categoryPlaces[category.id] || []).length;
              return (
                <CategoryItem 
                  key={category.id}
                  $active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  color={category.color}
                >
                  <span>{category.name} ({categoryPlaceCount})</span>
                  <CategoryActions>
                    <AddButton 
                      $small
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
              );
            })}
          </CategoryList>
        </CategorySection>
        <PlacesSection>
          <h3>장소</h3>
          <PlacesList>
            {filteredPlaces.map(place => (
              <PlaceItem key={place.id}>
                <PlaceInfo onClick={() => setShowPlaceDetail(place)}>
                  <PlaceName>{place.name}</PlaceName>
                  <PlaceCategory>{systemCategories.find(c => c.id === place.category)?.name}</PlaceCategory>
                  <PlaceAddress>{place.address}</PlaceAddress>
                  <PlaceRating>
                    <FaStar style={{ color: '#FFD700' }} />
                    {calculateAverageRating(place.reviews)}
                  </PlaceRating>
                </PlaceInfo>
                <RouteButton 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('=== 경로 찾기 버튼 클릭 시작 ===');
                    console.log('클릭된 장소:', place);
                    console.log('이벤트 객체:', e);
                    console.log('현재 routePath 상태:', routePath);
                    console.log('현재 경로 목적지:', currentRouteDestination);
                    
                    // 이미 같은 목적지의 경로가 있다면 제거, 없다면 새로 생성
                    if (currentRouteDestination && currentRouteDestination.id === place.id) {
                      console.log('같은 목적지 경로 제거');
                      clearRoute();
                    } else {
                      console.log('새 경로 생성');
                      setTimeout(() => {
                        console.log('setTimeout으로 getRouteInfo 호출');
                        getRouteInfo(place);
                      }, 0);
                    }
                    
                    console.log('=== 경로 찾기 버튼 클릭 완료 ===');
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('경로 버튼 마우스 다운:', place);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('경로 버튼 터치 시작:', place);
                  }}
                >
                  <FaRoute />
                  <span style={{ fontSize: '10px', marginLeft: '4px' }}>경로</span>
                </RouteButton>
              </PlaceItem>
            ))}
          </PlacesList>
        </PlacesSection>
      </Sidebar>

      <StyledMapContainer>
        {/* 지도 위 검색창 (왼쪽 위) */}
        <MapSearchContainer>
          <MapSearchInput
            placeholder="장소 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MapSearchIcon>
            <FaSearch />
          </MapSearchIcon>
        </MapSearchContainer>

        {/* 지도 위 장소 유형 필터 (오른쪽) */}
        <MapTypeButtonsContainer>
          {/* 데스크톱: 버튼들 */}
          <MapTypeButtonsScroll>
            <MapTypeButton
              $active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              color="#007bff"
            >
              <MapTypeIcon>📍</MapTypeIcon>
              <MapTypeLabel>전체</MapTypeLabel>
            </MapTypeButton>
            {systemCategories.map(category => (
              <MapTypeButton
                key={category.id}
                $active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
                color={category.color}
              >
                <MapTypeIcon>{getCategoryIcon(category.id)}</MapTypeIcon>
                <MapTypeLabel>{category.name}</MapTypeLabel>
              </MapTypeButton>
            ))}
          </MapTypeButtonsScroll>
          
          {/* 모바일: 드롭다운 */}
          <MapTypeDropdown className="map-type-dropdown">
            <MapTypeDropdownButton onClick={toggleTypeDropdown}>
              <MapTypeIcon>
                {selectedCategory === 'all' ? '📍' : getCategoryIcon(selectedCategory)}
              </MapTypeIcon>
              <span>
                {selectedCategory === 'all' ? '전체' : systemCategories.find(c => c.id === selectedCategory)?.name || '전체'}
              </span>
              <FaChevronDown style={{ 
                transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </MapTypeDropdownButton>
            
            <MapTypeDropdownContent $isOpen={isTypeDropdownOpen}>
              <MapTypeDropdownItem
                $active={selectedCategory === 'all'}
                onClick={() => {
                  setSelectedCategory('all');
                  closeTypeDropdown();
                }}
              >
                <MapTypeIcon>📍</MapTypeIcon>
                <span>전체</span>
              </MapTypeDropdownItem>
              
              {systemCategories.map(category => (
                <MapTypeDropdownItem
                  key={category.id}
                  $active={selectedCategory === category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    closeTypeDropdown();
                  }}
                >
                  <MapTypeIcon>{getCategoryIcon(category.id)}</MapTypeIcon>
                  <span>{category.name}</span>
                </MapTypeDropdownItem>
              ))}
            </MapTypeDropdownContent>
          </MapTypeDropdown>
        </MapTypeButtonsContainer>



        {/* 검색 결과 오버레이 */}
        <SearchResultsContainer $show={showSearchResults && searchResults.length > 0}>
          <SearchResultsHeader>
            <SearchResultsTitle>
              검색 결과 ({searchResults.length})
            </SearchResultsTitle>
            <CloseSearchButton onClick={closeSearchResults}>
              <IoMdClose />
            </CloseSearchButton>
          </SearchResultsHeader>
          <SearchResultsList>
            {searchResults.map(place => {
              const category = categories.find(c => c.id === place.category);
              const bestReview = getBestReview(place.reviews);
              return (
                <SearchResultItem key={place.id} onClick={() => handleSearchResultClick(place)}>
                  <SearchResultHeader>
                    <SearchResultName>{place.name}</SearchResultName>
                    <SearchResultCategory color={category?.color || '#666'}>
                      {category?.name || '기타'}
                    </SearchResultCategory>
                  </SearchResultHeader>
                  
                  <SearchResultRating>
                    <FaStar style={{ color: '#FFD700' }} />
                    {calculateAverageRating(place.reviews)}
                  </SearchResultRating>
                  
                  {place.photos.length > 0 && (
                    <SearchResultPhotos>
                      {place.photos.slice(0, 3).map((photo, index) => (
                        <SearchResultPhoto key={index} src={photo} alt={`사진 ${index + 1}`} />
                      ))}
                    </SearchResultPhotos>
                  )}
                  
                  {bestReview && (
                    <SearchResultBestComment>
                      <strong>베스트 코멘트:</strong> {bestReview.comment}
                    </SearchResultBestComment>
                  )}
                  
                  <SearchResultAddress>
                    <FaMapMarkerAlt />
                    {place.address}
                  </SearchResultAddress>
                </SearchResultItem>
              );
            })}
          </SearchResultsList>
        </SearchResultsContainer>

        {console.log('NaverMap에 전달되는 routePath:', routePath)}
        <NaverMap 
          ref={mapRef}
          places={mapPlaces.map(place => {
            const currentLoc = userLocation || getDefaultLocation();
            const { timeMinutes } = currentLoc ? 
              calculateDistanceAndTime(currentLoc.lat, currentLoc.lng, place.lat, place.lng) : 
              { timeMinutes: 0 };
            
            return {
              ...place,
              averageRating: calculateAverageRating(place.reviews),
              estimatedTime: timeMinutes
            };
          })}
          categories={categories}
          onMapClick={handleMapClick}
          tempMarker={tempMarker}
          isAddingPlace={isAddingPlace}
          userLocation={userLocation}
          routePath={routePath}

        />


        
        <MapControls>
          <LocationButton 
            onClick={moveToMyLocation} 
            title="내 위치로 이동"
          >
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
      </StyledMapContainer>

      {/* 장소 추가 모달 */}
      {showAddPlace && (
        <Modal>
          <ModalContent style={{
            maxWidth: '500px',
            width: '90%',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: '#ffffff'
          }}>
            <ModalHeader style={{
              borderBottom: '2px solid #e9ecef',
              padding: '24px 24px 16px 24px',
              background: '#007bff',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              margin: '-1px -1px 0 -1px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                📍 새 장소 추가
              </h3>
              <CloseButton 
                onClick={() => setShowAddPlace(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <IoMdClose />
              </CloseButton>
            </ModalHeader>
            <ModalBody style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🏷️ 장소 이름 *
                </label>
                <Input
                  placeholder="예: 홍대 맛집, 스타벅스 홍대점"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🏪 카테고리
                </label>
                <Select
                  value={newPlace.category}
                  onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {systemCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {getCategoryIcon(category.id)} {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  📍 기본 주소
                </label>
                <Input
                  placeholder="주소"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#666'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🏢 세부 주소
                </label>
                <Input
                  placeholder="예: 2층 201호, 건물명, 상세 위치"
                  value={newPlace.detailedAddress}
                  onChange={(e) => setNewPlace({ ...newPlace, detailedAddress: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  📝 설명 (선택사항)
                </label>
                <TextArea
                  placeholder="장소에 대한 간단한 설명을 입력하세요"
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  📸 사진 추가 (선택사항)
                </label>
                <div style={{
                  border: '2px dashed #e9ecef',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <FaCamera style={{ fontSize: '24px', color: '#6c757d', marginBottom: '8px' }} />
                  <div style={{ color: '#6c757d', fontSize: '14px' }}>
                    사진을 선택하려면 클릭하세요
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      사진 선택
                    </div>
                  </label>
                </div>
                {newPlace.photos.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      선택된 사진 ({newPlace.photos.length}개)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {newPlace.photos.map((photo, index) => (
                        <div key={index} style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '2px solid #e9ecef'
                        }}>
                          <img 
                            src={photo} 
                            alt={`사진 ${index + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '2px solid #e9ecef'
              }}>
                <button 
                  onClick={() => setShowAddPlace(false)}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  취소
                </button>
                <button 
                  onClick={addPlace}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
                  }}
                >
                  ✅ 장소 추가
                </button>
              </div>
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
                <p><strong>장소 유형:</strong> {systemCategories.find(c => c.id === showPlaceDetail.category)?.name}</p>
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
              </ActionButtons>

              {/* 사용자 카테고리 관리 */}
              <CategoryManagement>
                <h4>내 카테고리에 추가</h4>
                <CategoryList>
                  {userCategories.map(category => (
                                    <CategoryToggleItem
                  key={category.id}
                  $active={isPlaceInCategory(showPlaceDetail.id, category.id)}
                  onClick={() => togglePlaceInCategory(showPlaceDetail.id, category.id)}
                >
                      <span>{category.name}</span>
                      {isPlaceInCategory(showPlaceDetail.id, category.id) ? (
                        <FaHeart style={{ color: '#FF6B6B' }} />
                      ) : (
                        <FaHeart style={{ color: '#e0e0e0' }} />
                      )}
                    </CategoryToggleItem>
                  ))}
                </CategoryList>
              </CategoryManagement>

              {routeInfo && (
                <RouteInfo>
                  <FaRoute />
                  {routeInfo.error ? (
                    <span style={{ color: '#dc3545' }}>{routeInfo.error}</span>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {routeInfo.description}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        거리: {routeInfo.distance} | 시간: {routeInfo.time} | 방법: {routeInfo.method}
                      </div>
                    </div>
                  )}
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
                  $active={review.userLiked}
                  onClick={() => toggleReviewReaction(review.id, 'like')}
                >
                        <FaThumbsUp />
                        {review.likes}
                      </ReactionButton>
                                      <ReactionButton
                  $active={review.userDisliked}
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
                      $active={star <= newReview.rating}
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
              <h3>새로운 내 카테고리 추가</h3>
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
                      $active={star <= editingReview.rating}
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
  background: ${props => props.$active ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  padding: ${props => props.$small ? '4px 8px' : '8px 12px'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.$small ? '10px' : '12px'};
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#c82333' : '#0056b3'};
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
  padding: 10px 14px;
  margin-bottom: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  border-left: 4px solid ${props => props.$active ? (props.color || '#007bff') : 'transparent'};
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.$active ? '#e3f2fd' : '#f8f9fa'};
    transform: ${props => props.$active ? 'translateX(2px)' : 'none'};
  }
  
  span {
    color: ${props => props.$active ? '#1976d2' : '#333'};
    font-weight: ${props => props.$active ? '600' : '400'};
    font-size: 14px;
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
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }
`;

const PlaceInfo = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 123, 255, 0.05);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  position: relative;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    background: #004085;
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
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
`;

const LocationButton = styled.button`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  svg {
    width: 22px;
    height: 22px;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: linear-gradient(135deg, #0056b3, #004085);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
    
    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const ZoomControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 4px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
`;

const ZoomButton = styled.button`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  width: 26px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);

  svg {
    width: 9px;
    height: 9px;
  }

  &:hover {
    background: linear-gradient(135deg, #0056b3, #004085);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }
`;

const ZoomSlider = styled.div`
  width: 4px;
  height: 90px;
  background: #e0e0e0;
  position: relative;
  cursor: pointer;
  border-radius: 3px;
  margin: 3px 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ZoomThumb = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 16px;
  background: #007bff;
  border-radius: 4px;
  cursor: grab;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 123, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.15);
    transform: translateX(-50%) scale(1.1);
  }

  &:active {
    cursor: grabbing;
    transform: translateX(-50%) scale(0.95);
  }
`;

const ZoomLevel = styled.div`
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);

  ${ZoomSlider}:hover & {
    opacity: 1;
    transform: translateY(-50%) scale(1.05);
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
    border-right: 4px solid rgba(0, 0, 0, 0.8);
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
  background: ${props => props.$small ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  padding: ${props => props.$small ? '4px 8px' : '8px 12px'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.$small ? '10px' : '12px'};
  font-weight: 500;
  
  &:hover {
    background: ${props => props.$small ? '#5a6268' : '#0056b3'};
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

// 검색 결과 관련 스타일
const SearchResultsContainer = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 90%;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
  display: ${props => props.$show ? 'block' : 'none'};

  @media (max-width: 768px) {
    width: 90%;
    top: 70px;
  }
`;

const SearchResultsHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchResultsTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const CloseSearchButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
  }
`;

const SearchResultsList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

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
  font-size: 1rem;
  color: #333;
  flex: 1;
`;

const SearchResultCategory = styled.span`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 8px;
`;

const SearchResultRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
`;

const SearchResultPhotos = styled.div`
  display: flex;
  gap: 8px;
  margin: 8px 0;
  overflow-x: auto;
`;

const SearchResultPhoto = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
`;

const SearchResultBestComment = styled.div`
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 0.9rem;
  color: #555;
  border-left: 3px solid #007bff;
`;

const SearchResultAddress = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NoSearchResults = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
`;

const SearchIcon = styled.div`
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 16px;
`;

// 지도 위 장소 유형 버튼들 스타일
const MapTypeButtonsContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    top: 20px;
    right: 10px;
  }
  
  @media (max-width: 480px) {
    top: 20px;
    right: 5px;
  }
`;

const MapTypeButtonsScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  
  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const MapTypeButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: white;
  border: 1px solid ${props => props.$active ? props.color : '#e0e0e0'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.$active && `
    background: ${props.color}15;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: ${props.color};
  `}
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const MapTypeLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

// 드롭다운 스타일들 (1200px 이하에서 사용)
const MapTypeDropdown = styled.div`
  position: relative;
  display: none;
  
  @media (max-width: 1200px) {
    display: block;
  }
`;

const MapTypeDropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  color: #333;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const MapTypeDropdownContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1001;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  @media (max-width: 480px) {
    min-width: 180px;
  }
`;

const MapTypeDropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$active ? '#f8f9fa' : 'white'};
  border: none;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #333;
  
  &:last-child {
    border-bottom: none;
    border-radius: 0 0 12px 12px;
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  ${props => props.$active && `
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 600;
  `}
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
  }
`;

const MapTypeIcon = styled.span`
  font-size: 16px;
  line-height: 1;
`;

// 지도 위 검색창 스타일
const MapSearchContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 280px;
  max-width: 40%;
  z-index: 1000;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.2s ease;
  padding: 8px 16px;

  &:focus-within {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
  }

  @media (max-width: 1200px) {
    width: 140px;
    max-width: 35%;
    top: 20px;
    left: 10px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    max-width: 30%;
    top: 20px;
    left: 5px;
    padding: 5px 10px;
  }
`;

const MapSearchInput = styled.input`
  flex: 1;
  padding: 0 8px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  
  &::placeholder {
    color: #999;
  }
`;

const MapSearchIcon = styled.div`
  padding: 0 8px;
  color: #666;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #007bff;
  }
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

const CategoryManagement = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  
  h4 {
    margin: 0 0 12px 0;
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
  }
`;

const CategoryToggleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 6px;
  border: 1px solid ${props => props.active ? '#FF6B6B' : '#e0e0e0'};
  border-radius: 6px;
  background: ${props => props.active ? '#fff5f5' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#ffe5e5' : '#f8f9fa'};
  }
  
  span {
    font-size: 14px;
    color: #333;
  }
`;



export default MapPage; 