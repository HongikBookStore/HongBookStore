import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    // localStorage에서 저장된 위치 정보 불러오기
    try {
      const saved = localStorage.getItem('userLocation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [locations, setLocations] = useState(() => {
    // localStorage에서 저장된 위치 목록 불러오기
    try {
      const saved = localStorage.getItem('userLocations');
      return saved ? JSON.parse(saved) : [
        { 
          id: 1, 
          name: '홍익대학교 정문', 
          address: '서울특별시 마포구 와우산로 94', 
          lat: 37.5519, 
          lng: 126.9259,
          isDefault: true 
        }
      ];
    } catch {
      return [
        { 
          id: 1, 
          name: '홍익대학교 정문', 
          address: '서울특별시 마포구 와우산로 94', 
          lat: 37.5519, 
          lng: 126.9259,
          isDefault: true 
        }
      ];
    }
  });

  // 위치 정보가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    }
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem('userLocations', JSON.stringify(locations));
  }, [locations]);

  // 기본 위치 설정
  const setDefaultLocation = (locationId) => {
    setLocations(prev => prev.map(loc => ({
      ...loc,
      isDefault: loc.id === locationId
    })));
    
    // 기본 위치를 현재 사용자 위치로 설정
    const defaultLoc = locations.find(loc => loc.id === locationId);
    if (defaultLoc) {
      setUserLocation({
        lat: defaultLoc.lat,
        lng: defaultLoc.lng,
        name: defaultLoc.name,
        address: defaultLoc.address
      });
    }
  };

  // 위치 추가
  const addLocation = (location) => {
    const newLocation = {
      ...location,
      id: Date.now(),
      isDefault: locations.length === 0
    };
    setLocations(prev => [...prev, newLocation]);
    
    // 첫 번째 위치라면 기본 위치로 설정
    if (locations.length === 0) {
      setUserLocation({
        lat: newLocation.lat,
        lng: newLocation.lng,
        name: newLocation.name,
        address: newLocation.address
      });
    }
  };

  // 위치 삭제
  const deleteLocation = (locationId) => {
    const locationToDelete = locations.find(loc => loc.id === locationId);
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    
    // 삭제된 위치가 현재 사용자 위치였다면 기본 위치로 변경
    if (locationToDelete && userLocation && 
        locationToDelete.lat === userLocation.lat && 
        locationToDelete.lng === userLocation.lng) {
      const defaultLoc = locations.find(loc => loc.id !== locationId && loc.isDefault);
      if (defaultLoc) {
        setUserLocation({
          lat: defaultLoc.lat,
          lng: defaultLoc.lng,
          name: defaultLoc.name,
          address: defaultLoc.address
        });
      }
    }
  };

  // 현재 위치 업데이트
  const updateCurrentLocation = (lat, lng, name, address) => {
    setUserLocation({ lat, lng, name, address });
  };

  // 기본 위치 가져오기
  const getDefaultLocation = () => {
    return locations.find(loc => loc.isDefault) || locations[0];
  };

  const value = {
    userLocation,
    locations,
    setDefaultLocation,
    addLocation,
    deleteLocation,
    updateCurrentLocation,
    getDefaultLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 