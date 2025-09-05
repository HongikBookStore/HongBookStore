// src/components/PlaceDetailModal/PlaceDetailModal.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { AuthCtx } from '../../contexts/AuthContext.jsx';
import {
  FaStar, FaThumbsUp, FaThumbsDown, FaRoute, FaClock, FaMapMarkerAlt,
  FaTimes, FaPlus, FaUpload, FaTrash, FaInfoCircle,
  FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus
} from 'react-icons/fa';

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
const DIRECTIONS_ENDPOINT = '/api/directions/driving';
const SEARCH_ENDPOINT = '/api/places/search';

// ✅ 리뷰 API 엔드포인트
const REVIEW_LIST   = (id) => `/api/places/${id}/reviews`;
const REVIEW_REACT  = (reviewId) => `/api/places/reviews/${reviewId}/reactions`;
const REVIEW_DELETE = (placeId, reviewId) => `/api/places/reviews/${reviewId}`;
const REVIEW_UPLOAD = '/api/reviews/images'; // 리뷰 전용 업로드 엔드포인트

/* ===================== 공통 토스트 ===================== */
function showToast(message) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:rgba(0,0,0,.85);color:#fff;padding:10px 16px;border-radius:10px;
    font-size:14px;z-index:5000;opacity:0;transition:opacity .25s ease;
    box-shadow:0 8px 24px rgba(0,0,0,.25)
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = 1; });
  setTimeout(() => {
    el.style.opacity = 0;
    setTimeout(() => el.remove(), 250);
  }, 2400);
}

/* ===================== 유틸 ===================== */
// 네이버 로컬검색 item에서 위경도 추출 (mapx/mapy는 1e7 스케일된 WGS84)
function extractLatLngFromNaverItem(item) {
  const toNum = (v) => (v == null ? NaN : Number(v));
  let lat = toNum(item.lat), lng = toNum(item.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

  const mapx = toNum(item.mapx ?? item.mapX);
  const mapy = toNum(item.mapy ?? item.mapY);
  if (Number.isFinite(mapx) && Number.isFinite(mapy)) {
    const lngScaled = mapx / 1e7;
    const latScaled = mapy / 1e7;
    if (Math.abs(latScaled) <= 90 && Math.abs(lngScaled) <= 180) {
      return { lat: latScaled, lng: lngScaled };
    }
  }

  const x = toNum(item.x), y = toNum(item.y);
  if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(y) <= 90 && Math.abs(x) <= 180) {
    return { lat: y, lng: x };
  }
  return null;
}

const PlaceDetailModal = ({ place, isOpen, onClose, userCategories, onAddToCategory, userLocation }) => {
  const { user } = useContext(AuthCtx);
  const currentUserId =
      (user && user.id) || (JSON.parse(localStorage.getItem('user') || '{}').id) || null;

  const [activeTab, setActiveTab] = useState('info');

  // ✅ 리뷰 상태
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', photos: [] });
  const [reviewError, setReviewError] = useState('');

  // 카테고리
  const [selectedCategory, setSelectedCategory] = useState('');

  // 경로
  const [routeSummary, setRouteSummary] = useState(null);
  const fileInputRef = useRef(null);

  // 지도 refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // 출발지 검색
  const [startPoint, setStartPoint] = useState(null);
  const [startQuery, setStartQuery] = useState('');
  const [startResults, setStartResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [startLabel, setStartLabel] = useState('');

  // ✅ 라이트박스
  const [lbOpen, setLbOpen] = useState(false);
  const [lbImages, setLbImages] = useState([]);
  const [lbIndex, setLbIndex] = useState(0);

  const openLightbox = (images, startIndex = 0) => {
    if (!images || images.length === 0) return;
    setLbImages(images);
    setLbIndex(Math.min(Math.max(0, startIndex), images.length - 1));
    setLbOpen(true);
  };
  const closeLightbox = () => setLbOpen(false);
  const prevLightbox  = () => setLbIndex(i => (i - 1 + lbImages.length) % lbImages.length);
  const nextLightbox  = () => setLbIndex(i => (i + 1) % lbImages.length);

  if (!isOpen || !place) return null;

  /* ===================== 평균/카운트 ===================== */
  const clientAvg = reviews.length > 0
      ? Number((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1))
      : 0;

  const averageRating = (typeof avgRating === 'number' ? avgRating : clientAvg);
  const totalReviews  = (typeof reviewCount === 'number' ? reviewCount : reviews.length);

  /* ===================== API ===================== */
  // 리뷰 목록
  const fetchReviews = async () => {
    if (!place?.id) return;
    try {
      const res = await fetch(REVIEW_LIST(place.id), {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
      });
      if (!res.ok) throw new Error('리뷰 조회 실패');
      const data = await res.json();
      setAvgRating(typeof data.averageRating === 'number' ? data.averageRating : null);
      setReviewCount(typeof data.reviewCount === 'number' ? data.reviewCount : 0);
      const mapped = (data.reviews || []).map(r => ({
        id: r.id,
        userId: r.userId ?? r.user_id,
        userName: r.userName ?? r.username,
        rating: r.rating,
        content: r.content,
        likes: r.likes,
        dislikes: r.dislikes,
        photos: (r.photos || []).map(p => p.url)
      }));
      setReviews(mapped);
      setShowAllReviews(false);
    } catch (e) {
      console.error(e);
    }
  };

  // 사진 업로드(엔드포인트 없으면 무시)
  async function uploadReviewPhotos(files) {
    if (!files || files.length === 0) return [];
    try {
      const form = new FormData();
      for (const f of files) form.append('files', f);
      const res = await fetch(REVIEW_UPLOAD, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
        body: form
      });
      if (!res.ok) throw new Error('upload endpoint not available');
      const data = await res.json(); // { urls: [...] }
      return data.urls || [];
    } catch {
      console.warn('사진 업로드 실패 또는 엔드포인트 없음 → 사진 없이 진행');
      return [];
    }
  }

  // ✅ 리뷰 등록 (409 → 토스트)
  const handleSubmitReview = async () => {
    if (!newReview.content.trim()) return showToast('리뷰 내용을 입력해주세요.');

    try {
      setReviewError('');
      const fileInput = fileInputRef.current;
      const files = fileInput?.files ? Array.from(fileInput.files) : [];
      const photoUrls = await uploadReviewPhotos(files);

      const res = await fetch(REVIEW_LIST(place.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          content: newReview.content,
          photoUrls
        })
      });

      if (!res.ok) {
        if (res.status === 409) {
          setReviewError('이미 이 장소에 리뷰를 작성하셨습니다. 기존 리뷰를 삭제 후 다시 등록해주세요.');
          showToast('이미 작성된 리뷰가 있어요. 삭제 후 재등록해주세요.');
          return;
        }
        const ct = res.headers.get('content-type') || '';
        if (res.status === 400 && ct.includes('application/json')) {
          const json = await res.json().catch(() => null);
          if (json?.success === false && json?.data?.field) {
            const d = json.data;
            const lvl = d.predictionLevel ? ` (${d.predictionLevel}${typeof d.malicious === 'number' ? `, ${Math.round(d.malicious*100)}%` : ''})` : '';
            setReviewError((json.message || '부적절한 표현이 감지되었습니다.') + lvl);
            const el = document.querySelector('textarea');
            if (el && typeof el.focus === 'function') el.focus();
            return;
          }
        }
        showToast('리뷰 등록에 실패했습니다.');
        return;
      }

      setNewReview({ rating: 5, content: '', photos: [] });
      if (fileInput) fileInput.value = '';
      await fetchReviews();
      showToast('리뷰가 등록되었습니다.');
    } catch (e) {
      console.error(e);
      showToast('리뷰 등록에 실패했습니다.');
    }
  };

  // ✅ 리뷰 삭제 (상태코드별 안내)
  const handleDeleteReview = async (reviewId) => {
    if (!currentUserId) return showToast('로그인이 필요합니다.');
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(REVIEW_DELETE(place.id, reviewId), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
      });

      if (res.status === 204) {
        await fetchReviews();
        return showToast('리뷰를 삭제했습니다.');
      }

      // 상태 코드별 메시지
      if (res.status === 401) return showToast('로그인이 필요합니다.');
      if (res.status === 403) return showToast('본인 리뷰만 삭제할 수 있어요.');
      if (res.status === 404) return showToast('리뷰를 찾을 수 없습니다.');
      if (res.status === 409) return showToast('삭제할 수 없는 상태입니다.');
      // 프록시 미설정 등으로 404/NoResourceFound가 날아오는 경우도 있으니 안내
      if (res.status === 500) return showToast('서버 오류로 삭제에 실패했습니다.');

      showToast('리뷰 삭제에 실패했습니다.');
    } catch (e) {
      console.error(e);
      showToast('리뷰 삭제에 실패했습니다.');
    }
  };

  /* ===================== 프론트 미리보기용 사진 ===================== */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewReview(p => ({ ...p, photos: [...p.photos, ...files.map(f => URL.createObjectURL(f))] }));
  };
  const handleRemovePhoto = (idx) =>
      setNewReview(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }));

  /* ===================== 좋아요/싫어요 ===================== */
  const handleLikeReview = async (id) => {
    try {
      await fetch(REVIEW_REACT(id) + '?type=LIKE', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
      });
      await fetchReviews();
    } catch (e) { console.error(e); }
  };
  const handleDislikeReview = async (id) => {
    try {
      await fetch(REVIEW_REACT(id) + '?type=DISLIKE', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
      });
      await fetchReviews();
    } catch (e) { console.error(e); }
  };

  const getTypeName = (type) =>
      ({ restaurant: '음식점', cafe: '카페', partner: '제휴업체', convenience: '편의점', other: '기타' }[type] || '기타');
  const stripTags = (s) => (s || '').replace(/<[^>]+>/g, '');

  /* ===================== 네이버 지도 로더 ===================== */
  const loadNaverMapScript = () =>
      new Promise((resolve, reject) => {
        if (window.naver?.maps) return resolve();
        let s = document.getElementById('naver-map-script');
        if (s) {
          s.addEventListener('load', resolve, { once: true });
          s.addEventListener('error', reject, { once: true });
          return;
        }
        s = document.createElement('script');
        s.id = 'naver-map-script';
        s.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
        s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

  /* ===================== 지도 초기화/경로 ===================== */
  useEffect(() => {
    const init = async () => {
      try {
        await loadNaverMapScript();
        if (!mapRef.current || !place) return;
        const { naver } = window;

        const center = new naver.maps.LatLng(Number(place.lat), Number(place.lng));
        const needRecreate =
            !mapInstanceRef.current ||
            mapInstanceRef.current.getElement?.() !== mapRef.current;

        if (needRecreate) {
          mapInstanceRef.current = new naver.maps.Map(mapRef.current, {
            center, zoom: 16, minZoom: 6, mapDataControl: false, logoControl: false, scaleControl: true,
          });
        } else {
          mapInstanceRef.current.setCenter(center);
        }

        markersRef.current.forEach(m => m.setMap?.(null));
        markersRef.current = [];
        if (polylineRef.current) { polylineRef.current.setMap?.(null); polylineRef.current = null; }

        const destMarker = new naver.maps.Marker({ position: center, map: mapInstanceRef.current, title: place.name });
        markersRef.current.push(destMarker);

        setTimeout(() => {
          const el = mapRef.current;
          if (!el || !mapInstanceRef.current) return;
          mapInstanceRef.current.setSize?.(new naver.maps.Size(el.clientWidth, el.clientHeight));
          if (userLocation?.lat && userLocation?.lng) {
            const b = new naver.maps.LatLngBounds();
            b.extend(center);
            b.extend(new naver.maps.LatLng(Number(userLocation.lat), Number(userLocation.lng)));
            mapInstanceRef.current.fitBounds(b);
          }
        }, 0);
      } catch (e) {
        console.error('네이버 지도 로드 실패:', e);
      }
    };
    if (isOpen && activeTab === 'route') init();
  }, [isOpen, activeTab, place, userLocation]);

  useEffect(() => {
    if (!(isOpen && activeTab === 'route')) return;
    if (!window.naver?.maps || !mapInstanceRef.current) return;

    const { naver } = window;
    const map = mapInstanceRef.current;

    const drawRoute = async () => {
      markersRef.current.forEach(m => m.setMap?.(null));
      markersRef.current = [];
      if (polylineRef.current) { polylineRef.current.setMap?.(null); polylineRef.current = null; }

      const dest = new naver.maps.LatLng(place.lat, place.lng);
      const destMarker = new naver.maps.Marker({ position: dest, map, title: place.name });
      markersRef.current.push(destMarker);

      if (startPoint?.lat && startPoint?.lng) {
        const start = new naver.maps.LatLng(startPoint.lat, startPoint.lng);
        const startMarker = new naver.maps.Marker({ position: start, map, title: '출발지' });
        markersRef.current.push(startMarker);

        try {
          const startParam = `${start.lng()},${start.lat()}`;
          const goalParam  = `${dest.lng()},${dest.lat()}`;
          const res = await fetch(`${DIRECTIONS_ENDPOINT}?start=${encodeURIComponent(startParam)}&goal=${encodeURIComponent(goalParam)}&option=traoptimal`);
          if (!res.ok) throw new Error('경로 조회 실패');
          const body = await res.json();

          const track = body?.route?.traoptimal?.[0];
          const naverPath = track?.path || [];
          const pathLatLngs = naverPath.map(([x, y]) => new naver.maps.LatLng(y, x));

          polylineRef.current = new naver.maps.Polyline({
            path: pathLatLngs, map, strokeWeight: 5, strokeOpacity: 0.9, strokeColor: '#1e6fff', strokeStyle: 'solid'
          });

          if (track?.summary) setRouteSummary({ distance: track.summary.distance, duration: track.summary.duration });

          const bounds = new naver.maps.LatLngBounds();
          pathLatLngs.forEach(ll => bounds.extend(ll));
          map.fitBounds(bounds);
        } catch (err) {
          console.error(err);
        }
      } else {
        map.setCenter(dest);
        map.setZoom(16);
      }
    };

    drawRoute();
  }, [startPoint, isOpen, activeTab, place]);

  /* ===================== 출발지 검색 ===================== */
  const searchStartPlaces = async () => {
    const q = startQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${SEARCH_ENDPOINT}?query=${encodeURIComponent(q)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      setStartResults(items);
    } catch (e) {
      console.error('출발지 검색 실패:', e);
      showToast('검색에 실패했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const pickStartFromResult = (item) => {
    const ll = extractLatLngFromNaverItem(item);
    if (!ll) return showToast('이 결과에서 좌표를 읽을 수 없습니다.');

    setStartPoint(ll);

    const title = (item.title || item.name || '').replace(/<[^>]+>/g, '');
    const addr  = (item.roadAddress || item.address || item.addr || '').replace(/<[^>]+>/g, '');
    setStartLabel(addr ? `${title} · ${addr}` : title);
  };

  const maskUserName = (name) => {
    if (!name) return '익명';
    const trimmed = String(name).trim();
    if (trimmed.length === 0) return '익명';
    return trimmed[0] + '**';
  };

  // ✅ 모달 열릴 때 리뷰 불러오기
  useEffect(() => {
    if (!isOpen || !place?.id) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, place?.id]);

  /* ===================== UI ===================== */
  return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <PlaceInfo>
              <PlaceIcon>{({ restaurant: '🍽️', cafe: '☕', partner: '🤝', convenience: '🛍️', other: '📍' }[place.category] || '📍')}</PlaceIcon>
              <PlaceDetails>
                <PlaceName>{place.name}</PlaceName>
                <PlaceType>{getTypeName(place.category)}</PlaceType>
                <PlaceRating>
                  <Stars>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} $isFilled={star <= Number(averageRating)}><FaStar /></Star>
                    ))}
                  </Stars>
                  <RatingText>{Number(averageRating || 0).toFixed(1)} ({Number(totalReviews || 0)}개 리뷰)</RatingText>
                </PlaceRating>
              </PlaceDetails>
            </PlaceInfo>
            <CloseButton onClick={onClose}><FaTimes /></CloseButton>
          </ModalHeader>

          <TabContainer>
            <TabButton $isActive={activeTab === 'info'} onClick={() => setActiveTab('info')}>정보</TabButton>
            <TabButton $isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>리뷰</TabButton>
            <TabButton $isActive={activeTab === 'route'} onClick={() => setActiveTab('route')}>경로</TabButton>
          </TabContainer>

          <ModalBody>
            {activeTab === 'info' && (
                <InfoTab>
                  <InfoSection>
                    <InfoTitle><FaMapMarkerAlt /> 주소</InfoTitle>
                    <InfoContent><FaMapMarkerAlt /> {place.address}</InfoContent>
                  </InfoSection>

                  {place.description && (
                      <InfoSection>
                        <InfoTitle><FaInfoCircle /> 설명</InfoTitle>
                        <InfoContent>{place.description}</InfoContent>
                      </InfoSection>
                  )}

                  <InfoSection>
                    <InfoTitle><FaPlus /> 내 카테고리에 추가</InfoTitle>
                    <CategorySelectContainer>
                      <CategorySelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">카테고리 선택</option>
                        {userCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </CategorySelect>
                      <AddToCategoryButton onClick={() => {
                        if (selectedCategory) {
                          onAddToCategory(place.id, selectedCategory);
                          setSelectedCategory('');
                          showToast('카테고리에 추가했습니다.');
                        }
                      }}>
                        <FaPlus />
                      </AddToCategoryButton>
                    </CategorySelectContainer>
                  </InfoSection>
                </InfoTab>
            )}

            {activeTab === 'reviews' && (
                <ReviewsTab>
                  <ReviewForm>
                    <ReviewFormTitle>리뷰 작성</ReviewFormTitle>
                    <RatingContainer>
                      {[1, 2, 3, 4, 5].map(star => (
                          <StarButton
                              key={star}
                              $isSelected={newReview.rating >= star}
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            <FaStar />
                          </StarButton>
                      ))}
                    </RatingContainer>
                    <ReviewTextarea
                        placeholder="리뷰를 작성해주세요..."
                        value={newReview.content}
                        onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    />
                    {reviewError && (
                        <div style={{ color:'#dc3545', fontSize:'.9rem', marginTop: 6 }}>{reviewError}</div>
                    )}

                    <PhotoUploadSection>
                      <PhotoUploadTitle>사진 추가</PhotoUploadTitle>
                      <PhotoUploadArea onClick={() => fileInputRef.current?.click()}>
                        <FaUpload /><span>사진을 선택하거나 클릭하여 업로드</span>
                      </PhotoUploadArea>
                      <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                      />
                      {newReview.photos.length > 0 && (
                          <PhotoPreviewContainer>
                            {newReview.photos.map((photo, index) => (
                                <PhotoPreview key={index}>
                                  <PhotoPreviewImage src={photo} alt="업로드된 사진" />
                                  <RemovePhotoButton onClick={() => handleRemovePhoto(index)}><FaTrash /></RemovePhotoButton>
                                </PhotoPreview>
                            ))}
                          </PhotoPreviewContainer>
                      )}
                    </PhotoUploadSection>

                    <ReviewSubmitButton onClick={handleSubmitReview}>리뷰 등록</ReviewSubmitButton>
                  </ReviewForm>

                  <ReviewsList>
                    <ReviewsHeader>
                      <ReviewsTitle>리뷰 ({Number(totalReviews || 0)})</ReviewsTitle>
                      {reviews.length > 3 && (
                          <ShowMoreButton onClick={() => setShowAllReviews(!showAllReviews)}>
                            {showAllReviews ? '접기' : '더보기'}
                          </ShowMoreButton>
                      )}
                    </ReviewsHeader>

                    {reviews.slice(0, showAllReviews ? undefined : 3).map((review, index) => (
                        <ReviewItem key={review.id || index}>
                          <ReviewHeader>
                            <ReviewerInfo>
                              <ReviewerName>{maskUserName(review.userName)}</ReviewerName>
                              <ReviewRating>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} $isFilled={i < review.rating}><FaStar /></Star>
                                ))}
                              </ReviewRating>
                            </ReviewerInfo>

                            <ReviewActions>
                              <ActionButton onClick={() => handleLikeReview(review.id)}>
                                <FaThumbsUp /> {review.likes || 0}
                              </ActionButton>
                              <ActionButton onClick={() => handleDislikeReview(review.id)}>
                                <FaThumbsDown /> {review.dislikes || 0}
                              </ActionButton>

                              {(currentUserId && review.userId === currentUserId) && (
                                  <DeleteBtn title="내 리뷰 삭제" onClick={() => handleDeleteReview(review.id)}>
                                    <FaTrash />
                                  </DeleteBtn>
                              )}
                            </ReviewActions>
                          </ReviewHeader>

                          <ReviewContent>
                            {expandedReview === review.id ? (
                                <>
                                  {review.content}
                                  <CollapseButton onClick={() => setExpandedReview(null)}>접기</CollapseButton>
                                </>
                            ) : (
                                <>
                                  {review.content.slice(0, 100)}
                                  {review.content.length > 100 && (
                                      <ExpandButton onClick={() => setExpandedReview(review.id)}>...더보기</ExpandButton>
                                  )}
                                </>
                            )}
                          </ReviewContent>

                          {review.photos && review.photos.length > 0 && (
                              <ReviewPhotos>
                                {review.photos.map((photo, i) => (
                                    <ReviewPhoto
                                        key={i}
                                        src={photo}
                                        alt="리뷰 사진"
                                        onClick={() => openLightbox(review.photos, i)}
                                        title="클릭하면 크게 보기"
                                    />
                                ))}
                              </ReviewPhotos>
                          )}
                        </ReviewItem>
                    ))}
                  </ReviewsList>
                </ReviewsTab>
            )}

            {activeTab === 'route' && (
                <RouteTab>
                  <RouteInfo>
                    <RouteTitle>경로 안내</RouteTitle>
                    <RouteDetails>
                      <RouteItem><FaMapMarkerAlt /><span>출발지: {startLabel || '미설정 (아래에서 검색)'}</span></RouteItem>
                      <RouteItem><FaMapMarkerAlt /><span>도착지: {place.name}</span></RouteItem>
                      <RouteItem><FaClock /><span>상태: {(() => {
                        if (!startPoint) return '출발지를 검색해서 선택하세요';
                        if (routeSummary) {
                          const mins = Math.round(routeSummary.duration / 60000);
                          const km = (routeSummary.distance / 1000).toFixed(1);
                          return `예상 ${mins}분 · ${km} km`;
                        }
                        // 대략치
                        const dx = place.lng - startPoint.lng;
                        const dy = place.lat - startPoint.lat;
                        const avgLat = (place.lat + startPoint.lat) / 2;
                        const meterPerDegLon = 111320 * Math.cos(avgLat * Math.PI / 180);
                        const meterPerDegLat = 110540;
                        const distanceMeters = Math.sqrt((dx * meterPerDegLon) ** 2 + (dy * meterPerDegLat) ** 2);
                        const distanceKm = distanceMeters / 1000;
                        const HUMAN_WALK_SPEED_KMH = 3;
                        const estMin = Math.round(distanceKm / (HUMAN_WALK_SPEED_KMH * 0.8) * 60);
                        return `예상 약 ${estMin}분 (2.4 km/h 보행 기준)`;
                      })()}</span></RouteItem>
                    </RouteDetails>

                    <SearchRow>
                      <label>출발지 검색</label>
                      <SearchControls>
                        <SearchInput
                            value={startQuery}
                            onChange={(e) => setStartQuery(e.target.value)}
                            placeholder="예) 홍대입구역 2번출구, 스타벅스 상수역"
                            onKeyDown={(e) => { if (e.key === 'Enter') searchStartPlaces(); }}
                        />
                        <SearchBtn onClick={searchStartPlaces} disabled={searching}>
                          {searching ? '검색 중...' : '검색'}
                        </SearchBtn>
                      </SearchControls>
                    </SearchRow>

                    {startResults.length > 0 && (
                        <ResultsList>
                          {startResults.slice(0, 10).map((r, idx) => (
                              <ResultItem
                                  key={r.id ?? `${r.mapx ?? r.x}-${r.mapy ?? r.y}-${idx}`}
                                  onClick={() => pickStartFromResult(r)}
                              >
                                <ResultTitle>{(r.title || r.name || '').replace(/<[^>]+>/g, '')}</ResultTitle>
                                <ResultAddr>{(r.roadAddress || r.address || r.addr || '').replace(/<[^>]+>/g, '')}</ResultAddr>
                              </ResultItem>
                          ))}
                        </ResultsList>
                    )}
                  </RouteInfo>

                  <RouteMap>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                  </RouteMap>
                </RouteTab>
            )}
          </ModalBody>
        </ModalContent>

        {/* ✅ 리뷰 이미지 라이트박스 */}
        {lbOpen && (
            <Lightbox
                images={lbImages}
                index={lbIndex}
                onClose={closeLightbox}
                onPrev={prevLightbox}
                onNext={nextLightbox}
            />
        )}
      </ModalOverlay>
  );
};

/* ===================== styled components ===================== */

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
`;

const ModalContent = styled.div`
  background: white; border-radius: 16px;
  width: 100%; max-width: 700px; max-height: 85vh;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 24px 0 24px; border-bottom: 1px solid #f0f0f0;
`;

const PlaceInfo = styled.div`
  display: flex; align-items: center; gap: 16px; flex: 1;
`;

const PlaceIcon = styled.span`
  font-size: 40px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
  background: #f8f9fa; border-radius: 12px;
`;

const PlaceDetails = styled.div` flex: 1; `;
const PlaceName = styled.h2`
  margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #1a1a1a; line-height: 1.2;
`;
const PlaceType = styled.span`
  color: #666; font-size: 14px; display: block; margin-bottom: 8px; font-weight: 500;
`;

const PlaceRating = styled.div` display: flex; align-items: center; gap: 10px; `;
const Stars = styled.div` display: flex; gap: 2px; `;
const Star = styled.span` color: ${p => p.$isFilled ? '#ffc107' : '#e0e0e0'}; font-size: 16px; `;
const RatingText = styled.span` color: #666; font-size: 13px; font-weight: 500; `;

const CloseButton = styled.button`
  background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 8px; border-radius: 8px;
  transition: all .2s ease;
  &:hover { color: #333; background: #f8f9fa; }
`;

const TabContainer = styled.div`
  display: flex; border-bottom: 1px solid #f0f0f0; background: #fafafa;
`;
const TabButton = styled.button`
  flex: 1; padding: 16px 20px; background: ${p => p.$isActive ? 'white' : 'transparent'};
  color: ${p => p.$isActive ? '#007bff' : '#666'}; border: none; cursor: pointer; font-weight: 600; font-size: 14px;
  transition: all .2s ease; position: relative;
  &:hover { background: ${p => p.$isActive ? 'white' : '#f0f0f0'}; }
  ${p => p.$isActive && `
    &::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:#007bff;}
  `}
`;

const ModalBody = styled.div` flex: 1; overflow-y: auto; padding: 24px; `;
const InfoTab = styled.div``;

const InfoSection = styled.div`
  margin-bottom: 24px; padding: 20px; background: #fafafa;
  border-radius: 12px; border: 1px solid #f0f0f0;
`;
const InfoTitle = styled.h4`
  margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333;
  display: flex; align-items: center; gap: 8px;
`;
const InfoContent = styled.div` color: #555; display: flex; align-items: center; gap: 10px; font-size: 14px; line-height: 1.5; `;

const CategorySelectContainer = styled.div` display: flex; gap: 12px; align-items: center; `;
const CategorySelect = styled.select`
  flex: 1; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: white;
  transition: border-color .2s ease;
  &:focus { outline: none; border-color: #007bff; }
`;
const AddToCategoryButton = styled.button`
  padding: 12px 16px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;
  transition: background .2s ease; &:hover { background: #0056b3; }
`;

const ReviewsTab = styled.div``;

const ReviewForm = styled.div`
  margin-bottom: 24px; padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px; border: 1px solid #e9ecef;
`;
const ReviewFormTitle = styled.h4` margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #333; `;
const RatingContainer = styled.div` display: flex; gap: 6px; margin-bottom: 16px; `;
const StarButton = styled.button`
  background: none; border: none; font-size: 24px; color: ${p => p.$isSelected ? '#ffc107' : '#ddd'};
  cursor: pointer; transition: all .2s ease; &:hover { color: #ffc107; transform: scale(1.1); }
`;

const ReviewTextarea = styled.textarea`
  width: 100%; padding: 16px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; min-height: 100px; resize: vertical;
  margin-bottom: 16px; font-family: inherit; transition: border-color .2s ease;
  &:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1); }
`;

const PhotoUploadSection = styled.div` margin-bottom: 16px; `;
const PhotoUploadTitle = styled.div` font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #333; `;
const PhotoUploadArea = styled.div`
  border: 2px dashed #ddd; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; color: #666;
  display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all .2s ease;
  &:hover { border-color: #007bff; color: #007bff; background: rgba(0,123,255,.05); }
`;
const PhotoPreviewContainer = styled.div` display: flex; gap: 12px; margin-top: 12px; overflow-x: auto; padding: 4px; `;
const PhotoPreview = styled.div` position: relative; flex-shrink: 0; `;
const PhotoPreviewImage = styled.img` width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 2px solid #f0f0f0; `;
const RemovePhotoButton = styled.button`
  position: absolute; top: -6px; right: -6px; background: #dc3545; color: #fff; border: none; border-radius: 50%;
  width: 24px; height: 24px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .2s ease; &:hover { background: #c82333; }
`;

const ReviewSubmitButton = styled.button`
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all .2s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3); }
`;

const ReviewsList = styled.div``;
const ReviewsHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;
`;
const ReviewsTitle = styled.h4` margin: 0; font-size: 18px; font-weight: 600; color: #333; `;
const ShowMoreButton = styled.button`
  background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; font-weight: 500;
  padding: 8px 16px; border-radius: 8px; transition: all .2s ease;
  &:hover { background: rgba(0,123,255,.1); text-decoration: none; }
`;

const ReviewItem = styled.div`
  padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; margin-bottom: 16px; background: #fff; transition: all .2s ease;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); transform: translateY(-1px); }
`;
const ReviewHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; `;
const ReviewerInfo = styled.div``;
const ReviewerName = styled.div` font-weight: 600; margin-bottom: 6px; color: #333; font-size: 14px; `;
const ReviewRating = styled.div` display: flex; gap: 2px; `;

const ReviewActions = styled.div` display: flex; gap: 12px; `;
const ActionButton = styled.button`
  background: none; border: 1px solid #e0e0e0; color: #666; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; transition: all .2s ease;
  &:hover { color: #333; border-color: #ccc; background: #f8f9fa; }
`;
const DeleteBtn = styled.button`
  background: none; border: 1px solid #f0f0f0; color: #c0392b; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 20px; transition: all .2s ease;
  &:hover { background: #fff5f5; border-color: #e6b0aa; }
`;

const ReviewContent = styled.div` color: #333; line-height: 1.6; margin-bottom: 12px; font-size: 14px; `;
const ExpandButton = styled.button`
  background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; font-weight: 500;
  padding: 4px 8px; border-radius: 4px; transition: all .2s ease;
  &:hover { background: rgba(0,123,255,.1); text-decoration: none; }
`;
const CollapseButton = styled(ExpandButton)` margin-left: 8px; `;

const ReviewPhotos = styled.div` display: flex; gap: 12px; overflow-x: auto; padding: 4px; `;
const ReviewPhoto = styled.img`
  width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 2px solid #f0f0f0; transition: transform .2s ease; cursor: zoom-in;
  &:hover { transform: scale(1.05); }
`;

const RouteTab = styled.div``;
const RouteInfo = styled.div`
  margin-bottom: 24px; padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px; border: 1px solid #e9ecef;
`;
const RouteTitle = styled.h4` margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #333; `;
const RouteDetails = styled.div` display: flex; flex-direction: column; gap: 12px; `;
const RouteItem = styled.div` display: flex; align-items: center; gap: 12px; color: #555; font-size: 14px; padding: 8px 0; `;
const RouteMap = styled.div` height: 300px; border: 1px solid #f0f0f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #fafafa; `;

const SearchRow = styled.div` display: grid; grid-template-columns: 110px 1fr; gap: 8px; align-items: center; margin-top: 12px; `;
const SearchControls = styled.div` display: flex; gap: 8px; `;
const SearchInput = styled.input`
  flex: 1; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;
  &:focus { outline: none; border-color: #007bff; }
`;
const SearchBtn = styled.button`
  padding: 10px 14px; background: #007bff; color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
  &:disabled { opacity: .6; cursor: default; } &:hover:not(:disabled) { background: #0056b3; }
`;

const ResultsList = styled.div` margin-top: 10px; max-height: 220px; overflow: auto; border: 1px solid #eee; border-radius: 10px; background: #fff; `;
const ResultItem = styled.button`
  width: 100%; text-align: left; background: #fff; border: none; border-bottom: 1px solid #f3f3f3; padding: 10px 12px; cursor: pointer;
  &:hover { background: #f8faff; } &:last-child { border-bottom: none; }
`;
const ResultTitle = styled.div` font-weight: 600; color: #222; font-size: 14px; `;
const ResultAddr = styled.div` color: #666; font-size: 12px; margin-top: 2px; `;

/* ===================== Lightbox ===================== */
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [last, setLast] = useState({ x: 0, y: 0 });

  useEffect(() => { setScale(1); setOffset({ x: 0, y: 0 }); setDragging(false); }, [index]);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.15;
    setScale((s) => {
      const next = Math.min(5, Math.max(1, +(s + delta).toFixed(2)));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const onMouseDown = (e) => { if (scale !== 1) { setDragging(true); setLast({ x: e.clientX, y: e.clientY }); } };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x; const dy = e.clientY - last.y;
    setLast({ x: e.clientX, y: e.clientY });
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onMouseUp = () => setDragging(false);
  const onMouseLeave = () => setDragging(false);

  const zoomIn  = () => setScale((s) => Math.min(5, +(s + 0.5).toFixed(2)));
  const zoomOut = () => setScale((s) => { const next = Math.max(1, +(s - 0.5).toFixed(2)); if (next === 1) setOffset({ x: 0, y: 0 }); return next; });
  const reset   = () => { setScale(1); setOffset({ x: 0, y: 0 }); };
  const dblClick = () => { if (scale === 1) setScale(2); else reset(); };

  if (!images || images.length === 0) return null;

  return (
      <LightboxOverlay onClick={onClose}>
        <LBStage
            onClick={(e) => e.stopPropagation()}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            $dragging={dragging}
        >
          <LBImageWrapper>
            <LBImage
                src={images[index]}
                alt=""
                draggable={false}
                onDoubleClick={dblClick}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                }}
            />
          </LBImageWrapper>

          <LBControls>
            <LBButton onClick={onPrev} aria-label="이전"><FaChevronLeft /></LBButton>
            <LBButton onClick={zoomOut} aria-label="축소"><FaSearchMinus /></LBButton>
            <LBButton onClick={reset} aria-label="원래 크기">1x</LBButton>
            <LBButton onClick={zoomIn} aria-label="확대"><FaSearchPlus /></LBButton>
            <LBButton onClick={onNext} aria-label="다음"><FaChevronRight /></LBButton>
            <LBClose onClick={onClose} aria-label="닫기"><FaTimes /></LBClose>
          </LBControls>

          {images.length > 1 && (
              <LBPager>{index + 1} / {images.length}</LBPager>
          )}
        </LBStage>
      </LightboxOverlay>
  );
};

const LightboxOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 3000;
  display: flex; align-items: center; justify-content: center;
`;
const LBStage = styled.div`
  position: relative; width: 92vw; height: 86vh; background: #111; border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(255,255,255,.1); user-select: none; cursor: ${p => p.$dragging ? 'grabbing' : 'default'};
`;
const LBImageWrapper = styled.div` position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; `;
const LBImage = styled.img` max-width: 90%; max-height: 85%; transform-origin: center center; transition: transform .04s linear; will-change: transform; `;
const LBControls = styled.div`
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 10px; background: rgba(0,0,0,.4); padding: 8px 10px; border-radius: 999px; align-items: center;
`;
const LBButton = styled.button`
  border: none; background: rgba(255,255,255,.12); color: #fff; width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center; font-size: 18px; cursor: pointer; transition: background .15s ease;
  &:hover { background: rgba(255,255,255,.22); }
`;
const LBClose = styled(LBButton)` margin-left: 4px; width: 46px; height: 46px; font-size: 20px; `;
const LBPager = styled.div`
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  color: #fff; background: rgba(0,0,0,.35); padding: 6px 12px; border-radius: 999px; font-size: 13px;
`;

export default PlaceDetailModal;
