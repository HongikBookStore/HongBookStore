import React, { useEffect } from 'react';

const NaverMap = () => {
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
            } else {
                console.error('window.naver.maps가 존재하지 않음 ❌');
            }
        };

        script.onerror = () => {
            console.error('네이버 지도 스크립트 로드 실패 ❌');
        };
    }, []);

    return (
        <div id="map" style={{ width: '100%', height: '500px' }}></div>
    );
};

export default NaverMap;
