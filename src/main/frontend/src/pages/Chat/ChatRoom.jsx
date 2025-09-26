import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import styled from 'styled-components';
import {
  FaPaperPlane, FaUser, FaBook, FaArrowLeft, FaSignOutAlt, FaCalendarAlt,
  FaRegClock, FaCheckCircle, FaEye, FaExclamationCircle, FaMapMarkerAlt,
  FaRoute, FaUniversity, FaSubway, FaTrophy
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Stomp from 'stompjs';
import { AuthCtx } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

/* ----------------------------- styled components ----------------------------- */
const ChatContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 0;
  @media (max-width: 900px) { padding-top: 0; }
  @media (max-width: 600px) { padding-top: 0; }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  min-width: 0;
  overflow: hidden;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
  &:hover { background: #5a6268; }
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const BookTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  overflow-x: auto;
  padding-left: 10px;
  @media (max-width: 768px) { gap: 5px; }
`;

const ChatMenuButton = styled.button`
  background: ${props => props.active ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.active ? 'white' : 'var(--text)'};
  border: 2px solid ${props => props.active ? 'transparent' : 'var(--border)'};
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: ${props => props.active ? 'var(--shadow-lg)' : 'none'};
  min-width: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 10px;
  margin-right: 0;
  height: 44px;
  flex-shrink: 0;
  &::before {
    content: '';
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: 0.6s;
  }
  &:hover::before { transform: translateX(100%); }
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(0, 123, 255, 0.05);
  }
  &:active { transform: translateY(0); }
  &:disabled {
    color: #bbb;
    background: #f5f5f5;
    border-color: #eee;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    min-width: 100px; font-size: 0.9rem; padding: 0.6rem 0.8rem; margin-left: 5px;
  }
  @media (max-width: 600px) {
    min-width: 80px; font-size: 0.85rem; padding: 0.5rem 0.6rem; margin-left: 3px;
  }
`;

const ExitButton = styled(ChatMenuButton)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.2);
  &:hover {
    background: #ef4444; color: white; border-color: #ef4444;
    transform: translateY(-2px); box-shadow: var(--shadow-lg);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (max-width: 600px) { padding: 8px; gap: 8px; }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  ${props => props.isOwn ? `
    align-self: flex-end; background: #007bff; color: white; border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start; background: #f1f3f4; color: #333; border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
  ${props => props.isOwn ? `
    align-self: flex-end; text-align: right;
  ` : `
    align-self: flex-start; text-align: left;
  `}
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 15px;
  align-self: center;
  max-width: 80%;
  &.cancel {
    color: #d32f2f; background: #fff0f0; border: 1px solid #ffcdd2; font-weight: 600;
  }
`;

const ChatInput = styled.div`
  padding: 20px; border-top: 1px solid #e0e0e0; background: #f8f9fa;
  @media (max-width: 600px) { padding: 8px; }
`;

const InputContainer = styled.div`
  display: flex; gap: 10px; align-items: flex-end;
`;

const MessageStatus = styled.div`
  display: flex; align-items: center; gap: 4px; font-size: 0.7rem; margin-top: 2px;
  ${props => props.isOwn ? `
    align-self: flex-end; justify-content: flex-end;
  ` : `
    align-self: flex-start; justify-content: flex-start;
  `}
`;

const StatusIcon = styled.span`
  color: ${props => {
    if (props.$status === 'sending') return '#ffa726';
    if (props.$status === 'read') return '#2196f3';
    if (props.$status === 'failed') return '#f44336';
    return '#9e9e9e';
  }};
  font-size: 0.8rem;
`;

const RetryButton = styled.button`
  background: none; border: none; color: #f44336; cursor: pointer; padding: 2px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
  &:hover { background: rgba(244, 67, 54, 0.1); }
`;

const ProfanityWarning = styled.div`
  background: #fff3cd; border: 1px solid #ffeaa7; color: #856404;
  padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px; font-size: 0.9rem;
`;

const MessageInput = styled.textarea`
  flex: 1; padding: 12px 16px; border: 1px solid ${p => p.hasProfanity ? '#f44336' : '#ddd'};
  border-radius: 20px; resize: none; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.3s;
  max-height: 100px; min-height: 44px;
  &:focus { border-color: ${p => p.hasProfanity ? '#f44336' : '#007bff'}; }
`;

const SendButton = styled.button`
  padding: 12px 16px; background: ${p => p.disabled ? '#ccc' : '#007bff'}; color: white;
  border: none; border-radius: 50%; cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.3s; display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  &:hover { background: ${p => p.disabled ? '#ccc' : '#0056b3'}; }
`;

const QuickActions = styled.div`
  display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px; background: white; border: 1px solid #ddd; border-radius: 15px;
  cursor: pointer; font-size: 0.9rem; transition: all 0.3s;
  &:hover { background: #007bff; color: white; border-color: #007bff; }
`;

const NoMessages = styled.div`
  text-align: center; color: #666; padding: 40px 20px;
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 12px; padding: 32px 24px 24px 24px; min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px;
`;

const ModalTitle = styled.div`
  font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;
`;

const ModalTextarea = styled.textarea`
  width: 100%; min-height: 60px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; font-size: 1rem; resize: none;
`;

const ModalActions = styled.div`
  display: flex; gap: 10px; justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 8px 16px; border-radius: 8px; border: none; background: #007bff; color: #fff; font-weight: 600; cursor: pointer;
  &:hover { background: #0056b3; }
  &[data-variant='cancel'] {
    background: #ccc; color: #333; &:hover { background: #bbb; }
  }
`;

const ReportRadio = styled.label`
  display: flex; align-items: center; gap: 8px; padding: 8px 0; cursor: pointer; font-size: 0.9rem;
  &:hover { color: #007bff; }
`;

const RadioInput = styled.input`
  margin: 0; cursor: pointer;
`;

const RetryModalOverlay = styled(ModalOverlay)``;

const RetryModalBox = styled.div`
  background: #fff; border-radius: 12px; padding: 24px; min-width: 320px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  display: flex; flex-direction: column; gap: 16px; text-align: center;
`;

const RetryModalTitle = styled.div`
  font-size: 1.1rem; font-weight: 600; color: #333;
`;

const RetryModalMessage = styled.div`
  font-size: 0.95rem; color: #666; line-height: 1.4;
`;

const RetryModalActions = styled.div`
  display: flex; gap: 10px; justify-content: center; margin-top: 8px;
`;

const RetryModalButton = styled.button`
  padding: 8px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s;
  &.cancel { background: #f1f3f4; color: #333; &:hover { background: #e8eaed; } }
  &.confirm { background: #007bff; color: white; &:hover { background: #0056b3; } }
`;

const ReserveModalBox = styled(ModalBox)`
  min-width: 320px; max-width: 90vw; max-height: 80vh;
  overflow-y: auto; padding: 20px 16px 16px 16px;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const PlaceList = styled.div`
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
`;

const PlaceItem = styled.button`
  background: #f5f8ff;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary)' : '#e0e0e0'};
  color: ${({ selected }) => selected ? 'var(--primary)' : '#333'};
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex; align-items: center; gap: 0.5rem;
  &:hover { border-color: var(--primary); color: var(--primary); background: #eaf0ff; }
`;

const DateList = styled.div`
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
`;

const DateItem = styled.button`
  background: #f5f8ff;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary)' : '#e0e0e0'};
  color: ${({ selected }) => selected ? 'var(--primary)' : '#333'};
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex; align-items: center; gap: 0.75rem;
  &:hover { border-color: var(--primary); color: var(--primary); background: #eaf0ff; }
`;

/* ✅ 강수확률 미니 막대 스타일 */
const MiniBarWrap = styled.div`
  height: 70px; width: 10px; border-radius: 6px;
  background: linear-gradient(#eaf3ff, #f3f4f6);
  display:flex; align-items:flex-end; padding: 2px; margin-right: 8px;
`;
const MiniBar = styled.div`
  width:100%; border-radius:4px; background:#1d4ed8; transition: height .4s;
`;

/* ---------------------------------- hooks ---------------------------------- */
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

/* =================== 교내/교외 중간지점 추천 헬퍼 =================== */

const ONCAMPUS_LABELS = {
  A:'A동', B:'B동', C:'C동', D:'D동', E:'E동', F:'F동', G:'G동', H:'H동',
  I:'I동', J:'J동', K:'K동', L:'L동', M:'M', MH:'MH', P:'P동', Q:'Q동', R:'R동',
  S:'S동', T:'제2공학관(T동)', U:'U동', X:'운동장(X)', Z1:'정문(Z1)', Z2:'후문(Z2)', Z3:'측문(Z3)', Z4:'측문(Z4)', '신기숙사':'신기숙사'
};
const CAMPUS_OPTIONS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','MH','P','Q','R','S','T','U','X','Z1','Z2','Z3','Z4','신기숙사'];

function buildCampusGraph() {
  const g = {};
  const add = (a,b,w)=>{ g[a]=g[a]||[]; g[b]=g[b]||[]; g[a].push({to:b,w}); g[b].push({to:a,w}); };
  add("I","L",1); add("I","P",1); add("J","L",1); add("K","L",1); add("K","R",1); add("R","M",1);
  add("L","G",1); add("G","Q",1); add("G","H",1); add("L","H",1); add("H","P",1); add("H","Q",1);
  add("F","MH",1); add("F","E",1); add("E","U",1); add("E","B",1); add("B","A",1); add("A","C",1); add("C","D",1);
  add("Q","F",1); add("S","Z2",1); add("Z1","S",1); add("S","T",1); add("T","Z3",1); add("T","Z4",1);
  add("Z2","신기숙사",1); add("신기숙사","X",1);
  add("Z1","MH",2);
  return g;
}
const CAMPUS_GRAPH = buildCampusGraph();

function dijkstraCampus(start, end) {
  if (!CAMPUS_GRAPH[start] || !CAMPUS_GRAPH[end]) return null;
  const dist={}, prev={}, all=Object.keys(CAMPUS_GRAPH); all.forEach(n=>dist[n]=Infinity);
  dist[start]=0;
  const todo=new Set(all);
  const pick=()=>{ let best=null,bd=Infinity; for(const n of todo){ if(dist[n]<bd){bd=dist[n]; best=n;} } return best; };
  while(todo.size){
    const u=pick(); if(u==null) break; todo.delete(u); if(u===end) break;
    for(const {to,w} of CAMPUS_GRAPH[u]){
      const alt=dist[u]+w; if(alt<dist[to]){ dist[to]=alt; prev[to]=u; }
    }
  }
  if(start!==end && !prev[end]) return null;
  const path=[]; let cur=end; while(cur!=null){ path.push(cur); cur=prev[cur]; } return path.reverse();
}
function recommendOnCampus(aCode, bCode) {
  const path = dijkstraCampus(aCode, bCode);
  if (!path) return null;
  const mid = path[Math.floor((path.length - 1)/2)];
  return { path, midCode: mid, midLabel: ONCAMPUS_LABELS[mid] || mid };
}

/** 교외 노선/역 */
const SUBWAY_MAP = {
  '1호선': ["소요산","동두천","보산","지행","덕정","양주","녹양","가능","의정부","회룡","망월사","도봉산","도봉","방학","창동","녹천","월계","광운대","석계","신이문","외대앞","회기","청량리","제기동","신설동","동묘앞","동대문","종로5가","종로3가","종각","서울역","남영","용산","노량진","대방","신길","영등포","신도림","구로","가산디지털단지","독산","금천구청","광명","석수","관악","안양","명학","금정","군포","당정","의왕","성균관대","화서","수원","세류","병점","세마","오산대","오산","진위","송탄","서정리","지제","평택","성환","직산","두정","천안","봉명","쌍용","아산","배방","온양온천","신창"],
  '2호선': ["시청","을지로입구","을지로3가","을지로4가","동대문역사문화공원","신당","상왕십리","왕십리","한양대","뚝섬","성수","건대입구","구의","강변","잠실나루","잠실","잠실새내","종합운동장","삼성","선릉","역삼","강남","교대","서초","방배","사당","낙성대","서울대입구","봉천","신림","신대방","구로디지털단지","대림","신도림","문래","영등포구청","당산","합정","홍대입구","신촌","이대","아현","충정로","시청"],
  '3호선': ["대화","주엽","정발산","마두","백석","대곡","원흥","삼송","지축","구파발","연신내","불광","녹번","홍제","무악재","독립문","경복궁","안국","종로3가","충무로","동대입구","약수","금호","옥수","압구정","신사","잠원","고속터미널","교대","남부터미널","양재","매봉","도곡","대치","학여울","대청","일원","수서","가락시장","경찰병원","오금"],
  '4호선': ["당고개","상계","노원","창동","쌍문","수유","미아","미아사거리","길음","성신여대입구","한성대입구","혜화","동대문","종로3가","서울역","숙대입구","삼각지","신용산","이촌","동작","이수","사당","남태령","선바위","경마공원","대공원","과천","정부과천청사","인덕원","평촌","범계","금정","산본","수리산","대야미","반월","상록수","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도","정왕","신길온천","안산","한대앞","중앙","고잔","초지","금정","범계","평촌","인덕원","정부과천청사","과천","대공원","경마공원","선바위","남태령","수원","매교","수원시청","매탄권선","망포","영통","청명","상갈","기흥","신갈","구성","보정","죽전","오리","미금","정자","수내","서현","이매","야탑","모란"],
  '5호선': ["방화","개화산","김포공항","송정","마곡","발산","우장산","화곡","까치산","신정","목동","오목교","양평","영등포구청","여의도","신길","영등포시장","당산","합정","망원","마포구청","공덕","애오개","충정로","서대문","광화문","종로3가","을지로4가","동대문역사문화공원","청구","신금호","행당","왕십리","마장","답십리","장한평","군자","아차산","광나루","천호","강동","길동","굽은다리","명일","고덕","상일동","강일","미사","하남풍산","하남시청","하남검단산"],
  '6호선': ["응암","역촌","불광","독립문","연신내","구산","디지털미디어시티","월드컵경기장","마포구청","망원","합정","상수","광흥창","대흥","공덕","효창공원앞","삼각지","녹사평","이태원","한강진","버티고개","약수","청구","신당","동묘앞","창신","보문","안암","고려대","월곡","상월곡","돌곶이","석계","태릉입구","화랑대","봉화산"],
  '7호선': ["장암","도봉산","수락산","마들","노원","중계","하계","공릉","태릉입구","먹골","중화","상봉","면목","사가정","용마산","중곡","군자","어린이대공원","건대입구","뚝섬유원지","청담","강남구청","학동","논현","반포","고속터미널","내방","이수","남성","숭실대입구","상도","장승배기","신대방삼거리","보라매","신풍","대림","남구로","가산디지털단지","철산","광명사거리","천왕","온수","오류동","개봉","구일"],
  '8호선': ["암사","천호","강동구청","몽촌토성","잠실","석촌","송파","가락시장","문정","장지","복정","산성","남한산성입구","단대오거리","신흥","수진","모란"],
  '9호선': ["개화","김포공항","공항시장","신방화","마곡나루","양천향교","가양","증미","등촌","염창","신목동","선유도","당산","국회의사당","여의도","샛강","노량진","노들","흑석","동작","구반포","신반포","고속터미널","사평","신논현","언주","선정릉","삼성중앙","봉은사","종합운동장"],
  '경의중앙선': ["문산","파주","금촌","금릉","운정","야당","탄현","일산","풍산","백마","곡산","대곡","능곡","행신","강매","화전","수색","디지털미디어시티","가좌","신촌(경의중앙선)","서울역","용산","이촌","서빙고","한남","옥수","응봉","왕십리","청량리","회기","중랑","상봉","망우","양원","구리","도농","덕소","도심","팔당","운길산","양수","신원","국수","아신","오빈","양평","원덕","용문","지평"],
  '공항철도': ["서울역","공덕","홍대입구","디지털미디어시티","마곡나루","김포공항","계양","검암","청라국제도시","영종","운서","공항화물청사","인천공항1터미널","인천공항2터미널"],
  '신분당선': ["강남","양재","양재시민의숲","청계산입구","판교","정자","미금","동천","수지구청","성복","상현","광교중앙","광교"],
  '수인분당선': ["인천","신포","숭의","인하대","송도","연수","원인재","남동인더스파크","호구포","인천논현","소래포구","월곶","달월","오이도","정왕","신길온천","안산","한대앞","중앙","고잔","초지","안산","신길온천","정왕","오이도","정왕","신길온천","안산","한대앞","중앙","고잔","초지","금정","범계","평촌","인덕원","정부과천청사","과천","대공원","경마공원","선바위","남태령","수원","매교","수원시청","매탄권선","망포","영통","청명","상갈","기흥","신갈","구성","보정","죽전","오리","미금","정자","수내","서현","이매","야탑","모란"]
};
const getLineByStation = (station) => {
  if (!station) return null;
  for (const [line, arr] of Object.entries(SUBWAY_MAP)) if (arr.includes(station)) return line;
  return null;
};
function buildStationGraphAndLineMap() {
  const graph={}, stationLines={};
  for (const [line, arr] of Object.entries(SUBWAY_MAP)) {
    arr.forEach((name,i)=>{
      graph[name]=graph[name]||new Set();
      stationLines[name]=stationLines[name]||new Set();
      stationLines[name].add(line);
      if(i>0){ graph[name].add(arr[i-1]); graph[arr[i-1]].add(name); }
    });
  }
  return { graph, stationLines };
}
const { graph: ST_GRAPH, stationLines: ST_LINES } = buildStationGraphAndLineMap();
const getUniqueStations = (line) => {
  const arr = SUBWAY_MAP[line] || [];
  return Array.from(new Set(arr));
};

function dijkstraWeighted(start, end, transferCost = 10, penalizePenalty = 10) {
  if (!ST_GRAPH[start] || !ST_GRAPH[end]) return null;
  const penalized = new Set(["공항철도","경의중앙선","신분당선","수인분당선"]);
  const dist={}, prev={}; Object.keys(ST_GRAPH).forEach(s=>dist[s]=Infinity); dist[start]=0;
  const todo=new Set(Object.keys(ST_GRAPH));
  const pick=()=>{ let b=null,bd=Infinity; for(const s of todo) if(dist[s]<bd){bd=dist[s]; b=s;} return b; };
  while(todo.size){
    const u=pick(); if(u==null) break; todo.delete(u); if(u===end) break;
    for(const v of ST_GRAPH[u]){
      const linesU=ST_LINES[u]||new Set(), linesV=ST_LINES[v]||new Set();
      let commonNonPen=false; for(const l of linesU){ if(!penalized.has(l) && linesV.has(l)){ commonNonPen=true; break; } }
      let w; if(commonNonPen){ w=1; } else {
        let p=false; for(const l of linesU){ if(penalized.has(l) && linesV.has(l)){ p=true; break; } }
        w = p ? penalizePenalty : transferCost;
      }
      const alt=dist[u]+w; if(alt<dist[v]){ dist[v]=alt; prev[v]=u; }
    }
  }
  if(start!==end && !prev[end]) return null;
  const path=[]; let cur=end; path.unshift(cur); while(prev[cur]){ cur=prev[cur]; path.unshift(cur); }
  return path;
}
function recommendOffCampus(aStation, bStation){
  const path = dijkstraWeighted(aStation, bStation, 10, 10);
  if (!path) return null;
  const mid = path[Math.floor(path.length/2)];
  return { path, midStation: mid };
}

/* ----------------------------- 예약 API ------------------------------ */
async function apiGetReservation(roomId) {
  const token = localStorage.getItem('accessToken') || '';
  const res = await fetch(`/api/chat/rooms/${roomId}/reservation`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('예약 조회 실패');
  return res.json();
}
async function apiUpsertReservation(roomId, payload) {
  const token = localStorage.getItem('accessToken') || '';
  const res = await fetch(`/api/chat/rooms/${roomId}/reservation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('예약 저장 실패');
  return res.json();
}
async function apiAcceptReservation(roomId, reservationId) {
  const token = localStorage.getItem('accessToken') || '';
  const res = await fetch(`/api/chat/rooms/${roomId}/reservation/${reservationId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(t || '예약 수락 실패');
  }
  return res.json();
}
async function apiCancelReservation(roomId, reservationId, reason) {
  const token = localStorage.getItem('accessToken') || '';
  const res = await fetch(`/api/chat/rooms/${roomId}/reservation/${reservationId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('예약 취소 실패');
  return res.json();
}
async function apiCompleteReservation(roomId, reservationId) {
  const token = localStorage.getItem('accessToken') || '';
  const res = await fetch(`/api/chat/rooms/${roomId}/reservation/${reservationId}/complete`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('거래 완료 처리 실패');
  return res.json();
}

/* ----------------------------- utils ------------------------------ */
function normalizeDateTime(input) {
  if (!input) return input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return `${input}T12:00:00`;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(input)) return input.replace(' ', 'T');
  return input;
}

// 공통 헤더
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ 서버 ENUM으로 변환(대문자 + 언더스코어)
const toServerEnum = (s) => String(s || '').toUpperCase().replace(/-/g, '_');
// ✅ 서버 ENUM → 화면 비교용 소문자
const toLocalStatus = (s) => String(s || '').toLowerCase();

// sale_post 상태 변경
async function patchPostStatus(postId, status, buyerId) {
  if (!postId || !status) return;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
  const statusEnum = toServerEnum(status);
  const body = buyerId ? { status: statusEnum, buyerId } : { status: statusEnum };
  const res = await fetch(`/api/posts/${postId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(t || '게시글 상태 변경 실패');
  }
  return res.json().catch(()=> ({}));
}

// 최신 게시글 조회
async function fetchPost(postId) {
  if (!postId) return null;
  const res = await fetch(`/api/posts/${postId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('게시글 조회 실패');
  return res.json();
}

/* ----------------------------- component start ------------------------------ */

// WebSocket endpoint: derive from VITE_WS_BASE or VITE_API_BASE; fallback to dev localhost
const resolveWsEndpoint = () => {
  const env = import.meta.env || {};
  const { VITE_WS_BASE, VITE_API_BASE } = env;

  // ✅ base에 뭐가 들어와도 host만 추출해서 ws/wss + "/ws-stomp/websocket"로 고정
  const makeWsUrlFromBase = (base) => {
    if (!base || typeof window === 'undefined') return null;
    try {
      const u = new URL(base, window.location.origin);   // http/https/ws/wss/경로 상관없이 파싱
      const pageHttps = window.location.protocol === 'https:';
      const proto = pageHttps ? 'wss' : 'ws';
      const host = u.host;                               // 🔴 path는 버리고 host만 사용
      return `${proto}://${host}/ws-stomp/websocket`;    // 항상 한 개 슬래시
    } catch {
      return null;
    }
  };

  // 1) WS_BASE 최우선
  const fromWsBase = makeWsUrlFromBase(VITE_WS_BASE);
  if (fromWsBase) return fromWsBase;

  // 2) API_BASE에서 생성
  const fromApi = makeWsUrlFromBase(VITE_API_BASE);
  if (fromApi) return fromApi;

  // 3) 로컬 개발
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'ws://localhost:8080/ws-stomp/websocket';
  }

  // 4) 마지막 안전한 상대경로로
  const pageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return (pageHttps ? 'wss://' : 'ws://') + window.location.host + '/ws-stomp/websocket';
};

const WS_ENDPOINT = resolveWsEndpoint();
console.log('[WS_ENDPOINT]', WS_ENDPOINT);
// ✅ WS 호스트를 전역에 심어 SSE가 재사용하도록
try { window.__HBS_BACKEND_HOST__ = new URL(WS_ENDPOINT).host; } catch {}

const resolveBackendOrigin = () => {
  const env = import.meta.env || {};

  const hostFromWs =
      (typeof window !== 'undefined' && window.__HBS_BACKEND_HOST__)
          ? ((window.location.protocol === 'https:' ? 'https:' : 'http:') + '//' + window.__HBS_BACKEND_HOST__)
          : null;

  // 우선순위: VITE_BACKEND_ORIGIN > VITE_API_BASE > VITE_WS_BASE(스킴 전환) > 전역 WS 호스트 > (로컬) localhost
  const candidates = [
    env.VITE_BACKEND_ORIGIN,
    env.VITE_API_BASE,
    env.VITE_WS_BASE,
    hostFromWs,
    (typeof window !== 'undefined' && window.location.port === '5173') ? 'http://localhost:8080' : null,
  ].filter(Boolean);

  for (const raw of candidates) {
    try {
      const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
      if (u.protocol === 'ws:' || u.protocol === 'wss:') {
        u.protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'https:' : 'http:';
      }
      return `${u.protocol}//${u.host}`; // host만 사용
    } catch {}
  }

  // 배포(Vercel)에서 못 찾으면 SSE 열지 않음
  if (typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname)) {
    console.error('[SSE] No backend origin. Set VITE_API_BASE to your Cloud Run host.');
    return null;
  }
  return (typeof window !== 'undefined') ? window.location.origin : null;
};

const BACKEND_ORIGIN = resolveBackendOrigin();
console.log('[BACKEND_ORIGIN]', BACKEND_ORIGIN);
const SSE_ENDPOINT = (token) =>
    BACKEND_ORIGIN
        ? `${BACKEND_ORIGIN}/api/notifications/stream?token=${encodeURIComponent(token || '')}`
        : null;

const ChatRoom = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // chatId → 유효한 숫자 roomId로 변환
  const roomId = useMemo(() => {
    const n = Number(chatId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [chatId]);

  const [isPending, setIsPending] = useState(false);    // REQUESTED
  const [isReserved, setIsReserved] = useState(false);  // CONFIRMED
  const [reservationId, setReservationId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // === Reservation system banner state (avoid duplicate injections) ===
  const reservationBannerKeyRef = useRef('');

  // 날짜 문자열을 간단히 표기 (시간 제거)
  function formatDateLabel(dateStr) {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      const mm = String(parseInt(m[2], 10));
      const dd = String(parseInt(m[3], 10));
      return `${mm}/${dd}`;
    }
    return s;
  }

  // 예약 안내문 생성 (시간 없이 날짜+장소만)
  function buildReservationText(info, status) {
    const s = String(status || info?.status || '').toUpperCase();
    const rawDate =
        info?.reservedDate || info?.date || info?.reservedAt ||
        info?.when || info?.meetAt || info?.scheduledAt || info?.time;
    const place =
        info?.placeLabel || info?.placeName || info?.place ||
        info?.locationName || info?.location || info?.address || '';
    const base =
        s === 'CONFIRMED' ? '예약이 승인되었습니다' :
            s === 'REQUESTED' ? '예약 요청이 전송되었습니다' :
                '예약 안내';
    const dateLabel = rawDate ? formatDateLabel(rawDate) : null;
    return [base, dateLabel, place].filter(Boolean).join(' · ');
  }

  // 시스템 메시지로 1회 주입
  const injectReservationBanner = (info) => {
    if (!info) return;
    const key = [info.id, info.status, info.reservedAt || info.date || info.when, info.placeLabel || info.placeName || info.location || info.address].join('|');
    if (reservationBannerKeyRef.current === key) return;
    reservationBannerKeyRef.current = key;
    const text = buildReservationText(info);
    if (!text) return;
    setMessages(prev => ([
      ...prev,
      { id: `res-banner-${Date.now()}`, type: 'system', message: text, sentAt: new Date().toISOString(), meta: { reservationBanner: true, key } }
    ]));
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportEtcText, setReportEtcText] = useState(''); // ✅ 기타 상세 입력
  const [showReportExitModal, setShowReportExitModal] = useState(false);

  const [hovered, setHovered] = useState('');
  const [hasProfanity, setHasProfanity] = useState(false);
  const [profanityWarning, setProfanityWarning] = useState('');
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryMessageId, setRetryMessageId] = useState(null);

  // 스마트 예약 관련
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [reserveConfirmed, setReserveConfirmed] = useState(false);

  const width = useWindowWidth();
  const [receiverId, setReceiverId] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [salePostId, setSalePostId] = useState(null);

  // 참여자/게시글 상태
  const [postStatus, setPostStatus] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [sellerId, setSellerId] = useState(null);

  const stompClient = useRef(null);
  const sseRef = useRef(null);
  const { user } = useContext(AuthCtx);
  const currentUserId = user?.id;

  const isBuyer = useMemo(
      () => !!currentUserId && !!buyerId && currentUserId === buyerId,
      [currentUserId, buyerId]
  );
  const isSeller = useMemo(
      () => !!currentUserId && !!sellerId && currentUserId === sellerId,
      [currentUserId, sellerId]
  );

  // ✅ 상대 사용자 ID(신고 대상)
  const otherUserId = useMemo(() => {
    if (receiverId) return receiverId;
    if (!buyerId || !sellerId || !currentUserId) return null;
    return currentUserId === sellerId ? buyerId : sellerId;
  }, [receiverId, buyerId, sellerId, currentUserId]);

  // 날씨
  const [weeklyWeather, setWeeklyWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // 판매자 기본 위치
  const [sellerDefault, setSellerDefault] = useState({
    oncampusPlaceCode: null,
    offcampusStationCode: null
  });

  // 교내/교외 추천
  const [meetType, setMeetType] = useState('on'); // 'on' | 'off'
  const [buyerCampusCode, setBuyerCampusCode] = useState('');
  const [campusSuggest, setCampusSuggest] = useState(null);
  const [buyerLine, setBuyerLine] = useState('');
  const [buyerStation, setBuyerStation] = useState('');
  const [offSuggest, setOffSuggest] = useState(null);

  const getLabel = (type) => {
    if (width <= 600) return '';
    if (width <= 900) {
      switch (type) {
        case 'report': return t('chat.getLabel.report');
        case 'reserve': return t('chat.getLabel.reserve');
        case 'reserve-cancel': return t('chat.getLabel.reserveCancel');
        case 'complete': return t('chat.getLabel.complete');
        case 'complete-cancel': return t('chat.getLabel.completeCancel');
        case 'accept': return t('chat.getLabel.accept');
        case 'decline': return t('chat.getLabel.decline');
        default: return '';
      }
    }
    switch (type) {
      case 'report': return t('chat.getLabel.reportLong');
      case 'reserve': return t('chat.getLabel.reserveLong');
      case 'reserve-cancel': return t('chat.getLabel.reserveCancelLong');
      case 'complete': return t('chat.getLabel.completeLong');
      case 'complete-cancel': return t('chat.getLabel.completeCancelLong');
      case 'accept': return t('chat.getLabel.acceptLong');
      case 'decline': return t('chat.getLabel.declineLong');
      default: return '';
    }
  };

  const iconColor = (activeColor, isActive, isHover) => {
    if (isActive || isHover) return activeColor;
    return '#bbb';
  };

  /* -------------------------- 채팅방/메시지 로딩 -------------------------- */
  useEffect(() => {
    if (!roomId) return;

    async function loadRoomInfo() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch(`/api/chat/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error(t('chat.chatRoomError'));

        const room = await res.json();

        const userJson = localStorage.getItem('user');
        const myUsername = userJson ? JSON.parse(userJson).username : null;
        const myIdLocal = userJson ? JSON.parse(userJson).id : null;
        if (!myUsername || !myIdLocal) return;

        let sender = null, receiver = null;
        if (myIdLocal === room.buyerId) { sender = room.buyerId; receiver = room.sellerId; }
        else if (myIdLocal === room.sellerId) { sender = room.sellerId; receiver = room.buyerId; }
        else return;

        setSenderId(sender);
        setReceiverId(receiver);
        setSalePostId(room.salePostId);
        setBuyerId(room.buyerId);
        setSellerId(room.sellerId);

        // 판매자 기본 위치 + 게시글 상태
        if (room.salePostId) {
          const postRes = await fetch(`/api/posts/${room.salePostId}`, { headers: { Authorization: `Bearer ${token}` }});
          if (postRes.ok) {
            const post = await postRes.json();
            setPostStatus(toLocalStatus(post.status || null));
            setSellerDefault({
              oncampusPlaceCode: post.oncampusPlaceCode || null,
              offcampusStationCode: post.offcampusStationCode || null
            });
            setMeetType(post.oncampusPlaceCode ? 'on' : (post.offcampusStationCode ? 'off' : 'on'));
          }
        }
      } catch (err) {
      }
    }
    loadRoomInfo();
  }, [roomId]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!roomId || !token) return;

    const loadPreviousMessages = async () => {
      try {
        const res = await fetch(`/api/chat/room/${roomId}/messages`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error(t('chat.chatListError'));
        const data = await res.json();
        setMessages(data);
      } catch (err) {
      }
    };
    loadPreviousMessages();
  }, [roomId]);


  /* ------------------------------ 예약 상태 로드 ------------------------------ */
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      try {
        const r = await apiGetReservation(roomId);
        if (!r) {
          setReservationId(null);
          setIsPending(false);
          setIsReserved(false);
          setIsCompleted(false);
          return;
        }
        setReservationId(r.id);
        const st = String(r.status || '').toUpperCase();
        setIsPending(st === 'REQUESTED');
        setIsReserved(st === 'CONFIRMED');
        setIsCompleted(st === 'COMPLETED');

        if (r.placeLabel || r.placeName || r.location || r.address) {
          setSelectedPlace(r.placeLabel || r.placeName || r.location || r.address);
        }
        const raw =
            r.reservedDate || r.date || r.reservedAt ||
            r.when || r.meetAt || r.scheduledAt || r.time;
        if (raw) {
          setSelectedDate({ date: formatDateLabel(raw), iso: String(raw), weather: null });
        }

        injectReservationBanner(r);
      } catch (e) {
        // ignore
      }
    })();
  }, [roomId]);
  /* -------------------------------- STOMP -------------------------------- */
  useEffect(() => {
    if (!roomId) return;
    if (stompClient.current?.connected) return;

    const ws = new WebSocket(WS_ENDPOINT);
    const stomp = Stomp.over(ws);
    stomp.debug = () => {};

    stomp.connect({}, () => {
      stomp.subscribe(`/sub/chat/room/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, newMessage]);
      });
      stomp.subscribe('/user/queue/chat-errors', (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          const msg = payload?.message || t('chat.profanityWarning');
          const d = payload?.data;
          const extra = d?.predictionLevel ? ` (${d.predictionLevel}${typeof d.malicious === 'number' ? ", " + Math.round(d.malicious*100) + "%" : ''})` : '';
          setHasProfanity(true);
          setProfanityWarning(msg + extra);
          setTimeout(() => { setHasProfanity(false); setProfanityWarning(''); }, 6000);
        } catch (e) { /* ignore */ }
      });
      stompClient.current = stomp;
    });

    return () => {
      try { stomp.disconnect(() => { stompClient.current = null; }); } catch { stompClient.current = null; }
    };
  }, [roomId]);

  /* ----------------------------- ✅ SSE 구독 ----------------------------- */
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    if (!token) return;

    const url = SSE_ENDPOINT(token);
    if (!url) { console.warn('[SSE] skipped: missing BACKEND_ORIGIN'); return; }
    console.log('[SSE] connecting:', url);

    const es = new EventSource(url, { withCredentials: false });
    sseRef.current = es;

    const handleNotify = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (!data) return;
        const sameRoom = roomId && Number(data.roomId) === Number(roomId);
        if (!sameRoom) return;

        const st = String(data.status || '').toUpperCase();

        if (data.type === 'RESERVATION_REQUESTED' || st === 'REQUESTED') {
          if (data.reservationId) setReservationId(data.reservationId);
          setIsPending(true);
          setIsReserved(false);
          setIsCompleted(false);
          setMessages(prev => ([
            ...prev,
            { id: Date.now(), type: 'system', message: buildReservationText(data, 'REQUESTED'), sentAt: new Date().toISOString() , meta: { reservationBanner: true } }
          ]));
        }

        if (data.type === 'RESERVATION_CONFIRMED' || st === 'CONFIRMED') {
          setIsPending(false);
          setIsReserved(true);
          setIsCompleted(false);
          setPostStatus('reserved');
          setMessages(prev => ([
            ...prev,
            { id: Date.now(), type: 'system', message: buildReservationText(data, 'CONFIRMED'), sentAt: new Date().toISOString() , meta: { reservationBanner: true } }
          ]));
        }

        if (data.type === 'RESERVATION_CANCELED' || st === 'CANCELED') {
          setIsPending(false);
          setIsReserved(false);
          setIsCompleted(false);
          setPostStatus('for_sale');
          setMessages(prev => ([
            ...prev,
            { id: Date.now(), type: 'system', message: t('chat.systemMessage.reservationCancelledWithReason', { reason: data.reason }), cancel: true, sentAt: new Date().toISOString() }
          ]));
        }

        if (data.type === 'RESERVATION_COMPLETED' || st === 'COMPLETED') {
          setIsPending(false);
          setIsReserved(false);
          setIsCompleted(true);
          setPostStatus('sold_out');
          setMessages(prev => ([
            ...prev,
            { id: Date.now(), type: 'system', message: t('chat.systemMessage.transactionCompleted'), sentAt: new Date().toISOString() }
          ]));
        }
      } catch (e) {
        // ignore
      }
    };

    es.addEventListener('notification', handleNotify);
    es.onmessage = handleNotify;

    es.onerror = () => {
      // 브라우저가 자동 재연결
    };

    return () => {
      try {
        es.removeEventListener('notification', handleNotify);
        es.close();
      } catch {}
      sseRef.current = null;
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !receiverId) return;
    if (hasProfanity) {
      alert(profanityWarning || t('chat.profanityWarning'));
      return;
    }
    if (!roomId) return;
    const client = stompClient.current;
    if (!client || !client.connected) return;

    const msgPayload = {
      roomId,
      salePostId,
      senderId,
      receiverId,
      message: newMessage.trim(),
      sentAt: new Date().toISOString()
    };

    client.send("/pub/chat.sendMessage", {}, JSON.stringify(msgPayload));
    setNewMessage('');
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleRetryClick = (messageId) => { setRetryMessageId(messageId); setShowRetryModal(true); };
  const handleRetryConfirm = async () => { if (retryMessageId) { setShowRetryModal(false);  setRetryMessageId(null);} };
  const handleRetryCancel = () => { setShowRetryModal(false); setRetryMessageId(null); };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setNewMessage(text);
    if (detectProfanity(text)) {
      setHasProfanity(true);
      setProfanityWarning(t('chat.profanityWarning'));
    } else {
      setHasProfanity(false);
      setProfanityWarning('');
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      [t('chat.quickAction.price')]: t('chat.quickAction.priceMessage'),
      [t('chat.quickAction.condition')]: t('chat.quickAction.conditionMessage')
    };
    setNewMessage(quickMessages[action]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const getToday = () => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  /* -------------------------------- 예약/신고/완료 -------------------------------- */

  const handleReserve = async () => {
    if (!salePostId) { setShowReserveModal(true); return; }
    try {
      const latest = await fetchPost(salePostId);
      const st = latest?.status ? toLocalStatus(latest.status) : toLocalStatus(postStatus);
      setPostStatus(st || null);
      if (st === 'reserved') { alert(t('chat.alreadyReserved')); return; }
      if (st === 'sold_out') { alert(t('chat.alreadySold')); return; }
    } catch (e) {
    }
    setShowReserveModal(true);
  };

  // 예약 요청(구매자)
  const handleReserveConfirm = async () => {
    if (!selectedPlace || !selectedDate) { alert(t('chat.selectPlaceAndDate')); return; }
    try {
      if (salePostId) {
        const latest = await fetchPost(salePostId);
        const st = latest?.status ? toLocalStatus(latest.status) : toLocalStatus(postStatus);
        if (st === 'reserved') { alert(t('chat.alreadyReserved')); return; }
        if (st === 'sold_out') { alert(t('chat.alreadySold')); return; }
      }

      const base = {
        meetType,
        placeLabel: selectedPlace,
        reservedAt: (selectedDate?.iso || selectedDate?.date || selectedDate)
      };
      const payload =
          meetType === 'on'
              ? { ...base, oncampusPlaceCode: campusSuggest?.midCode || sellerDefault.oncampusPlaceCode || null, offcampusStationCode: null }
              : { ...base, oncampusPlaceCode: null, offcampusStationCode: offSuggest?.midStation || sellerDefault.offcampusStationCode || null };

      const res = await apiUpsertReservation(roomId, payload);

      setReservationId(res.id);
      const stNow = String(res.status || '').toUpperCase();
      setIsPending(stNow === 'REQUESTED');
      setIsReserved(stNow === 'CONFIRMED');
      setIsCompleted(stNow === 'COMPLETED');
      setReserveConfirmed(true);
      setShowReserveModal(false);

      setMessages(prev => ([
        ...prev,
        { id: Date.now(), type: 'system', message: buildReservationText({ reservedAt: (selectedDate?.iso || selectedDate?.date || selectedDate), placeLabel: selectedPlace }, 'REQUESTED'), sentAt: new Date().toISOString() }
      ]));
    } catch (e) {
      alert(t('chat.reservationFailed'));
    }
  };

  // 판매자: 예약 수락
  const handleAcceptReservation = async () => {
    if (!reservationId) return;
    try {
      const res = await apiAcceptReservation(roomId, reservationId);

      setIsPending(false);
      setIsReserved(true);
      setIsCompleted(false);

      // 게시글 상태 reserved + buyerId 필수 전달
      try {
        if (salePostId && buyerId) {
          await patchPostStatus(salePostId, 'reserved', buyerId); // ← 핵심
          setPostStatus('reserved');
        }
      } catch (e) {
        console.error('게시글 상태 reserved 설정 실패:', e);
      }

      setMessages(prev => ([
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          message: '판매자가 예약을 수락했습니다. 예약이 확정되었습니다.',
          sentAt: new Date().toISOString()
        }
      ]));
    } catch (e) {
      console.error(e);
      alert('예약 수락에 실패했습니다.');
    }
  };

  // 판매자: 예약 거절(=취소)
  const handleDeclineReservation = async () => {
    if (!reservationId) return;
    try {
      await apiCancelReservation(roomId, reservationId, t('chat.systemMessage.declinedBySeller'));
      setIsPending(false);
      setIsReserved(false);
      setMessages(prev => ([
        ...prev,
        { id: Date.now(), type: 'system', message: t('chat.systemMessage.reservationDeclined'), cancel: true, sentAt: new Date().toISOString() }
      ]));
      // 게시글 상태 복구
      try {
        if (salePostId) { await patchPostStatus(salePostId, 'for_sale'); setPostStatus('for_sale'); }
      } catch {}
    } catch (e) {
      alert(t('chat.reservationDeclineFailed'));
    }
  };

  const handleCancelReserve = () => { setShowCancelModal(true); };

  const handleCancelConfirm = async () => {
    try {
      if (!reservationId) { setShowCancelModal(false); return; }
      await apiCancelReservation(roomId, reservationId, cancelReason || '');
      setIsPending(false);
      setIsReserved(false);
      setShowCancelModal(false);
      setMessages(prev => ([
        ...prev,
        { id: Date.now(), type: 'system', message: t('chat.systemMessage.reservationCancelledWithReason', { reason: cancelReason }), cancel: true, sentAt: new Date().toISOString() }
      ]));
      setCancelReason('');
      // 게시글 상태를 되돌림
      try {
        if (salePostId) { await patchPostStatus(salePostId, 'for_sale'); setPostStatus('for_sale'); }
      } catch {}
    } catch (e) {
      alert(t('chat.reservationCancelFailed'));
    }
  };

  const handleComplete = async () => {
    if (!reservationId) return;
    if (!isSeller) { alert('판매자만 거래 완료 처리할 수 있습니다.'); return; }
    if (isCompleted) { alert('이미 거래 완료 처리되었습니다. 완료 취소는 지원하지 않습니다.'); return; }

    try {
      await apiCompleteReservation(roomId, reservationId);

      setIsPending(false);
      setIsReserved(false);
      setIsCompleted(true);

      try {
        if (!salePostId) throw new Error('salePostId 없음');
        if (!buyerId) throw new Error('buyerId 없음(거래 상대 사용자 ID)');

        await patchPostStatus(salePostId, 'sold_out', buyerId); // ← 핵심
        setPostStatus('sold_out');
      } catch (e) {
        console.error('게시글 상태 sold_out 설정 실패:', e);
        alert('거래 완료는 처리됐지만, 게시글 상태 업데이트에 실패했습니다. (구매자 ID 필요)');
      }

      setMessages(prev => ([
        ...prev,
        { id: Date.now(), type: 'system', message: '거래가 완료되었습니다.', sentAt: new Date().toISOString() }
      ]));
    } catch (e) {
      console.error(e);
      alert('거래 완료 처리에 실패했습니다.');
    }
  };

  // ✅ 신고 모달 열기/제출 + 백엔드 전송
  const handleReport = () => {
    setShowReportModal(true);
    setReportReason('');
    setReportEtcText('');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const ABUSE_LABEL = t('chat.reportReasons.abuse');
    const FRAUD_LABEL = t('chat.reportReasons.fraud');
    const SPAM_LABEL  = t('chat.reportReasons.spam');
    const OTHER_LABEL = t('chat.reportReasons.other');

    if (!reportReason) return;
    const isOtherSelected = (
        reportReason === OTHER_LABEL ||
        reportReason === '기타' ||
        reportReason.toString().toUpperCase() === 'OTHER' ||
        reportReason === 'other'
    );
    if (isOtherSelected && !reportEtcText.trim()) return;
    if (!otherUserId) { alert(t('chat.reportTargetMissing')); return; }

    const reasonEnum = (() => {
      const val = reportReason.toString().toUpperCase();
      if (reportReason === ABUSE_LABEL || val === 'ABUSE' || reportReason === '욕설/비방') return 'ABUSE';
      if (reportReason === FRAUD_LABEL || val === 'FRAUD' || reportReason === '사기/허위매물') return 'FRAUD';
      if (reportReason === SPAM_LABEL  || val === 'SPAM'  || reportReason === '스팸/광고') return 'SPAM';
      if (reportReason === OTHER_LABEL || val === 'OTHER' || reportReason === '기타' || reportReason === 'other') return 'OTHER';
      return reportReason; // 이미 ENUM일 가능성
    })();

    try {
      const payload = {
        type: 'CHAT_ROOM',
        targetId: Number(otherUserId),
        chatRoomId: Number(roomId),
        reason: reasonEnum,
        ...(reasonEnum === 'OTHER' ? { detail: reportEtcText.trim() } : {})
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const responseText = await res.text().catch(()=> '');
        if (res.status === 409) {
          alert(t('chat.alreadyReported'));
        } else if (res.status === 400) {
          alert(responseText || t('chat.invalidReport'));
        } else if (res.status === 401) {
          alert(t('chat.loginRequired'));
        } else if (res.status === 404) {
          alert(t('chat.targetNotFound'));
        } else {
          alert(t('chat.reportError'));
        }
        setShowReportModal(false);
        return;
      }

      setShowReportModal(false);
      setShowReportExitModal(true);
    } catch (err) {
      alert(t('chat.reportFailed'));
      setShowReportModal(false);
    }
  };

  const handleReportExit = () => { setShowReportExitModal(false); navigate('/chat'); };

  const handleBack = () => { navigate('/chat'); };
  const formatTime = (timestamp) => { const date = new Date(timestamp); return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); };

  /* --------------------------- 스마트 예약 (날씨) -------------------------- */

  async function getCoords() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 37.5665, lng: 126.9780 });
      navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 37.5665, lng: 126.9780 }),
          { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  async function fetchWeeklyWeather({ lat, lng, sido }) {
    const q = new URLSearchParams({ lat, lng, ...(sido ? { sido } : {}) }).toString();
    const res = await fetch(`/api/weather/weekly?${q}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
    });
    if (!res.ok) throw new Error(t('chat.weatherError'));
    return res.json();
  }

  useEffect(() => {
    if (!showReserveModal) return;
    (async () => {
      try {
        setWeatherLoading(true);
        const { lat, lng } = await getCoords();
        const sido = '서울';
        const r = await fetchWeeklyWeather({ lat, lng, sido });
        setWeeklyWeather(r);
      } catch (e) {
        setWeeklyWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    })();
  }, [showReserveModal]);

  const dateOptions = (weeklyWeather?.days || []).map(d => {
    const isoRaw = d.date;
    const iso = normalizeDateTime(isoRaw);
    const dt = new Date(iso.replace(' ', 'T'));
    const label = dt.toLocaleDateString('ko-KR', { month:'2-digit', day:'2-digit', weekday:'short' });
    const pop = d.popAvg ?? 0;
    const weatherLabel = pop <= 20 ? '맑음' : pop <= 60 ? '구름' : '비';
    return {
      date: label, iso, pop, best: d.best,
      am: d.popAm, pm: d.popPm, weather: weatherLabel
    };
  });

  /* ---------------------------------- UI 가드 ---------------------------------- */
  if (chatId !== undefined && !roomId) {
    return (
        <div
            style={{
              maxWidth: 720,
              margin: '40px auto',
              padding: 24,
              border: '1px solid #eee',
              borderRadius: 12,
              background: '#fff',
            }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {t('chat.invalidChatRoomTitle')}
          </div>
          <div style={{ color: '#666', marginBottom: 16 }}>
            {t('chat.invalidChatRoomDescription')}
          </div>
          <button
              onClick={() => navigate('/chat')}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#111827',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
          >
            {t('chat.goToChatList')}
          </button>
        </div>
    );
  }

  /* ---------------------------------- JSX ---------------------------------- */

  return (
      <>
        <div className="header-spacer" />
        <ChatContainer>
          <ChatHeader>
            <HeaderLeft>
              <BackButton onClick={() => navigate('/chat')}>
                <FaArrowLeft />
              </BackButton>
              <ChatInfo>
                <UserAvatar><FaUser /></UserAvatar>
                <UserInfo>
                  <UserName>{messages.length > 0 && messages[0].sender === 'other' ? '김학생' : '학생'}</UserName>
                  <BookTitle>
                    <FaBook size={12} />
                    {messages.length > 0 && messages[0].message ? messages[0].message.split(' - ')[0] : ''}
                  </BookTitle>
                </UserInfo>
              </ChatInfo>
            </HeaderLeft>

            <HeaderRight style={{gap: 0}}>
              {/* 신고 버튼 */}
              <ChatMenuButton
                  onClick={() => { setShowReportModal(true); setReportReason(''); setReportEtcText(''); }}
                  title={t('chat.getLabel.reportLong')}
                  onMouseEnter={() => setHovered('report')}
                  onMouseLeave={() => setHovered('')}
              >
                <span style={{ color: iconColor('#ffb300', false, hovered==='report'), fontSize: '1.1em' }}>⚠️</span>
                {getLabel('report')}
              </ChatMenuButton>

              {/* 판매자 전용: 예약 수락/거절 */}
              {isSeller && isPending && (
                  <>
                    <ChatMenuButton
                        onClick={handleAcceptReservation}
                        title={t('chat.getLabel.acceptLong')}
                        onMouseEnter={() => setHovered('accept')}
                        onMouseLeave={() => setHovered('')}
                    >
                      <FaCheckCircle style={{ fontSize: '1.1em', color: iconColor('#1976d2', false, hovered==='accept') }} />
                      {getLabel('accept')}
                    </ChatMenuButton>

                    <ChatMenuButton
                        className="danger"
                        onClick={handleDeclineReservation}
                        title={t('chat.getLabel.declineLong')}
                        onMouseEnter={() => setHovered('decline')}
                        onMouseLeave={() => setHovered('')}
                    >
                      <FaExclamationCircle style={{ fontSize: '1.1em', color: iconColor('#ef4444', false, hovered==='decline') }} />
                      {getLabel('decline')}
                    </ChatMenuButton>
                  </>
              )}

              {/* 예약/예약취소 */}
              {(isPending || isReserved) ? (
                  (isBuyer || isSeller) && (
                      <ChatMenuButton
                          onClick={handleCancelReserve}
                          title={t('chat.getLabel.reserveCancelLong')}
                          disabled={isCompleted}
                          onMouseEnter={() => setHovered('reserve-cancel')}
                          onMouseLeave={() => setHovered('')}
                      >
                        <FaRegClock style={{ color: iconColor('#bfa100', false, hovered==='reserve-cancel'), fontSize: '1.1em' }} />
                        {getLabel('reserve-cancel')}
                      </ChatMenuButton>
                  )
              ) : (
                  isBuyer && (
                      <ChatMenuButton
                          onClick={handleReserve}
                          title={t('chat.getLabel.reserveLong')}
                          disabled={isCompleted || postStatus === 'reserved' || postStatus === 'sold_out'}
                          onMouseEnter={() => setHovered('reserve')}
                          onMouseLeave={() => setHovered('')}
                      >
                        <FaRegClock style={{ color: iconColor('#bfa100', false, hovered==='reserve'), fontSize: '1.1em' }} />
                        {getLabel('reserve')}
                      </ChatMenuButton>
                  )
              )}

              {/* 거래 완료(판매자 전용) */}
              {isSeller && (
                  <ChatMenuButton
                      onClick={handleComplete}
                      title={t('chat.getLabel.completeLong')}
                      disabled={!isReserved || isCompleted}
                      onMouseEnter={() => setHovered('complete')}
                      onMouseLeave={() => setHovered('')}
                  >
                    <FaCheckCircle style={{ color: iconColor('#1976d2', isCompleted, hovered==='complete'), fontSize: '1.1em' }} />
                    {getLabel('complete')}
                  </ChatMenuButton>
              )}

              <ExitButton onClick={() => { if(window.confirm(t('chat.confirmExit'))) navigate('/chat'); }} title={t('chat.exitChatRoom')}>
                <FaSignOutAlt /> {width > 600 && t('chat.exit')}
              </ExitButton>
            </HeaderRight>
          </ChatHeader>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '8px 0', fontSize: '0.95rem', color: '#666', gap: 8 }}>
            <FaCalendarAlt style={{ opacity: 0.7 }} />
            <span>{getToday()}</span>
          </div>

          {/* 예약 취소 모달 */}
          {showCancelModal && (
              <ModalOverlay>
                <ModalBox>
                  <ModalTitle>{t('chat.cancelReservationTitle')}</ModalTitle>
                  <ModalTextarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder={t('chat.cancelReservationPlaceholder')}
                  />
                  <ModalActions>
                    <ModalButton data-variant="cancel" onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>{t('common.cancel')}</ModalButton>
                    <ModalButton onClick={handleCancelConfirm} disabled={!cancelReason.trim()}>{t('common.confirm')}</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* 신고 모달 */}
          {showReportModal && (
              <ModalOverlay>
                <ModalBox as="form" onSubmit={handleReportSubmit}>
                  <ModalTitle>{t('chat.reportReasonTitle')}</ModalTitle>

                  <ReportRadio>
                    <RadioInput type="radio" name="report" value="욕설/비방"
                                checked={reportReason === '욕설/비방'}
                                onChange={e => setReportReason(e.target.value)} />
                    {t('chat.reportReasons.abuse')}
                  </ReportRadio>

                  <ReportRadio>
                    <RadioInput type="radio" name="report" value="사기/허위매물"
                                checked={reportReason === '사기/허위매물'}
                                onChange={e => setReportReason(e.target.value)} />
                    {t('chat.reportReasons.fraud')}
                  </ReportRadio>

                  <ReportRadio>
                    <RadioInput type="radio" name="report" value="스팸/광고"
                                checked={reportReason === '스팸/광고'}
                                onChange={e => setReportReason(e.target.value)} />
                    {t('chat.reportReasons.spam')}
                  </ReportRadio>

                  <ReportRadio>
                    <RadioInput type="radio" name="report" value="other"
                                checked={reportReason === 'other'}
                                onChange={e => setReportReason(e.target.value)} />
                    {t('chat.reportReasons.other')}
                  </ReportRadio>

                  {/* ✅ '기타' 선택 시 상세 사유 입력 */}
                  {reportReason === 'other' && (
                      <ModalTextarea
                          value={reportEtcText}
                          onChange={e => setReportEtcText(e.target.value)}
                          placeholder={t('chat.reportReasonPlaceholder')}
                      />
                  )}

                  <ModalActions>
                    <ModalButton data-variant="cancel" type="button" onClick={() => setShowReportModal(false)}>{t('common.cancel')}</ModalButton>
                    <ModalButton
                        type="submit"
                        disabled={!reportReason || (reportReason === '기타' && !reportEtcText.trim())}
                    >
                      {t('common.submit')}
                    </ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* 신고 후 나가기 확인 */}
          {showReportExitModal && (
              <ModalOverlay>
                <ModalBox>
                  <ModalTitle>{t('chat.reportSubmittedTitle')}</ModalTitle>
                  <ModalActions>
                    <ModalButton data-variant="cancel" onClick={() => setShowReportExitModal(false)}>{t('common.no')}</ModalButton>
                    <ModalButton onClick={() => { setShowReportExitModal(false); navigate('/chat'); }}>{t('common.yes')}</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* 스마트 예약 모달 */}
          {showReserveModal && (
              <ModalOverlay>
                <ReserveModalBox>
                  <ModalTitle>{t('chat.smartReserveTitle')}</ModalTitle>

                  {/* 거래 방식 선택 */}
                  <div style={{fontWeight:700, margin:'6px 0'}}>{t('chat.tradeType')}</div>
                  <div style={{display:'flex', gap:8, margin:'6px 0 12px'}}>
                    <button
                        type="button"
                        onClick={()=>setMeetType('on')}
                        style={{padding:'8px 12px', borderRadius:999, border:'1px solid '+(meetType==='on'?'#0b63d1':'#e5e7eb'), background:meetType==='on'?'#eaf2ff':'#fff', fontWeight:800, color:meetType==='on'?'#0b63d1':'#334155'}}
                    ><FaUniversity/> {t('chat.onCampus')}</button>
                    <button
                        type="button"
                        onClick={()=>setMeetType('off')}
                        style={{padding:'8px 12px', borderRadius:999, border:'1px solid '+(meetType==='off'?'#0b63d1':'#e5e7eb'), background:meetType==='off'?'#eaf2ff':'#fff', fontWeight:800, color:meetType==='off'?'#0b63d1':'#334155'}}
                    ><FaSubway/> {t('chat.offCampus')}</button>
                  </div>

                  {/* 판매자 설정 위치 */}
                  <div style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px', marginBottom:12}}>
                    <div style={{fontWeight:800, marginBottom:6}}>{t('chat.sellerLocation')}</div>
                    {meetType==='on' ? (
                        sellerDefault.oncampusPlaceCode
                            ? <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'#eef5ff',border:'1px solid #cfe2ff',padding:'6px 10px',borderRadius:999,fontWeight:800,color:'#0b63d1'}}>
                        <FaUniversity/>{ONCAMPUS_LABELS[sellerDefault.oncampusPlaceCode] || sellerDefault.oncampusPlaceCode}
                      </span>
                            : <span style={{color:'#64748b'}}>{t('chat.noSellerLocationOnCampus')}</span>
                    ) : (
                        sellerDefault.offcampusStationCode
                            ? <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'#eef5ff',border:'1px solid #cfe2ff',padding:'6px 10px',borderRadius:999,fontWeight:800,color:'#0b63d1'}}>
                        <FaSubway/>{`${getLineByStation(sellerDefault.offcampusStationCode) || ''} · ${sellerDefault.offcampusStationCode}`}
                      </span>
                            : <span style={{color:'#64748b'}}>{t('chat.noSellerLocationOffCampus')}</span>
                    )}
                  </div>

                  {/* 교내 / 교외 입력 + 중간지점 추천 */}
                  {meetType === 'on' ? (
                      <>
                        <div style={{fontWeight:700, marginBottom:8}}>{t('chat.buyerLocationOnCampus')}</div>
                        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:10, flexWrap:'wrap'}}>
                          <select
                              value={buyerCampusCode}
                              onChange={e=>{ setBuyerCampusCode(e.target.value); setCampusSuggest(null); }}
                              style={{padding:'10px', border:'1px solid #e5e7eb', borderRadius:8, minWidth:200, fontWeight:700}}
                          >
                            <option value="">{t('chat.selectBuilding')}</option>
                            {CAMPUS_OPTIONS.map(code => (
                                <option key={code} value={code}>{ONCAMPUS_LABELS[code] || code}</option>
                            ))}
                          </select>

                          <button
                              type="button"
                              onClick={()=>{
                                if(!sellerDefault.oncampusPlaceCode) return alert(t('chat.noSellerLocationOnCampus'));
                                if(!buyerCampusCode) return alert(t('chat.selectBuyerLocationOnCampus'));
                                const r = recommendOnCampus(sellerDefault.oncampusPlaceCode, buyerCampusCode);
                                if(!r) return alert(t('chat.noPathFound'));
                                setCampusSuggest(r);
                              }}
                              style={{padding:'10px 12px', borderRadius:8, border:'none', background:'#eef2f7', fontWeight:800, color:'#0b63d1'}}
                          >
                            <FaTrophy/> {t('chat.recommendMidpoint')}
                          </button>
                        </div>

                        {campusSuggest && (
                            <div style={{background:'#f1f5fe', border:'1px solid #dbeafe', padding:'12px', borderRadius:12, marginBottom:6}}>
                              <div style={{fontWeight:800, color:'#0b63d1', marginBottom:6}}>
                                {t('chat.recommendedMidpoint')}: {campusSuggest.midLabel}
                              </div>
                              <div style={{color:'#334155', marginBottom:8, fontSize:14}}>
                                {t('chat.shortestPath')}: {campusSuggest.path.map(c=>ONCAMPUS_LABELS[c]||c).join(' → ')}
                              </div>
                              <button type="button" onClick={()=>setSelectedPlace(`${t('chat.onCampus')} · ${campusSuggest.midLabel}`)}
                                      style={{padding:'8px 12px', borderRadius:8, border:'none', background:'#0b63d1', color:'#fff', fontWeight:800}}>
                                <FaMapMarkerAlt/> {t('chat.useThisLocation')}
                              </button>
                            </div>
                        )}
                      </>
                  ) : (
                      <>
                        <div style={{fontWeight:700, marginBottom:8}}>{t('chat.buyerLocationOffCampus')}</div>
                        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:10, flexWrap:'wrap'}}>
                          <select value={buyerLine} onChange={e=>{ setBuyerLine(e.target.value); setBuyerStation(''); setOffSuggest(null); }}
                                  style={{padding:'10px', border:'1px solid #e5e7eb', borderRadius:8, minWidth:160, fontWeight:700}}>
                            <option value="">{t('chat.selectLine')}</option>
                            {Object.keys(SUBWAY_MAP).map(line => <option key={line} value={line}>{line}</option>)}
                          </select>
                          <select value={buyerStation} onChange={e=>{ setBuyerStation(e.target.value); setOffSuggest(null); }} disabled={!buyerLine}
                                  style={{padding:'10px', border:'1px solid #e5e7eb', borderRadius:8, minWidth:180, fontWeight:700}}>
                            <option value="">{buyerLine ? t('chat.selectStation') : t('chat.selectLineFirst')}</option>
                            {(buyerLine ? getUniqueStations(buyerLine) : []).map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                          <button
                              type="button"
                              onClick={()=>{
                                if(!sellerDefault.offcampusStationCode) return alert(t('chat.noSellerLocationOffCampus'));
                                if(!buyerStation) return alert(t('chat.selectBuyerStation'));
                                const r = recommendOffCampus(sellerDefault.offcampusStationCode, buyerStation);
                                if(!r) return alert(t('chat.noPathFound'));
                                setOffSuggest(r);
                              }}
                              style={{padding:'10px 12px', borderRadius:8, border:'none', background:'#eef2f7', fontWeight:800, color:'#0b63d1'}}
                          >
                            <FaTrophy/> {t('chat.recommendMidpointStation')}
                          </button>
                        </div>

                        {offSuggest && (
                            <div style={{background:'#f1f5fe', border:'1px solid #dbeafe', padding:'12px', borderRadius:12, marginBottom:6}}>
                              <div style={{fontWeight:800, color:'#0b63d1', marginBottom:6}}>
                                {t('chat.recommendedMidpointStation')}: {getLineByStation(offSuggest.midStation) ? `${getLineByStation(offSuggest.midStation)} · ` : ''}{offSuggest.midStation}
                              </div>
                              <div style={{color:'#334155', marginBottom:8, fontSize:14}}>
                                {t('chat.optimalPath')}: {offSuggest.path.join(' → ')}
                              </div>
                              <button type="button" onClick={()=>setSelectedPlace(`${t('chat.offCampus')} · ${getLineByStation(offSuggest.midStation) ? getLineByStation(offSuggest.midStation)+' · ' : ''}${offSuggest.midStation}`)}
                                      style={{padding:'8px 12px', borderRadius:8, border:'none', background:'#0b63d1', color:'#fff', fontWeight:800}}>
                                <FaMapMarkerAlt/> {t('chat.useThisLocation')}
                              </button>
                            </div>
                        )}
                      </>
                  )}

                  {/* 선택된 장소 */}
                  <div style={{margin:'10px 0 14px', background:'#f8fafc', border:'1px dashed #cbd5e1', padding:'10px 12px', borderRadius:10}}>
                    <div style={{fontWeight:800, color:'#0f172a'}}><FaMapMarkerAlt/> {t('chat.selectedLocation')}</div>
                    <div style={{marginTop:6, color:'#334155'}}>{selectedPlace || t('chat.notSelectedYet')}</div>
                  </div>

                  {/* 추천 날짜 */}
                  <div style={{marginBottom:'1.2rem', fontWeight:600, color:'#111'}}>{t('chat.recommendedDate')}</div>
                  {weatherLoading && <div style={{color:'#555'}}>{t('chat.loadingWeather')}</div>}
                  {!weatherLoading && (
                      <DateList>
                        {dateOptions.map(opt => {
                          const h = Math.max(0, Math.min(100, opt.pop));
                          return (
                              <DateItem key={opt.iso} selected={selectedDate?.iso===opt.iso} onClick={()=>setSelectedDate(opt)}>
                                <MiniBarWrap><MiniBar style={{height: `${h}%`}}/></MiniBarWrap>
                                <div style={{display:'flex', flexDirection:'column', gap:4}}>
                                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                                    <span style={{fontWeight:700}}>{opt.date}</span>
                                    {opt.best && <span style={{fontSize:11, color:'#fff', background:'#16a34a', padding:'2px 6px', borderRadius:999}}>{t('chat.recommended')}</span>}
                                  </div>
                                  <div style={{fontSize:13, color:'#374151'}}>
                                    {opt.am!=null && opt.pm!=null
                                        ? <>{t('chat.am')} {opt.am}% / {t('chat.pm')} {opt.pm}% ({t('chat.avg')} {opt.pop}%)</>
                                        : <>{t('chat.precipitation')} {opt.pop}%</>}
                                  </div>
                                </div>
                              </DateItem>
                          );
                        })}
                      </DateList>
                  )}
                  {weeklyWeather?.recommendation && (
                      <div style={{marginTop:'6px', fontWeight:600, color:'#111827'}}>{weeklyWeather.recommendation}</div>
                  )}

                  <div style={{display:'flex', gap:'1rem', margin:'1.5rem 0 0 0', alignItems:'center'}}>
                    <ModalButton onClick={()=>setShowRoute(v=>!v)}><FaRoute /> {t('chat.routeGuidance')}</ModalButton>
                    <ModalButton onClick={handleReserveConfirm}><FaCheckCircle /> {t('chat.sendReservationRequest')}</ModalButton>
                    <ModalButton data-variant="cancel" onClick={()=>setShowReserveModal(false)}>{t('common.cancel')}</ModalButton>
                  </div>

                  {showRoute && (
                      <div style={{marginTop:'1.2rem', background:'#f5f8ff', borderRadius:'1rem', padding:'1rem', color:'#333'}}>
                        <b>{t('chat.estimatedRoute')}</b><br/>
                        {t('chat.apiIntegration')}<br/>
                        <span style={{fontSize:'0.95em'}}>{t('chat.myLocation')} → {selectedPlace || t('chat.noLocationSelected')} ({t('chat.estimatedTime')})</span>
                      </div>
                  )}

                  {reserveConfirmed && (
                      <div style={{marginTop:'1.2rem', background:'#eaf0ff', borderRadius:'1rem', padding:'1rem', color:'#2351e9', fontWeight:600}}>
                        {t('chat.reservationRequestSent')}
                      </div>
                  )}
                </ReserveModalBox>
              </ModalOverlay>
          )}

          <ChatMessages>
            {messages.length > 0 ? (
                messages.map(message => (
                    <MessageGroup key={message.messageId || message.id}>
                      {message.type === 'system' ? (
                          <SystemMessage className={message.cancel ? 'cancel' : ''}>
                            {message.message}
                          </SystemMessage>
                      ) : (
                          <>
                            <Message isOwn={message.senderId === currentUserId}>
                              {message.message}
                            </Message>
                            <MessageTime isOwn={message.senderId === currentUserId}>
                              {formatTime(message.sentAt)}
                            </MessageTime>
                            {message.senderId === currentUserId && message.status && (
                                <MessageStatusIndicator
                                    status={message.status}
                                    isOwn={true}
                                    onRetry={() => setShowRetryModal(true)}
                                />
                            )}
                          </>
                      )}
                    </MessageGroup>
                ))
            ) : (
                <NoMessages />
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            {profanityWarning && (
                <ProfanityWarning>
                  <FaExclamationCircle />
                  {profanityWarning}
                </ProfanityWarning>
            )}
            <InputContainer>
              <MessageInput
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.typeMessage')}
                  rows={1}
                  hasProfanity={hasProfanity}
              />
              <SendButton onClick={handleSendMessage} disabled={!newMessage.trim() || loading || hasProfanity || !roomId}>
                <FaPaperPlane />
              </SendButton>
            </InputContainer>
            <QuickActions>
              <QuickActionButton onClick={() => handleQuickAction(t('chat.quickAction.price'))}>{t('chat.quickAction.price')}</QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction(t('chat.quickAction.condition'))}>{t('chat.quickAction.condition')}</QuickActionButton>
            </QuickActions>
          </ChatInput>
        </ChatContainer>

        {/* 전송 재시도 모달 */}
        {showRetryModal && (
            <RetryModalOverlay onClick={() => setShowRetryModal(false)}>
              <RetryModalBox onClick={e => e.stopPropagation()}>
                <RetryModalTitle>{t('chat.retryTitle')}</RetryModalTitle>
                <RetryModalMessage>{t('chat.retryMessage')}</RetryModalMessage>
                <RetryModalActions>
                  <RetryModalButton className="cancel" onClick={() => setShowRetryModal(false)}>{t('common.cancel')}</RetryModalButton>
                  <RetryModalButton className="confirm" onClick={() => setShowRetryModal(false)}>{t('chat.retry')}</RetryModalButton>
                </RetryModalActions>
              </RetryModalBox>
            </RetryModalOverlay>
        )}
      </>
  );
};

const MessageStatusIndicator = ({ status, isOwn, onRetry }) => {
  const { t } = useTranslation();
  const getStatusText = () => {
    switch (status) {
      case 'sending': return t('chat.messageStatus.sending');
      case 'read': return t('chat.messageStatus.read');
      case 'failed': return t('chat.messageStatus.failed');
      default: return '';
    }
  };
  const getStatusIcon = () => {
    switch (status) {
      case 'sending': return '⏳';
      case 'read': return <FaEye size={10} />;
      case 'failed': return <FaExclamationCircle size={10} />;
      default: return '';
    }
  };
  return (
      <MessageStatus isOwn={isOwn}>
        <StatusIcon $status={status}>{getStatusIcon()}</StatusIcon>
        <span>{getStatusText()}</span>
        {status === 'failed' && onRetry && (
            <RetryButton onClick={onRetry} title={t('chat.retry')}>↻</RetryButton>
        )}
      </MessageStatus>
  );
};

/* --------------------------------- 비속어 --------------------------------- */
function detectProfanity(text) {
  if (!text) return false;
  const bad = ['씨발','개새끼','병신','미친','fuck','shit','bitch','asshole','damn','hell'];
  const s = String(text).toLowerCase();
  return bad.some(w => s.includes(w));
}

export default ChatRoom;
