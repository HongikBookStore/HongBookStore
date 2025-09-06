import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

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

  // 서버 동기화: 로그인 상태면 서버에서 목록을 불러와 반영
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // 비로그인 시 로컬 유지
    (async () => {
      try {
        const res = await api.get('/my/locations');
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(list) && list.length > 0) {
          setLocations(list);
          const def = list.find(l => l.isDefault) || list[0];
          setUserLocation(def ? { lat: def.lat, lng: def.lng, name: def.name, address: def.address } : null);
        }
      } catch (e) {
        // 서버 불가 시 로컬 유지
        console.warn('Failed to load my locations from server:', e?.response?.data?.message || e.message);
      }
    })();
  }, []);

  // 기본 위치 설정
  const setDefaultLocation = async (locationId) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.patch(`/my/locations/${locationId}/default`);
        const server = await api.get('/my/locations');
        const list = Array.isArray(server) ? server : server?.data;
        setLocations(list || []);
        const def = (list || []).find(l => l.isDefault) || (list || [])[0];
        if (def) setUserLocation({ lat: def.lat, lng: def.lng, name: def.name, address: def.address });
        return;
      } catch (e) {
        console.error('Failed to set default location on server', e);
      }
    }
    // 로컬 폴백
    setLocations(prev => prev.map(loc => ({ ...loc, isDefault: loc.id === locationId })));
    const defaultLoc = locations.find(loc => loc.id === locationId);
    if (defaultLoc) setUserLocation({ lat: defaultLoc.lat, lng: defaultLoc.lng, name: defaultLoc.name, address: defaultLoc.address });
  };

  // 위치 추가
  const addLocation = async (location) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = {
          name: location.name,
          address: location.address,
          lat: location.lat ?? null,
          lng: location.lng ?? null,
          makeDefault: locations.length === 0
        };
        await api.post('/my/locations', payload);
        const server = await api.get('/my/locations');
        const list = Array.isArray(server) ? server : server?.data;
        setLocations(list || []);
        const def = (list || []).find(l => l.isDefault) || (list || [])[0];
        if (def) setUserLocation({ lat: def.lat, lng: def.lng, name: def.name, address: def.address });
        return;
      } catch (e) {
        console.error('Failed to add location on server', e);
      }
    }
    // 로컬 폴백
    const newLocation = { ...location, id: Date.now(), isDefault: locations.length === 0 };
    setLocations(prev => [...prev, newLocation]);
    if (locations.length === 0) setUserLocation({ lat: newLocation.lat, lng: newLocation.lng, name: newLocation.name, address: newLocation.address });
  };

  // 위치 삭제
  const deleteLocation = async (locationId) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.delete(`/my/locations/${locationId}`);
        const server = await api.get('/my/locations');
        const list = Array.isArray(server) ? server : server?.data;
        setLocations(list || []);
        const def = (list || []).find(l => l.isDefault) || (list || [])[0];
        if (def) setUserLocation({ lat: def.lat, lng: def.lng, name: def.name, address: def.address });
        else setUserLocation(null);
        return;
      } catch (e) {
        console.error('Failed to delete location on server', e);
      }
    }
    // 로컬 폴백
    const locationToDelete = locations.find(loc => loc.id === locationId);
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    if (locationToDelete && userLocation && locationToDelete.lat === userLocation.lat && locationToDelete.lng === userLocation.lng) {
      const defaultLoc = locations.find(loc => loc.id !== locationId && loc.isDefault);
      if (defaultLoc) setUserLocation({ lat: defaultLoc.lat, lng: defaultLoc.lng, name: defaultLoc.name, address: defaultLoc.address });
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
    locations: [...locations].sort((a,b)=> (b.isDefault - a.isDefault) || String(a.name||'').localeCompare(String(b.name||''))),
    setDefaultLocation,
    addLocation,
    deleteLocation,
    updateCurrentLocation,
    getDefaultLocation,
    updateLocation: async (id, partial) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await api.patch(`/my/locations/${id}`, partial);
          const server = await api.get('/my/locations');
          const list = Array.isArray(server) ? server : server?.data;
          setLocations(list || []);
          const def = (list || []).find(l => l.isDefault) || (list || [])[0];
          if (def) setUserLocation({ lat: def.lat, lng: def.lng, name: def.name, address: def.address });
          return;
        } catch (e) {
          console.error('Failed to update location on server', e);
        }
      }
      // 로컬 폴백 업데이트
      setLocations(prev => prev.map(l => l.id === id ? { ...l, ...(partial || {}) } : l));
    }
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 
