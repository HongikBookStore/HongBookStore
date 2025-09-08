// src/pages/PostDetail/PostDetail.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaHeart, FaShare, FaMapMarkerAlt, FaUser, FaCalendar, FaEye, FaArrowLeft, FaPhone, FaComment, FaStar, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthCtx } from '../../contexts/AuthContext';
import { createPeerReview } from '../../api/peerReviews';
import axios from 'axios';

const DetailContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  padding-top: 96px;
  background: #f8f9fa;
  min-height: 100vh;
  @media (max-width: 900px) {
    padding-top: 72px;
    padding: 1rem;
  }
  @media (max-width: 600px) {
    padding-top: 56px;
    padding: 0.5rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background: #5a6268;
  }
`;

const PostDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImage = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: #eee;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
`;

const MainImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Thumbnail = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? '#007bff' : 'transparent'};
  overflow: hidden;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BookTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/* 👉 제목 우측 액션 컨테이너 */
const TitleActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    gap: 0.4rem;
  }
`;

const BookAuthor = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const PriceSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const PriceLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #007bff;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const DiscountRate = styled.div`
  font-size: 1rem;
  color: #e74c3c;
  font-weight: 600;
`;

const OverallConditionSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const OverallConditionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const OverallConditionBadge = styled.div`
  background: ${props => props.$bgColor};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

const OverallConditionDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ConditionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConditionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const ConditionItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const ConditionLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const ConditionValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    if (props.value === '상') return '#28a745';
    if (props.value === '중') return '#ffc107';
    return '#dc3545';
  }};
`;

const BookInfoSection = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 1rem 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const SellerSection = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem;
`;

const SellerTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SellerAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerDetails = styled.div`
  flex: 1;
`;

const SellerName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const SellerLocation = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.1rem;
`;

const Star = styled(FaStar)`
  color: ${props => props.filled ? '#ffc107' : '#e0e0e0'};
  font-size: 0.9rem;
`;

const RatingText = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const SalesCount = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ViewOtherBooksButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }
`;

const ReportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #fff5f5;
  color: #dc2626;
  border: 2px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  transition: all 0.2s;
  &:hover{ background:#dc2626; color:#fff; border-color:#dc2626; transform: translateY(-1px); }
`;

const OtherBooksSection = styled.div`
  margin-top: 2rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--surface);
`;

const OtherBooksTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--text);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 1rem;

  h2 {
    color: #dc3545;
    margin: 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: #0056b3;
    }
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ChatButton = styled(ActionButton)`
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

const CallButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }
`;

const LikeButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.liked ? '#ff4757' : '#666'};
  font-size: 1.2rem;

  &:hover {
    background: white;
    transform: scale(1.1);
    border-color: #ff4757;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const OtherBooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const OtherBookCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
  }
`;

const OtherBookImage = styled.div`
  width: 100%;
  height: 120px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.5rem;
`;

const OtherBookTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.3rem;
  line-height: 1.3;
`;

const OtherBookPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const OtherBookCondition = styled.div`
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-block;
`;

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 백엔드 Enum(HIGH, MEDIUM, LOW)을 프론트엔드 텍스트(상, 중, 하)로 변환하는 헬퍼
const conditionMap = {
  'HIGH': '상',
  'MEDIUM': '중',
  'LOW': '하'
};

// 백엔드 Enum을 프론트엔드 텍스트로 변환하는 헬퍼
const statusMap = {
  'FOR_SALE': '판매중',
  'RESERVED': '예약중',
  'SOLD_OUT': '판매완료'
};

// ✅ 지하철 호선 → 역 리스트
const SUBWAY_MAP = {
  '1호선': ["소요산","동두천","보산","지행","덕정","양주","녹양","가능","의정부","회룡","망월사","도봉산","도봉","방학","창동","녹천","월계","광운대","석계","신이문","외대앞","회기","청량리","제기동","신설동","동묘앞","동대문","종로5가","종로3가","종각","서울역","남영","용산","노량진","대방","신길","영등포","신도림","구로","가산디지털단지","독산","금천구청","광명","석수","관악","안양","명학","금정","군포","당정","의왕","성균관대","화서","수원","세류","병점","세마","오산대","오산","진위","송탄","서정리","지제","평택","성환","직산","두정","천안","봉명","쌍용","아산","배방","온양온천","신창"],
  '2호선': ["시청","을지로입구","을지로3가","을지로4가","동대문역사문화공원","신당","상왕십리","왕십리","한양대","뚝섬","성수","건대입구","구의","강변","잠실나루","잠실","잠실","잠실새내","종합운동장","삼성","선릉","역삼","강남","교대","서초","방배","사당","낙성대","서울대입구","봉천","신림","신대방","구로디지털단지","대림","신도림","문래","영등포구청","당산","합정","홍대입구","신촌","이대","아현","충정로","시청"],
  '3호선': ["대화","주엽","정발산","마두","백석","대곡","원흥","삼송","지축","구파발","연신내","불광","녹번","홍제","무악재","독립문","경복궁","안국","종로3가","충무로","동대입구","약수","금호","옥수","압구정","신사","잠원","고속터미널","교대","남부터미널","양재","매봉","도곡","대치","학여울","대청","일원","수서","가락시장","경찰병원","오금"],
  '4호선': ["당고개","상계","노원","창동","쌍문","수유","미아","미아사거리","길음","성신여대입구","한성대입구","혜화","동대문","종로3가","서울역","숙대입구","삼각지","신용산","이촌","동작","이수","사당","남태령","선바위","경마공원","대공원","과천","정부과천청사","인덕원","평촌","범계","금정","산본","수리산","대야미","반월","상록수","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도"],
  '5호선': ["방화","개화산","김포공항","송정","마곡","발산","우장산","화곡","까치산","신정","목동","오목교","양평","영등포구청","여의도","신길","영등포시장","당산","합정","망원","마포구청","공덕","애오개","충정로","서대문","광화문","종로3가","을지로4가","동대문역사문화공원","청구","신금호","행당","왕십리","마장","답십리","장한평","군자","아차산","광나루","천호","강동","길동","굽은다리","명일","고덕","상일동","강일","미사","하남풍산","하남시청","하남검단산"],
  '6호선': ["응암","역촌","불광","독바위","연신내","구산","디지털미디어시티","월드컵경기장","마포구청","망원","합정","상수","광흥창","대흥","공덕","효창공원앞","삼각지","녹사평","이태원","한강진","버티고개","약수","청구","신당","동묘앞","창신","보문","안암","고려대","월곡","상월곡","돌곶이","석계","태릉입구","화랑대","봉화산"],
  '7호선': ["장암","도봉산","수락산","마들","노원","중계","하계","공릉","태릉입구","먹골","중화","상봉","면목","사가정","용마산","중곡","군자","어린이대공원","건대입구","뚝섬유원지","청담","강남구청","학동","논현","반포","고속터미널","내방","이수","남성","숭실대입구","상도","장승배기","신대방삼거리","보라매","신풍","대림","남구로","가산디지털단지","철산","광명사거리","천왕","온수","오류동","개봉","구일"],
  '8호선': ["암사","천호","강동구청","몽촌토성","잠실","석촌","송파","가락시장","문정","장지","복정","산성","남한산성입구","단대오거리","신흥","수진","모란"],
  '9호선': ["개화","김포공항","공항시장","신방화","마곡나루","양천향교","가양","증미","등촌","염창","신목동","선유도","당산","국회의사당","여의도","샛강","노량진","노들","흑석","동작","구반포","신반포","고속터미널","사평","신논현","언주","선정릉","삼성중앙","봉은사","종합운동장"],
  '경의중앙선': ["문산","파주","금촌","금릉","운정","야당","탄현","일산","풍산","백마","곡산","대곡","능곡","행신","강매","화전","수색","디지털미디어시티","가좌","신촌(경의중앙선)","서울역","용산","이촌","서빙고","한남","옥수","응봉","왕십리","청량리","회기","중랑","상봉","망우","양원","구리","도농","덕소","도심","팔당","운길산","양수","신원","국수","아신","오빈","양평","원덕","용문","지평"],
  '공항철도': ["서울역","공덕","홍대입구","디지털미디어시티","마곡나루","김포공항","계양","검암","청라국제도시","영종","운서","공항화물청사","인천공항1터미널","인천공항2터미널"],
  '신분당선': ["강남","양재","양재시민의숲","청계산입구","판교","정자","미금","동천","수지구청","성복","상현","광교중앙","광교"],
  '수인분당선': ["인천","신포","숭의","인하대","송도","연수","원인재","남동인더스파크","호구포","인천논현","소래포구","월곶","달월","오이도","정왕","신길온천","안산","한대앞","중앙","고잔","초지","금정","범계","평촌","인덕원","정부과천청사","과천","대공원","경마공원","선바위","남태령","수원","매교","수원시청","매탄권선","망포","영통","청명","상갈","기흥","신갈","구성","보정","죽전","오리","미금","정자","수내","서현","이매","야탑","모란"]
};

// ✅ 교내 코드 → 라벨(사람 친화) 매핑
const ONCAMPUS_PLACE_LABELS = {
  T: 'T동',
  R: 'R동',
  A: 'A동',
  MH: 'MH관',
  E: 'E동',
  F: 'F동',
  G: 'G동',
  H: 'H동',
  L: 'L동',
  Q: 'Q동',
  S: 'S존',
  Z1: 'Z1',
  Z2: 'Z2',
  Z3: 'Z3',
  Z4: 'Z4',
  U: 'U동',
  B: 'B동',
  C: 'C동',
  D: 'D동',
  M: 'M동',
  K: 'K동',
  J: 'J동',
  I: 'I동',
  X: 'X(기타)',
  '신기숙사': '신기숙사'
};

// ✅ 역 이름으로 호선을 찾아주는 헬퍼 (중복 시 최초 매칭 반환)
const getLineByStation = (stationName) => {
  if (!stationName) return null;
  for (const [line, stations] of Object.entries(SUBWAY_MAP)) {
    if (stations.includes(stationName)) return line;
  }
  return null;
};

// 할인율에 따른 책 상태 반환 함수
const getBookCondition = (discountRate) => {
  if (discountRate <= 20) return { text: conditionMap.HIGH, color: '#28a745', bgColor: '#d4edda' };
  if (discountRate <= 40) return { text: conditionMap.MEDIUM, color: '#ffc107', bgColor: '#fff3cd' };
  return { text: conditionMap.LOW, color: '#dc3545', bgColor: '#f8d7da' };
};

// ✅ 응답 어디에 있어도 안전하게 추출하는 유틸 (교내/교외 기준 위치)
const deriveTradeLocations = (p = {}) => {
  const onRaw =
      p.oncampusPlaceCode ??
      p.oncampusPlace ??
      p.onCampusPlaceCode ??
      p.onCampus?.placeCode ??
      p.oncampus?.placeCode ??
      null;

  const offRaw =
      p.offcampusStationCode ??
      p.offcampusStation ??
      p.offCampusStationCode ??
      p.offCampus?.stationCode ??
      p.offcampus?.stationCode ??
      null;

  const onLabel = onRaw ? (ONCAMPUS_PLACE_LABELS[onRaw] || onRaw) : null;

  const offStation = offRaw || null;
  const offLine = offStation ? getLineByStation(offStation) : null;

  return { onRaw, onLabel, offRaw, offStation, offLine };
};

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthCtx);

  // --- 상태 관리 ---
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // 후기 모달 상태
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewStar, setReviewStar] = useState(null);
  const [reviewKeywords, setReviewKeywords] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [showOtherBooks, setShowOtherBooks] = useState(false);
  const [sellerOtherBooks, setSellerOtherBooks] = useState([]);
  const [loadingOtherBooks, setLoadingOtherBooks] = useState(false);

  // ✅ 신고 모달 상태
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(''); // '욕설/비방' | '사기/허위매물' | '스팸/광고' | '기타'
  const [reportEtcText, setReportEtcText] = useState('');
  const [showReportDoneModal, setShowReportDoneModal] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/posts/${id}`, { headers: getAuthHeader() });
      setPost(response.data);
      setSelectedImageIndex(0);
    } catch (err) {
      setError(err);
      console.error("게시글 정보를 불러오는 데 실패했습니다.", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyLikes = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      const response = await axios.get('/api/my/likes', { headers: getAuthHeader() });
      // ✅ postId 또는 id 모두 대응
      const likedIds = new Set(response.data.map(p => p.postId ?? p.id));
      setLiked(likedIds.has(parseInt(id)));
    } catch (error) {
      console.error("찜 목록을 불러오는 데 실패했습니다.", error);
    }
  }, [id]);

  const fetchSellerOtherBooks = useCallback(async (sellerId) => {
    if (!sellerId) return;
    setLoadingOtherBooks(true);
    try {
      const response = await axios.get(`/api/posts/seller/${sellerId}`);
      setSellerOtherBooks(response.data.filter(book => book.id !== parseInt(id)));
    } catch (error) {
      console.error("판매자의 다른 책들을 불러오는 데 실패했습니다.", error);
      setSellerOtherBooks([
        { id: parseInt(id) + 1, title: "알고리즘 문제해결 전략", author: "구종만", price: 25000, discountRate: 30 },
        { id: parseInt(id) + 2, title: "Clean Code", author: "Robert C. Martin", price: 20000, discountRate: 15 }
      ]);
    } finally {
      setLoadingOtherBooks(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchMyLikes();
  }, [fetchPost, fetchMyLikes]);

  const handleLikeToggle = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/login');
      return;
    }

    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      if (newLikedState) {
        await axios.post(`/api/posts/${id}/like`, null, { headers: getAuthHeader() });
      } else {
        await axios.delete(`/api/posts/${id}/like`, { headers: getAuthHeader() });
      }
    } catch (error) {
      console.error("찜 처리 실패:", error);
      setLiked(!newLikedState);
      alert("오류가 발생했습니다.");
    }
  }, [liked, id, navigate]);

  const handleChat = useCallback(async () => {
    const salePostId = id;
    const buyerId = user?.id;

    if (!buyerId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/chat/rooms?salePostId=${salePostId}&buyerId=${buyerId}`, {}, {
        headers: getAuthHeader()
      });
      const chatRoom = response.data;
      navigate(`/chat/${chatRoom.id}`);
    } catch (err) {
      console.error("채팅방 생성/입장 실패", err);
      const errorMessage = err.response?.data?.message || '채팅방을 열 수 없습니다. 잠시 후 다시 시도해주세요.';
      alert(errorMessage);
    }
  }, [id, user, navigate]);

  const handleCall = useCallback(() => {
    alert('전화 연결 기능은 준비 중입니다.');
  }, []);

  const handleViewOtherBooks = useCallback(() => {
    setShowOtherBooks(!showOtherBooks);
    if (!showOtherBooks && post?.sellerId) {
      fetchSellerOtherBooks(post.sellerId);
    }
  }, [showOtherBooks, post?.sellerId, fetchSellerOtherBooks]);

  const handleOtherBookClick = useCallback((bookId) => {
    if (bookId !== parseInt(id)) {
      navigate(`/book/${bookId}`, { replace: true });
      setShowOtherBooks(false);
    }
  }, [id, navigate]);

  const handleRetry = useCallback(() => {
    fetchPost();
    fetchMyLikes();
  }, [fetchPost, fetchMyLikes]);

  // 후기 남기기 핸들러
  const canLeaveReview = !!post && post.status === 'SOLD_OUT' && !!user;
  const openReview = () => {
    if (!canLeaveReview) return;
    setReviewOpen(true);
    setReviewStar(null);
    setReviewKeywords('');
  };
  const submitReview = async () => {
    if (!reviewStar) return;
    const role = user?.id === post?.sellerId ? 'BUYER' : 'SELLER';
    const ratingScore = Number(Number(reviewStar).toFixed(2));
    const ratingLabel = ratingScore < 1.5 ? 'worst' : ratingScore < 2.5 ? 'bad' : ratingScore < 3.5 ? 'good' : 'best';
    const kw = reviewKeywords.split(',').map(s => s.trim()).filter(Boolean);
    try {
      setReviewSubmitting(true);
      await createPeerReview({
        // ✅ 다양한 응답형 대응 (post.id || post.postId || URL 파라미터)
        postId: post.id ?? post.postId ?? Number(id),
        ratingLabel,
        ratingScore,
        ratingKeywords: kw,
        role
      });
      alert('후기가 저장되었습니다.');
      setReviewOpen(false);
    } catch (e) {
      console.error('후기 저장 실패', e);
      alert(e.response?.data?.message || '후기 저장 중 오류가 발생했습니다.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // 할인율 계산
  const discountRate = useMemo(() => {
    if (!post) return 0;
    return post.originalPrice > 0
        ? Math.round(((post.originalPrice - post.price) / post.originalPrice) * 100)
        : 0;
  }, [post]);

  // 책 상태 계산
  const bookCondition = useMemo(() => {
    if (!post) return null;
    return getBookCondition(post.discountRate || discountRate);
  }, [post, discountRate]);

  // ✅ 교내/교외 기준 위치 안전 추출
  const { onLabel: oncampusLabel, offStation: offcampusStation, offLine: offcampusLine } = useMemo(
      () => deriveTradeLocations(post || {}),
      [post]
  );

  // ✅ 신고 모달 열기
  const openReport = () => {
    setReportReason('');
    setReportEtcText('');
    setShowReportModal(true);
  };

  // ✅ 신고 제출
  const submitReport = async () => {
    try {
      const reasonText = reportReason === '기타'
          ? (reportEtcText || '기타')
          : reportReason;

      const payload = {
        type: 'SALE_POST',
        targetId: String(id),
        reason: (reportReason === '기타' ? 'OTHER' : reasonText),
        ...(reportReason === '기타' ? { detail: reportEtcText.trim() } : {})
      };

      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      }).catch(() => null);
    } catch {
      // 실패해도 UX는 계속
    }
  };

  const onReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    if (reportReason === '기타' && !reportEtcText.trim()) return;
    setShowReportModal(false);
    await submitReport();
    setShowReportDoneModal(true);
  };

  // 로딩 상태
  if (loading) {
    return (
        <DetailContainer>
          <LoadingContainer>
            <div>📚 게시글을 불러오는 중...</div>
          </LoadingContainer>
        </DetailContainer>
    );
  }

  // 에러 상태
  if (error || !post) {
    return (
        <DetailContainer>
          <ErrorContainer>
            <h2>😅 게시글을 불러올 수 없어요</h2>
            <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
            <button onClick={handleRetry}>다시 시도</button>
          </ErrorContainer>
        </DetailContainer>
    );
  }

  // ✅ 전체 상태/설명에서 사용할 안전한 할인율
  const safeDiscountRate = post.discountRate ?? discountRate;

  return (
      <>
        <div className="header-spacer" />
        <DetailContainer>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>

          <PostDetailGrid>
            <ImageSection>
              <MainImage>
                {post.postImageUrls && post.postImageUrls.length > 0 ? (
                    <MainImageImg src={post.postImageUrls[selectedImageIndex]} alt={post.bookTitle} />
                ) : (
                    <span>이미지 없음</span>
                )}
              </MainImage>
              {post.postImageUrls && post.postImageUrls.length > 1 && (
                  <ThumbnailGrid>
                    {post.postImageUrls.map((imageUrl, index) => (
                        <Thumbnail
                            key={index}
                            $active={selectedImageIndex === index}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                          <ThumbnailImg src={imageUrl} alt={`${post.bookTitle} ${index + 1}`} />
                        </Thumbnail>
                    ))}
                  </ThumbnailGrid>
              )}
            </ImageSection>

            <InfoSection>
              <div>
                <BookTitle>
                  {post.bookTitle}
                  {/* 👉 제목 오른쪽에 신고 + 좋아요 */}
                  <TitleActions>
                    <ReportButton onClick={openReport} title="신고하기">
                      <FaExclamationTriangle />
                      신고
                    </ReportButton>
                    <LikeButton liked={liked} onClick={handleLikeToggle}>♥</LikeButton>
                  </TitleActions>
                </BookTitle>
                <BookAuthor>{post.author}</BookAuthor>
              </div>

              <PriceSection>
                <PriceLabel>판매 가격</PriceLabel>
                <Price>{post.price.toLocaleString()}원</Price>
                {post.originalPrice && (
                    <>
                      <OriginalPrice>{post.originalPrice.toLocaleString()}원</OriginalPrice>
                      <DiscountRate>{discountRate}% 할인</DiscountRate>
                    </>
                )}
              </PriceSection>

              <OverallConditionSection>
                <OverallConditionTitle>📊 전체 책 상태</OverallConditionTitle>
                <OverallConditionBadge
                    $bgColor={getBookCondition(safeDiscountRate).bgColor}
                    $color={getBookCondition(safeDiscountRate).color}
                >
                  {getBookCondition(safeDiscountRate).text}
                </OverallConditionBadge>
                <OverallConditionDescription>
                  할인율 {safeDiscountRate}%에 따른 전체 상태 평가입니다.
                  {safeDiscountRate <= 20 && ' 책이 양호한 상태입니다.'}
                  {safeDiscountRate > 20 && safeDiscountRate <= 40 && ' 책이 보통 상태입니다.'}
                  {safeDiscountRate > 40 && ' 책에 일부 손상이 있습니다.'}
                </OverallConditionDescription>
              </OverallConditionSection>

              <ConditionSection>
                <ConditionTitle>책 상태</ConditionTitle>
                <ConditionGrid>
                  <ConditionItem>
                    <ConditionLabel>필기 상태</ConditionLabel>
                    <ConditionValue value={conditionMap[post.writingCondition]}>{conditionMap[post.writingCondition]}</ConditionValue>
                  </ConditionItem>
                  <ConditionItem>
                    <ConditionLabel>찢어짐 정도</ConditionLabel>
                    <ConditionValue value={conditionMap[post.tearCondition]}>{conditionMap[post.tearCondition]}</ConditionValue>
                  </ConditionItem>
                  <ConditionItem>
                    <ConditionLabel>물흘림 정도</ConditionLabel>
                    <ConditionValue value={conditionMap[post.waterCondition]}>{conditionMap[post.waterCondition]}</ConditionValue>
                  </ConditionItem>
                </ConditionGrid>
              </ConditionSection>

              {/* 상세 설명 */}
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>상세 설명</div>
                {post.contentToxic && (
                    <div style={{
                      marginBottom: 8,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: '#fff3cd',
                      color: '#856404',
                      fontSize: '0.9rem',
                      border: '1px solid #ffeeba'
                    }}>
                      ⚠️ 부적절한 표현이 감지되었습니다{post.contentToxicLevel ? ` (${post.contentToxicLevel}${typeof post.contentToxicMalicious === 'number' ? `, ${Math.round(post.contentToxicMalicious*100)}%` : ''})` : ''}.
                    </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333' }}>
                  {post.postContent || '상세 설명이 없습니다.'}
                </div>
              </div>

              <BookInfoSection>
                <InfoTitle>책 정보</InfoTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>카테고리</InfoLabel>
                    <InfoValue>{post.category || '컴퓨터공학'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>거래 지역</InfoLabel>
                    <InfoValue>{post.tradeLocation || '교내'}</InfoValue>
                  </InfoItem>

                  {/* ✅ 교내 기준 위치(사람 친화 라벨) */}
                  <InfoItem>
                    <InfoLabel>교내 기준 위치</InfoLabel>
                    <InfoValue>{oncampusLabel || '정보 없음'}</InfoValue>
                  </InfoItem>

                  {/* ✅ 교외 기준 위치(호선 · 역 자동 매칭) */}
                  <InfoItem>
                    <InfoLabel>교외 기준 위치</InfoLabel>
                    <InfoValue>
                      {offcampusStation
                          ? `${offcampusLine ? `${offcampusLine} · ` : ''}${offcampusStation}`
                          : '정보 없음'}
                    </InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>가격 협의</InfoLabel>
                    <InfoValue>{post.negotiable ? '가능' : '불가능'}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>판매 상태</InfoLabel>
                    <InfoValue>{statusMap[post.status] || '판매중'}</InfoValue>
                  </InfoItem>
                  {canLeaveReview && (
                      <InfoItem>
                        <InfoLabel>거래 후기</InfoLabel>
                        <div>
                          <button onClick={openReview} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#007bff', color: '#fff', cursor: 'pointer' }}>후기 남기기</button>
                        </div>
                      </InfoItem>
                  )}

                  <InfoItem>
                    <InfoLabel>등록일</InfoLabel>
                    <InfoValue>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>조회수</InfoLabel>
                    <InfoValue>{post.views?.toLocaleString() || 0}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </BookInfoSection>

              <SellerSection>
                <SellerTitle><FaUser /> 판매자 정보</SellerTitle>
                <SellerInfo>
                  <SellerAvatar>
                    {post.sellerProfileImageUrl ? (
                        <img src={post.sellerProfileImageUrl} alt={post.sellerNickname} />
                    ) : (
                        post.sellerNickname?.charAt(0) || '?'
                    )}
                  </SellerAvatar>
                  <SellerDetails>
                    <SellerName>{post.sellerNickname || '익명 사용자'}</SellerName>
                    <SellerLocation>
                      <FaMapMarkerAlt />
                      {post.sellerLocation || '위치 정보 없음'}
                    </SellerLocation>
                    {typeof post.sellerRating === 'number' && (
                        <SellerRating>
                          <Stars>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} filled={i < Math.floor(post.sellerRating)} />
                            ))}
                          </Stars>
                          <RatingText>{post.sellerRating.toFixed(1)}</RatingText>
                        </SellerRating>
                    )}
                    <div>
                      <button onClick={() => navigate(`/users/${post.sellerId}`)} style={{ padding:'6px 10px', border:'1px solid #e0e0e0', borderRadius:8, background:'#f8f9fa', cursor:'pointer' }}>판매자 프로필</button>
                    </div>
                    {post.sellerSalesCount && (
                        <SalesCount>판매 {post.sellerSalesCount}회</SalesCount>
                    )}
                  </SellerDetails>
                </SellerInfo>
                <ActionButtons>
                  <ChatButton onClick={handleChat}>
                    <FaComment />
                    채팅하기
                  </ChatButton>
                  <ViewOtherBooksButton onClick={handleViewOtherBooks}>
                    <FaUser />
                    다른 책 보기 {sellerOtherBooks.length > 0 && `(${sellerOtherBooks.length})`}
                  </ViewOtherBooksButton>
                  {/* (제거됨) 신고 버튼은 제목 옆으로 이동 */}
                </ActionButtons>
              </SellerSection>
            </InfoSection>
          </PostDetailGrid>
        </DetailContainer>

        {showOtherBooks && (
            <ModalOverlay onClick={() => setShowOtherBooks(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>
                    <FaUser /> {post.sellerNickname || '판매자'}님이 판매하는 다른 책들
                  </ModalTitle>
                  <CloseButton onClick={() => setShowOtherBooks(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>

                {loadingOtherBooks ? (
                    <LoadingContainer>
                      <div>📚 다른 책들을 불러오는 중...</div>
                    </LoadingContainer>
                ) : sellerOtherBooks.length > 0 ? (
                    <OtherBooksGrid>
                      {sellerOtherBooks.map(book => {
                        const bookConditionInfo = getBookCondition(book.discountRate);
                        return (
                            <OtherBookCard
                                key={book.id}
                                onClick={() => handleOtherBookClick(book.id)}
                                style={{
                                  borderColor: book.id === parseInt(id) ? '#007bff' : '#e0e0e0',
                                  backgroundColor: book.id === parseInt(id) ? '#f8f9fa' : 'white',
                                }}
                            >
                              {book.id === parseInt(id) && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: '#007bff',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    zIndex: 1
                                  }}>
                                    현재
                                  </div>
                              )}
                              <OtherBookImage>
                                {book.postImageUrls && book.postImageUrls.length > 0 ? (
                                    <img
                                        src={book.postImageUrls[0]}
                                        alt={book.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                                    />
                                ) : (
                                    book.title
                                )}
                              </OtherBookImage>
                              <OtherBookTitle>{book.title}</OtherBookTitle>
                              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                {book.author}
                              </div>
                              <OtherBookPrice>{book.price.toLocaleString()}원</OtherBookPrice>
                              <OtherBookCondition
                                  $bgColor={bookConditionInfo.bgColor}
                                  $color={bookConditionInfo.color}
                              >
                                {bookConditionInfo.text}
                              </OtherBookCondition>
                            </OtherBookCard>
                        );
                      })}
                    </OtherBooksGrid>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      😅 판매자가 등록한 다른 책이 없어요
                    </div>
                )}
              </ModalContent>
            </ModalOverlay>
        )}

        {/* ✅ 후기 모달 */}
        {reviewOpen && (
            <ModalOverlay onClick={() => setReviewOpen(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>후기 남기기</ModalTitle>
                  <CloseButton onClick={() => setReviewOpen(false)}><FaTimes /></CloseButton>
                </ModalHeader>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6, color: '#555' }}>별점(1~5)</div>
                  <input type="number" min="1" max="5" step="0.5" value={reviewStar ?? ''}
                         onChange={e => setReviewStar(e.target.value ? Number(e.target.value) : null)}
                         style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 8 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6, color: '#555' }}>키워드(쉼표로 구분, 선택)</div>
                  <input type="text" value={reviewKeywords}
                         onChange={e => setReviewKeywords(e.target.value)}
                         placeholder="친절함, 시간엄수"
                         style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setReviewOpen(false)} disabled={reviewSubmitting} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#6c757d', color: '#fff' }}>취소</button>
                  <button onClick={submitReview} disabled={!reviewStar || reviewSubmitting} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#007bff', color: '#fff' }}>{reviewSubmitting ? '저장 중...' : '저장'}</button>
                </div>
              </ModalContent>
            </ModalOverlay>
        )}

        {/* ✅ 신고 모달 */}
        {showReportModal && (
            <ModalOverlay onClick={() => setShowReportModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>신고 사유를 선택하세요</ModalTitle>
                  <CloseButton onClick={() => setShowReportModal(false)}><FaTimes /></CloseButton>
                </ModalHeader>

                <form onSubmit={onReportSubmit}>
                  <div style={{ display:'grid', gap:10, marginBottom: 12 }}>
                    {['욕설/비방','사기/허위매물','스팸/광고','기타'].map(opt => (
                        <label key={opt} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                          <input
                              type="radio"
                              name="report"
                              value={opt}
                              checked={reportReason === opt}
                              onChange={(e) => setReportReason(e.target.value)}
                          />
                          {opt}
                        </label>
                    ))}
                  </div>

                  {/* ✅ '기타' 선택 시 세부 사항 입력창 표시 */}
                  {reportReason === '기타' && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 6, fontSize: '.92rem', color: '#555' }}>세부 사유</div>
                        <textarea
                            value={reportEtcText}
                            onChange={e => setReportEtcText(e.target.value)}
                            placeholder="자세한 신고 사유를 입력해주세요."
                            rows={4}
                            style={{ width:'100%', border:'1px solid #e5e7eb', borderRadius: 8, padding: 10, resize: 'vertical' }}
                        />
                      </div>
                  )}

                  <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
                    <button
                        type="button"
                        onClick={() => setShowReportModal(false)}
                        style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #ddd', background:'#f1f3f5', cursor:'pointer' }}
                    >
                      취소
                    </button>
                    <button
                        type="submit"
                        disabled={!reportReason || (reportReason === '기타' && !reportEtcText.trim())}
                        style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #0d6efd', background:'#0d6efd', color:'#fff', cursor:'pointer' }}
                    >
                      제출
                    </button>
                  </div>
                </form>
              </ModalContent>
            </ModalOverlay>
        )}

        {/* ✅ 신고 완료 안내 모달 */}
        {showReportDoneModal && (
            <ModalOverlay onClick={() => setShowReportDoneModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>신고가 접수되었습니다.</ModalTitle>
                  <CloseButton onClick={() => setShowReportDoneModal(false)}><FaTimes /></CloseButton>
                </ModalHeader>
                <div style={{ color:'#333', lineHeight:1.6 }}>
                  빠르게 검토하겠습니다. 제보해주셔서 감사합니다.
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                  <button
                      onClick={() => setShowReportDoneModal(false)}
                      style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #ddd', background:'#0d6efd', color:'#fff', cursor:'pointer' }}
                  >
                    닫기
                  </button>
                </div>
              </ModalContent>
            </ModalOverlay>
        )}
      </>
  );
};

export default PostDetail;
