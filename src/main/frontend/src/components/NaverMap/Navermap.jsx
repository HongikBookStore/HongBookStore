import React, { useEffect, useRef, useImperativeHandle, forwardRef, memo, useState } from 'react';
import styled from 'styled-components';

// 스크립트가 중복 로드되는 것을 방지하기 위한 전역 플래그
let isNaverMapScriptLoaded = false;

const NaverMapComponent = forwardRef(({
                                          places = [],
                                          categories = [],
                                          onMapClick,
                                          onPlaceClick,
                                          userLocation = null,
                                          routePath = null,
                                          showMyLocation = false
                                      }, ref) => {
    const mapElementRef = useRef(null); // 지도를 담을 div 엘리먼트에 대한 ref
    const mapInstanceRef = useRef(null); // 생성된 네이버 지도 인스턴스에 대한 ref
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const routeMarkersRef = useRef([]);


    const getCategoryIcon = (categoryId) => {
        switch (categoryId) {
            case 'restaurant': return '🍽️';
            case 'cafe': return '☕';
            case 'partner': return '🤝';
            case 'convenience': return '🏪';
            case 'other': return '📍';
            default: return '📍';
        }
    };

    useImperativeHandle(ref, () => ({
        moveToLocation: (lat, lng, zoom = 16) => {
            if (mapInstanceRef.current && window.naver && window.naver.maps) {
                mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
                mapInstanceRef.current.setZoom(zoom);
            }
        },
        zoomIn: () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
            }
        },
        zoomOut: () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
            }
        },
        setZoom: (zoom) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(zoom);
            }
        },
        getMap: () => mapInstanceRef.current
    }));

    // 지도 초기화 로직 (최초 1회만 실행)
    useEffect(() => {
        if (isNaverMapScriptLoaded || !mapElementRef.current) {
            return;
        }

        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        console.log('Naver Maps Client ID:', clientId); // 디버깅용
        if (!clientId) {
            console.error("Naver Maps Client ID가 .env 파일에 설정되지 않았습니다.");
            return;
        }

        isNaverMapScriptLoaded = true;

        const script = document.createElement('script');
        // 서브모듈 추가 및 타임아웃 설정
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
        script.async = true;
        
        script.onerror = (error) => {
            console.error('네이버 지도 스크립트 로드에 실패했습니다:', error);
            console.error('Client ID:', clientId);
            console.error('현재 도메인:', window.location.hostname);
            isNaverMapScriptLoaded = false;
        };
        script.onload = () => {
            if (window.naver && window.naver.maps) {
                const mapOptions = {
                    center: new window.naver.maps.LatLng(37.5665, 126.978),
                    zoom: 15,
                };
                const map = new window.naver.maps.Map(mapElementRef.current, mapOptions);
                mapInstanceRef.current = map;
            } else {
                console.error('window.naver.maps를 사용할 수 없습니다.');
                isNaverMapScriptLoaded = false;
            }
        };

        document.head.appendChild(script);

    }, []);

    // 지도 클릭 이벤트 리스너 설정
    useEffect(() => {
        if (!mapInstanceRef.current || !onMapClick) return;

        const listener = window.naver.maps.Event.addListener(mapInstanceRef.current, 'click', (e) => {
            // 지도 클릭 시 항상 좌표 정보를 전달
            onMapClick(e.coord.lat(), e.coord.lng());
        });

        return () => {
            window.naver.maps.Event.removeListener(listener);
        };
    }, [onMapClick]);

    // 장소 마커 업데이트 로직
    useEffect(() => {
        if (!mapInstanceRef.current || !window.naver || !window.naver.maps) return;

        // 기존 마커 정리
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        infoWindowsRef.current = [];

        // 새 마커 추가
        places.forEach(place => {
            const category = categories.find(cat => cat.id === place.category);
            const markerColor = category ? category.color : '#FF6B6B';

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(place.lat, place.lng),
                map: mapInstanceRef.current,
                icon: {
                    content: `<div style="background-color:${markerColor};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">${getCategoryIcon(place.category)}</div>`,
                    anchor: new window.naver.maps.Point(12, 12),
                }
            });

            // 마커 클릭 시 장소 상세 모달 열기
            window.naver.maps.Event.addListener(marker, 'click', () => {
                if (onPlaceClick) {
                    onPlaceClick(place);
                }
            });

            markersRef.current.push(marker);
        });

    }, [places, categories, onPlaceClick]);

    // 클릭 모드에 따른 커서 스타일 변경 제거
    // useEffect(() => {
    //     if (!mapInstanceRef.current) return;
    //     const mapEl = mapInstanceRef.current.getElement();
    //     if (mapEl) {
    //         mapEl.style.cursor = mapClickMode ? 'crosshair' : 'grab';
    //     }
    // }, [mapClickMode]);



    return <div id="map" ref={mapElementRef} style={{ width: '100%', height: '100%' }} />;
});

const MemoizedNaverMap = memo(NaverMapComponent);

export default MemoizedNaverMap;
