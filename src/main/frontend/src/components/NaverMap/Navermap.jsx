import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const NaverMap = forwardRef(({ places = [], categories = [], onMapClick, mapClickMode = false, userLocation = null, routePath = null }, ref) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const userMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const routeMarkersRef = useRef([]);

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
                window.naver.maps.Event.addListener(map, 'click', (e) => {
                    console.log('지도 클릭 이벤트 발생:', e.coord.lat(), e.coord.lng());
                    if (onMapClick) {
                        onMapClick(e.coord.lat(), e.coord.lng());
                    }
                });

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

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(place.lat, place.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            background: ${markerColor};
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 10px;
                            font-weight: bold;
                        ">
                            ${place.name.charAt(0)}
                        </div>
                    `,
                    size: new window.naver.maps.Size(20, 20),
                    anchor: new window.naver.maps.Point(10, 10)
                }
            });

            const infoWindow = new window.naver.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; color: #333;">${place.name}</h4>
                        <p style="margin: 0; color: #666; font-size: 12px;">${place.address}</p>
                        <p style="margin: 5px 0 0 0; color: #007bff; font-size: 12px;">
                            ${category ? category.name : '기타'}
                        </p>
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
        }

        // 새로운 사용자 마커 생성 (빨간 점)
        const userMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
            map: map,
            icon: {
                content: `
                    <div style="
                        background: #ff0000;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    ">
                        <div style="
                            background: #ff0000;
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                        "></div>
                    </div>
                `,
                size: new window.naver.maps.Size(16, 16),
                anchor: new window.naver.maps.Point(8, 8)
            },
            zIndex: 1000
        });

        userMarkerRef.current = userMarker;

        // 마커 클릭 이벤트 (선택사항)
        window.naver.maps.Event.addListener(userMarker, 'click', () => {
            console.log('사용자 위치 클릭됨:', userLocation);
        });

    }, [userLocation]);

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
        if (!mapInstanceRef.current) return;

        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.cursor = mapClickMode ? 'crosshair' : 'grab';
        }
    }, [mapClickMode]);

    return <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />;
});

export default NaverMap;
