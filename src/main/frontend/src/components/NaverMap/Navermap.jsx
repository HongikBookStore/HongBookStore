import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const NaverMap = forwardRef(({ places = [], categories = [], onMapClick, tempMarker = null, isAddingPlace = false, userLocation = null, routePath = null }, ref) => {
    console.log('NaverMap 컴포넌트 렌더링 - routePath:', routePath);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const routeMarkersRef = useRef([]);
    const tempMarkerRef = useRef(null);

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

    // 부모 컴포넌트에서 지도 인스턴스에 접근할 수 있도록 expose
    useImperativeHandle(ref, () => ({
        moveToLocation: (lat, lng, zoom = 16) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
                mapInstanceRef.current.setZoom(zoom);
            }
        },
        zoomIn: () => {
            if (mapInstanceRef.current) {
                const currentZoom = mapInstanceRef.current.getZoom();
                const newZoom = Math.min(20, currentZoom + 1);
                mapInstanceRef.current.setZoom(newZoom);
            }
        },
        zoomOut: () => {
            if (mapInstanceRef.current) {
                const currentZoom = mapInstanceRef.current.getZoom();
                const newZoom = Math.max(1, currentZoom - 1);
                mapInstanceRef.current.setZoom(newZoom);
            }
        },
        setZoom: (zoom) => {
            if (mapInstanceRef.current) {
                // 바로 줌 설정 (애니메이션 없이)
                mapInstanceRef.current.setZoom(zoom);
            }
        },
        getMap: () => mapInstanceRef.current
    }));

    // 좌표를 도로명 주소로 변환하는 함수
    const getAddressFromCoordinates = async (lat, lng) => {
        console.log('주소 변환 시작:', lat, lng);
        
        try {
            // 백엔드 API를 통해 네이버 API 호출
            const url = `/api/naver/reverse-geocode?coords=${lng},${lat}&sourcecrs=epsg:4326&targetcrs=epsg:4326&orders=roadaddr&output=json`;
            console.log('백엔드 API 호출 URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('API 응답 상태:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 응답 오류:', errorText);
                // API 실패 시 테스트 주소 반환
                return `서울특별시 마포구 홍대로 ${Math.floor(Math.random() * 100) + 1} (API 실패)`;
            }
            
            const data = await response.json();
            console.log('주소 변환 결과:', data);
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                if (result.region && result.land) {
                    const roadAddress = `${result.region.area1.name} ${result.region.area2.name} ${result.region.area3.name} ${result.land.name}`;
                    console.log('변환된 주소:', roadAddress);
                    return roadAddress;
                }
            }
            
            console.log('주소 변환 결과가 없음 - 테스트 주소 반환');
            return `서울특별시 마포구 홍대로 ${Math.floor(Math.random() * 100) + 1} (결과 없음)`;
        } catch (error) {
            console.error('주소 변환 오류:', error);
            // 오류 시 테스트 주소 반환
            return `서울특별시 마포구 홍대로 ${Math.floor(Math.random() * 100) + 1} (오류)`;
        }
    };

    useEffect(() => {
        console.log('Client ID:', import.meta.env.VITE_NAVER_MAP_CLIENT_ID);

        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        console.log('네이버 지도 스크립트 추가됨 ✅');

        script.onload = () => {
            console.log('window.naver:', window.naver);

            if (window.naver && window.naver.maps) {
                const map = new window.naver.maps.Map('map', {
                    center: new window.naver.maps.LatLng(37.5665, 126.978),
                    zoom: 15,
                });
                
                mapInstanceRef.current = map;
                
                // 지도 인스턴스를 DOM 요소에 저장 (부모 컴포넌트에서 접근용)
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    mapElement.__naverMap = map;
                }

                // 지도 클릭 이벤트 추가
                window.naver.maps.Event.addListener(map, 'click', async (e) => {
                    console.log('=== 네이버 지도 클릭 이벤트 발생 ===');
                    console.log('클릭 좌표:', e.coord.lat(), e.coord.lng());
                    console.log('onMapClick 함수 존재:', !!onMapClick);
                    console.log('isAddingPlace:', isAddingPlace);
                    
                    if (onMapClick) {
                        console.log('onMapClick 함수 호출');
                        
                        // 주소 변환 시도
                        const address = await getAddressFromCoordinates(e.coord.lat(), e.coord.lng());
                        onMapClick(e.coord.lat(), e.coord.lng(), address);
                    } else {
                        console.log('onMapClick 함수가 없음');
                    }
                });

                // 지도 로드 완료 이벤트 추가
                window.naver.maps.Event.addListener(map, 'init', () => {
                    console.log('지도 초기화 완료');
                });

                // 장소 추가 모드에 따른 커서 스타일 변경
                if (mapElement) {
                    mapElement.style.cursor = isAddingPlace ? 'crosshair' : 'grab';
                }

                console.log('네이버 지도 초기화 완료 ✅');
            } else {
                console.error('window.naver.maps가 존재하지 않음 ❌');
            }
        };

        script.onerror = () => {
            console.error('네이버 지도 스크립트 로드 실패 ❌');
        };
    }, [onMapClick, isAddingPlace]);

    // 임시 마커 업데이트
    useEffect(() => {
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current) {
            return;
        }

        const map = mapInstanceRef.current;

        // 기존 임시 마커 제거
        if (tempMarkerRef.current) {
            tempMarkerRef.current.setMap(null);
            tempMarkerRef.current = null;
        }

        // 임시 마커가 있으면 생성
        if (tempMarker && isAddingPlace) {
            console.log('임시 마커 생성:', tempMarker);
            const tempMarkerInstance = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(tempMarker.lat, tempMarker.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            background: #007bff;
                            color: white;
                            padding: 6px 10px;
                            border-radius: 16px;
                            font-size: 11px;
                            font-weight: bold;
                            box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
                            border: 2px solid white;
                            animation: gentle-pulse 2s infinite;
                        ">
                            📍 임시 위치
                        </div>
                        <style>
                            @keyframes gentle-pulse {
                                0% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.8; transform: scale(1.05); }
                                100% { opacity: 1; transform: scale(1); }
                            }
                        </style>
                    `,
                    size: new window.naver.maps.Size(90, 35),
                    anchor: new window.naver.maps.Point(45, 17)
                }
            });
            tempMarkerRef.current = tempMarkerInstance;
        }
    }, [tempMarker, isAddingPlace]);

    // 기존 마커들 제거
    useEffect(() => {
        markersRef.current.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        markersRef.current = [];

        infoWindowsRef.current.forEach(infoWindow => {
            if (infoWindow && infoWindow.close) {
                infoWindow.close();
            }
        });
        infoWindowsRef.current = [];
    }, [places]);

    // 장소 마커 생성
    useEffect(() => {
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current || !places.length) {
            return;
        }

        const map = mapInstanceRef.current;
        const filteredPlaces = places;

        filteredPlaces.forEach(place => {
            const category = categories.find(c => c.id === place.category);
            const icon = getCategoryIcon(place.category);

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(place.lat, place.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            background: ${category?.color || '#666'};
                            color: white;
                            padding: 6px 10px;
                            border-radius: 16px;
                            font-size: 11px;
                            font-weight: bold;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                            border: 2px solid white;
                            cursor: pointer;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            ${icon} ${place.name}
                        </div>
                    `,
                    size: new window.naver.maps.Size(120, 30),
                    anchor: new window.naver.maps.Point(60, 15)
                }
            });

            const infoWindow = new window.naver.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; max-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${place.name}</h4>
                        <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">
                            ${category?.name || '기타'} • ⭐ ${place.averageRating || 0}
                        </p>
                        <p style="margin: 0; color: #888; font-size: 11px;">
                            ${place.address}
                        </p>
                    </div>
                `,
                borderWidth: 0,
                backgroundColor: "white",
                borderRadius: "8px",
                anchorSize: new window.naver.maps.Size(10, 10),
                anchorColor: "white"
            });

            window.naver.maps.Event.addListener(marker, 'click', () => {
                if (infoWindowsRef.current.length > 0) {
                    infoWindowsRef.current.forEach(iw => iw.close());
                }
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
        });
    }, [places, categories]);



    // 경로 표시
    useEffect(() => {
        console.log('=== 경로 표시 useEffect 실행 ===');
        console.log('routePath prop:', routePath);
        console.log('window.naver:', !!window.naver);
        console.log('window.naver.maps:', !!window.naver?.maps);
        console.log('mapInstanceRef.current:', !!mapInstanceRef.current);
        
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current) {
            console.log('지도 초기화 조건 불충족:', { 
                naver: !!window.naver, 
                maps: !!window.naver?.maps, 
                mapInstance: !!mapInstanceRef.current
            });
            return;
        }

        const map = mapInstanceRef.current;
        
        // routePath가 null이면 기존 경로만 제거하고 종료
        if (!routePath) {
            console.log('routePath가 null이므로 기존 경로 제거');
            if (routeLineRef.current) {
                routeLineRef.current.setMap(null);
                routeLineRef.current = null;
            }
            routeMarkersRef.current.forEach(marker => {
                if (marker && marker.setMap) {
                    marker.setMap(null);
                }
            });
            routeMarkersRef.current = [];
            return;
        }

        console.log('경로 표시 시작:', routePath);
        console.log('지도 인스턴스 상태:', map);
        console.log('지도 중심:', map.getCenter());
        console.log('지도 줌:', map.getZoom());

        // 기존 경로 제거
        if (routeLineRef.current) {
            console.log('기존 경로선 제거');
            routeLineRef.current.setMap(null);
        }
        routeMarkersRef.current.forEach(marker => {
            if (marker && marker.setMap) {
                console.log('기존 마커 제거');
                marker.setMap(null);
            }
        });
        routeMarkersRef.current = [];

        // 경로 데이터 검증
        if (!routePath.path || !Array.isArray(routePath.path) || routePath.path.length < 2) {
            console.error('경로 데이터가 올바르지 않습니다:', routePath);
            return;
        }

        // 경로 좌표 배열 생성
        const pathCoords = routePath.path.map(point => 
            new window.naver.maps.LatLng(point.lat, point.lng)
        );

        console.log('경로 좌표 생성됨:', pathCoords);
        console.log('경로선 생성 시작...');

        try {
            const routeLine = new window.naver.maps.Polyline({
                path: pathCoords,
                strokeColor: '#007bff',
                strokeWeight: 6, // 더 두껍게
                strokeOpacity: 1.0, // 더 진하게
                map: map
            });

            routeLineRef.current = routeLine;
            console.log('경로선 생성 성공:', routeLine);
            console.log('경로선이 지도에 추가됨');
            
            // 경로가 지도에 맞도록 줌 조정
            const bounds = new window.naver.maps.LatLngBounds();
            pathCoords.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, 50); // 50px 패딩
            console.log('지도 줌 조정 완료');
            
        } catch (error) {
            console.error('경로선 생성 실패:', error);
        }

        // 시작점과 도착점 마커
        if (routePath.start && routePath.end) {
            console.log('마커 생성 시작...');
            
            try {
                const startMarker = new window.naver.maps.Marker({
                    position: new window.naver.maps.LatLng(routePath.start.lat, routePath.start.lng),
                    map: map,
                    icon: {
                        content: `
                            <div style="
                                background: #28a745;
                                color: white;
                                padding: 8px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: bold;
                                box-shadow: 0 4px 8px rgba(40, 167, 69, 0.6);
                                border: 3px solid white;
                                z-index: 1000;
                            ">
                                🚀 시작
                            </div>
                        `,
                        size: new window.naver.maps.Size(90, 35),
                        anchor: new window.naver.maps.Point(45, 17)
                    }
                });

                const endMarker = new window.naver.maps.Marker({
                    position: new window.naver.maps.LatLng(routePath.end.lat, routePath.end.lng),
                    map: map,
                    icon: {
                        content: `
                            <div style="
                                background: #dc3545;
                                color: white;
                                padding: 8px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: bold;
                                box-shadow: 0 4px 8px rgba(220, 53, 69, 0.6);
                                border: 3px solid white;
                                z-index: 1000;
                            ">
                                🎯 도착
                            </div>
                        `,
                        size: new window.naver.maps.Size(90, 35),
                        anchor: new window.naver.maps.Point(45, 17)
                    }
                });

                routeMarkersRef.current.push(startMarker, endMarker);
                console.log('시작점과 도착점 마커 생성 성공');
                console.log('시작점 위치:', routePath.start);
                console.log('도착점 위치:', routePath.end);
                
            } catch (error) {
                console.error('마커 생성 실패:', error);
            }
        } else {
            console.error('시작점 또는 도착점 데이터가 없습니다:', routePath);
        }
    }, [routePath]);



    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
});

export default NaverMap;
