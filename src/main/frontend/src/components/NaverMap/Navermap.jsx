import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const NaverMap = forwardRef(({ places = [], categories = [], onMapClick, mapClickMode = false, userLocation = null, routePath = null, showMyLocation = false }, ref) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const routeMarkersRef = useRef([]);

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
                mapInstanceRef.current.setZoom(currentZoom + 1);
            }
        },
        zoomOut: () => {
            if (mapInstanceRef.current) {
                const currentZoom = mapInstanceRef.current.getZoom();
                mapInstanceRef.current.setZoom(currentZoom - 1);
            }
        },
        setZoom: (zoom) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(zoom);
            }
        },
        getMap: () => mapInstanceRef.current
    }));

    // 좌표를 도로명 주소로 변환하는 함수
    const getAddressFromCoordinates = async (lat, lng) => {
        console.log('주소 변환 시작:', lat, lng);
        
        // API 키 확인
        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_NAVER_MAP_CLIENT_SECRET;
        
        console.log('API 키 확인:', { clientId: !!clientId, clientSecret: !!clientSecret });
        
        if (!clientId || !clientSecret) {
            console.error('API 키가 설정되지 않음 - 테스트 주소 반환');
            // 테스트용 주소 반환
            return `서울특별시 마포구 홍대로 ${Math.floor(Math.random() * 100) + 1} (테스트)`;
        }
        
        try {
            const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&sourcecrs=epsg:4326&targetcrs=epsg:4326&orders=roadaddr&output=json`;
            console.log('API 호출 URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': clientId,
                    'X-NCP-APIGW-API-KEY': clientSecret,
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

    // 테스트용 지도 클릭 핸들러
    const handleTestMapClick = async (e) => {
        console.log('테스트 지도 클릭됨!');
        console.log('클릭 좌표:', e.clientX, e.clientY);
        console.log('onMapClick 함수:', onMapClick);
        console.log('mapClickMode:', mapClickMode);
        
        if (onMapClick) {
            // 간단한 좌표 계산 (실제로는 지도 좌표계로 변환해야 함)
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 간단한 위도/경도 변환 (테스트용)
            const lat = 37.5665 + (y - rect.height / 2) * 0.001;
            const lng = 126.978 + (x - rect.width / 2) * 0.001;
            
            console.log('계산된 좌표:', lat, lng);
            
            // 주소 변환 시도
            const address = await getAddressFromCoordinates(lat, lng);
            onMapClick(lat, lng, address);
        }
    };

    useEffect(() => {
        console.log('Client ID:', import.meta.env.VITE_NAVER_MAP_CLIENT_ID);

        // API 키가 없으면 테스트 모드로 실행
        if (!import.meta.env.VITE_NAVER_MAP_CLIENT_ID) {
            console.log('API 키가 없어서 테스트 모드로 실행');
            return;
        }



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
                    console.log('mapClickMode:', mapClickMode);
                    
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

                // 지도 클릭 모드에 따른 커서 스타일 변경
                if (mapElement) {
                    mapElement.style.cursor = mapClickMode ? 'crosshair' : 'grab';
                }

                console.log('네이버 지도 초기화 완료 ✅');
            } else {
                console.error('window.naver.maps가 존재하지 않음 ❌');
            }
        };

        script.onerror = () => {
            console.error('네이버 지도 스크립트 로드 실패 ❌');
        };
    }, [onMapClick]);

    // 장소 마커 업데이트
    useEffect(() => {
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        // 기존 마커들 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 기존 정보창들 제거
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        infoWindowsRef.current = [];

        // 새로운 마커들 생성
        places.forEach(place => {
            const category = categories.find(cat => cat.id === place.category);
            const markerColor = category ? category.color : '#FF6B6B';
            const categoryName = category ? category.name : '기타';

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(place.lat, place.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        ">
                            <!-- 메인 마커 -->
                            <div style="
                                background: ${markerColor};
                                width: 28px;
                                height: 28px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-size: 12px;
                                font-weight: bold;
                                margin-bottom: 3px;
                                position: relative;
                            ">
                                ${getCategoryIcon(place.category)}
                            </div>
                            
                            <!-- 평점 표시 -->
                            ${place.averageRating > 0 ? `
                                <div style="
                                    background: rgba(255, 215, 0, 0.9);
                                    color: #333;
                                    padding: 2px 4px;
                                    border-radius: 8px;
                                    font-size: 9px;
                                    font-weight: bold;
                                    white-space: nowrap;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                    margin-bottom: 1px;
                                ">
                                    ⭐ ${place.averageRating}
                                </div>
                            ` : ''}
                            
                            <!-- 경로 시간 표시 -->
                            ${place.estimatedTime > 0 ? `
                                <div style="
                                    background: rgba(0, 123, 255, 0.9);
                                    color: white;
                                    padding: 2px 4px;
                                    border-radius: 8px;
                                    font-size: 9px;
                                    font-weight: bold;
                                    white-space: nowrap;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                ">
                                    ${place.estimatedTime}분
                                </div>
                            ` : ''}
                        </div>
                    `,
                    size: new window.naver.maps.Size(28, 70),
                    anchor: new window.naver.maps.Point(14, 14)
                }
            });

            const infoWindow = new window.naver.maps.InfoWindow({
                content: `
                    <div style="padding: 12px; min-width: 220px; font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${place.name}</h4>
                        <p style="margin: 0 0 6px 0; color: #666; font-size: 11px;">${place.address}</p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0;">
                            <span style="
                                background: ${markerColor};
                                color: white;
                                padding: 3px 8px;
                                border-radius: 12px;
                                font-size: 10px;
                                font-weight: bold;
                            ">
                                ${category ? category.name : '기타'}
                            </span>
                            
                            ${place.averageRating > 0 ? `
                                <span style="
                                    background: #FFD700;
                                    color: #333;
                                    padding: 3px 6px;
                                    border-radius: 8px;
                                    font-size: 10px;
                                    font-weight: bold;
                                ">
                                    ⭐ ${place.averageRating}
                                </span>
                            ` : ''}
                        </div>
                        
                        ${place.estimatedTime > 0 ? `
                            <div style="
                                background: #e3f2fd;
                                color: #1976d2;
                                padding: 6px 8px;
                                border-radius: 6px;
                                font-size: 11px;
                                font-weight: bold;
                                margin-top: 6px;
                                display: flex;
                                align-items: center;
                                gap: 4px;
                            ">
                                🚶‍♂️ 예상 도보 시간: ${place.estimatedTime}분
                            </div>
                        ` : ''}
                    </div>
                `
            });

            // 마커 클릭 이벤트
            window.naver.maps.Event.addListener(marker, 'click', (e) => {
                e.domEvent.stopPropagation(); // 지도 클릭 이벤트 전파 방지
                
                // 다른 정보창들 닫기
                infoWindowsRef.current.forEach(iw => iw.close());
                
                // 현재 정보창 열기
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
        });

        return () => {
            markersRef.current.forEach(marker => marker.setMap(null));
            infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        };
    }, [places, categories]);

    // 사용자 위치 마커 업데이트
    useEffect(() => {
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current || !userLocation) return;
        const map = mapInstanceRef.current;

        // 기존 사용자 마커 제거
        if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
            userMarkerRef.current = null;
        }

        // showMyLocation이 true일 때만 마커 표시
        if (showMyLocation) {
            // 새로운 사용자 마커 생성 (빨간 점)
            const userMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        ">
                            <!-- 메인 마커 -->
                            <div style="
                                background: #ff0000;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                animation: pulse 2s infinite;
                            ">
                                <div style="
                                    background: #ff0000;
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50%;
                                "></div>
                            </div>
                            
                            <!-- 위치 라벨 -->
                            <div style="
                                background: rgba(0, 0, 0, 0.8);
                                color: white;
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 10px;
                                font-weight: bold;
                                white-space: nowrap;
                                margin-top: 4px;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            ">
                                내 위치
                            </div>
                        </div>
                        
                        <style>
                            @keyframes pulse {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.1); }
                                100% { transform: scale(1); }
                            }
                        </style>
                    `,
                    size: new window.naver.maps.Size(20, 50),
                    anchor: new window.naver.maps.Point(10, 10)
                },
                zIndex: 1000
            });

            userMarkerRef.current = userMarker;

            // 마커 클릭 이벤트
            window.naver.maps.Event.addListener(userMarker, 'click', () => {
                console.log('사용자 위치 클릭됨:', userLocation);
            });
        }

    }, [userLocation, showMyLocation]);

    // 경로 표시 업데이트
    useEffect(() => {
        if (!window.naver || !window.naver.maps || !mapInstanceRef.current || !routePath) {
            console.log('경로 표시 조건 확인:', {
                naver: !!window.naver,
                maps: !!(window.naver && window.naver.maps),
                mapInstance: !!mapInstanceRef.current,
                routePath: !!routePath,
                routePathData: routePath
            });
            return;
        }

        console.log('경로 표시 시작:', routePath);
        const map = mapInstanceRef.current;

        // 기존 경로 라인 제거
        if (routeLineRef.current) {
            routeLineRef.current.setMap(null);
            console.log('기존 경로 라인 제거됨');
        }

        // 기존 경로 마커들 제거
        routeMarkersRef.current.forEach(marker => marker.setMap(null));
        routeMarkersRef.current = [];

        // 경로 좌표 배열 생성
        const pathCoords = [
            new window.naver.maps.LatLng(routePath.start.lat, routePath.start.lng),
            new window.naver.maps.LatLng(routePath.end.lat, routePath.end.lng)
        ];

        console.log('경로 좌표:', pathCoords);

        // 경로 라인 생성 (화살표 포함)
        const polyline = new window.naver.maps.Polyline({
            path: pathCoords,
            strokeColor: '#ff6b35',
            strokeWeight: 8,
            strokeOpacity: 1.0,
            strokeStyle: 'solid',
            map: map,
            zIndex: 500
        });

        routeLineRef.current = polyline;
        console.log('경로 라인 생성됨');

        // 화살표 마커들 생성 (경로를 따라 여러 개)
        const arrowMarkers = [];
        const numArrows = 3; // 화살표 개수

        for (let i = 1; i <= numArrows; i++) {
            const ratio = i / (numArrows + 1);
            const lat = routePath.start.lat + (routePath.end.lat - routePath.start.lat) * ratio;
            const lng = routePath.start.lng + (routePath.end.lng - routePath.start.lng) * ratio;

            // 경로 방향 계산
            const angle = Math.atan2(
                routePath.end.lat - routePath.start.lat,
                routePath.end.lng - routePath.start.lng
            ) * 180 / Math.PI;

            const arrowMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(lat, lng),
                map: map,
                zIndex: 1000, // 높은 z-index로 다른 요소들 위에 표시
                icon: {
                    content: `
                        <div style="
                            background: #ff6b35;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 18px;
                            font-weight: bold;
                            transform: rotate(${angle}deg);
                            z-index: 1000;
                        ">
                            ➜
                        </div>
                    `,
                    size: new window.naver.maps.Size(32, 32),
                    anchor: new window.naver.maps.Point(16, 16)
                }
            });

            arrowMarkers.push(arrowMarker);
        }

        // 시작점 마커 (사용자 위치)
        const startMarker = new window.naver.maps.Marker({
            position: pathCoords[0],
            map: map,
            zIndex: 1000,
            icon: {
                content: `
                    <div style="
                        background: #007bff;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: 4px solid white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                        z-index: 1000;
                    ">
                        S
                    </div>
                `,
                size: new window.naver.maps.Size(28, 28),
                anchor: new window.naver.maps.Point(14, 14)
            }
        });

        // 끝점 마커 (목적지)
        const endMarker = new window.naver.maps.Marker({
            position: pathCoords[1],
            map: map,
            zIndex: 1000,
            icon: {
                content: `
                    <div style="
                        background: #dc3545;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: 4px solid white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                        z-index: 1000;
                    ">
                        E
                    </div>
                `,
                size: new window.naver.maps.Size(28, 28),
                anchor: new window.naver.maps.Point(14, 14)
            }
        });

        routeMarkersRef.current = [startMarker, endMarker, ...arrowMarkers];
        console.log('경로 마커들 생성됨:', routeMarkersRef.current.length);

        // 경로가 보이도록 지도 영역 조정
        const bounds = new window.naver.maps.LatLngBounds();
        bounds.extend(pathCoords[0]);
        bounds.extend(pathCoords[1]);
        
        // 경로가 너무 짧으면 확대
        const distance = Math.sqrt(
            Math.pow(routePath.end.lat - routePath.start.lat, 2) + 
            Math.pow(routePath.end.lng - routePath.start.lng, 2)
        );
        
        if (distance < 0.001) { // 매우 짧은 거리일 때
            map.setZoom(18); // 더 확대
            map.setCenter(new window.naver.maps.LatLng(
                (routePath.start.lat + routePath.end.lat) / 2,
                (routePath.start.lng + routePath.end.lng) / 2
            ));
        } else {
            map.fitBounds(bounds, 150); // 150px 패딩으로 더 여유 있게
        }
        
        console.log('지도 영역 조정됨, 거리:', distance);

        return () => {
            if (routeLineRef.current) {
                routeLineRef.current.setMap(null);
            }
            routeMarkersRef.current.forEach(marker => marker.setMap(null));
        };
    }, [routePath]);

    // 지도 클릭 모드에 따른 커서 스타일 변경
    useEffect(() => {
        console.log('mapClickMode 변경됨:', mapClickMode);
        
        if (!mapInstanceRef.current) return;

        const mapElement = document.getElementById('map');
        if (mapElement) {
            const newCursor = mapClickMode ? 'crosshair' : 'grab';
            mapElement.style.cursor = newCursor;
            console.log('지도 커서 변경:', newCursor);
        }
    }, [mapClickMode]);

    // API 키가 없을 때 테스트용 지도 렌더링
    if (!import.meta.env.VITE_NAVER_MAP_CLIENT_ID) {
        return (
            <div 
                id="map" 
                ref={mapRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    cursor: mapClickMode ? 'crosshair' : 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    userSelect: 'none'
                }}
                onClick={handleTestMapClick}
                onMouseDown={(e) => {
                    console.log('마우스 다운 이벤트:', e.type);
                }}
                onMouseUp={(e) => {
                    console.log('마우스 업 이벤트:', e.type);
                }}
            >
                {mapClickMode ? (
                    <div 
                        style={{
                            background: 'rgba(255, 107, 107, 0.9)',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            pointerEvents: 'none' // 이 div가 클릭을 방해하지 않도록
                        }}
                    >
                        🗺️ 테스트 지도<br/>
                        지도를 클릭하여 장소를 추가하세요!<br/>
                        <small>클릭 모드 활성화됨</small>
                    </div>
                ) : (
                    <div 
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            pointerEvents: 'none' // 이 div가 클릭을 방해하지 않도록
                        }}
                    >
                        🗺️ 테스트 지도<br/>
                        "지도에서 장소 추가" 버튼을 클릭하세요<br/>
                        <small>API 키가 없어서 테스트 모드로 실행 중</small>
                    </div>
                )}
                
                {/* 클릭 테스트용 투명 오버레이 */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'transparent',
                        zIndex: 1
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('오버레이 클릭됨!');
                        handleTestMapClick(e);
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
            
            {/* 클릭 모드일 때 투명한 오버레이 추가 */}
            {mapClickMode && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'transparent',
                        cursor: 'crosshair',
                        zIndex: 1000
                    }}
                    onClick={async (e) => {
                        e.stopPropagation();
                        console.log('=== 오버레이 클릭 이벤트 발생 ===');
                        
                        // 지도 좌표로 변환
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // 간단한 좌표 변환 (실제로는 지도 좌표계 사용)
                        const lat = 37.5665 + (y - rect.height / 2) * 0.001;
                        const lng = 126.978 + (x - rect.width / 2) * 0.001;
                        
                        console.log('오버레이 클릭 좌표:', lat, lng);
                        
                        if (onMapClick) {
                            // 주소 변환 시도
                            const address = await getAddressFromCoordinates(lat, lng);
                            onMapClick(lat, lng, address);
                        }
                    }}
                />
            )}
        </div>
    );
});

export default NaverMap;
