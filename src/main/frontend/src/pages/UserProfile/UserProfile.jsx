import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserPeerReviews, getUserPeerSummary } from '../../api/peerReviews';

const Container = styled.div`
  max-width: 1100px; margin: 0 auto; padding: 32px 16px; padding-top: 96px;
`;
const Header = styled.div`display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px;`;
const Title = styled.h1`font-size:1.6rem; color:#333; margin:0;`;
const Tabs = styled.div`display:flex; gap:8px; margin: 10px 0 16px;`;
const TabBtn = styled.button`
  padding: 8px 14px; border-radius: 16px; border:1px solid ${p=>p.$active?'#1976d2':'#e0e0e0'}; 
  background:${p=>p.$active?'#1976d2':'#fff'}; color:${p=>p.$active?'#fff':'#333'}; cursor:pointer;
`;
const Summary = styled.div`display:flex; gap:12px; margin-bottom:12px; flex-wrap:wrap;`;
const Badge = styled.div`padding:6px 10px; border:1px solid #e0e0e0; border-radius:8px; background:#f8f9fa;`;
const List = styled.ul`list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;`;
const Item = styled.li`display:flex; justify-content:space-between; border:1px solid #e0e0e0; border-radius:8px; padding:10px 12px;`;
const Pager = styled.div`display:flex; gap:8px; justify-content:flex-end; margin-top:12px;`;
const SmallBtn = styled.button`padding:6px 10px; border-radius:8px; border:1px solid #e0e0e0; background:#f8f9fa; cursor:pointer;`;

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('SELLER');
  const [sumSeller, setSumSeller] = useState(null);
  const [sumBuyer, setSumBuyer] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async (uid) => {
    try {
      const [s1, s2] = await Promise.all([
        getUserPeerSummary(uid, 'SELLER'),
        getUserPeerSummary(uid, 'BUYER')
      ]);
      setSumSeller(s1); setSumBuyer(s2);
    } catch (_) { setSumSeller(null); setSumBuyer(null); }
  }, []);

  const fetchList = useCallback(async (uid, r, p=0, z=size) => {
    setLoading(true); setError('');
    try {
      const data = await getUserPeerReviews(uid, r, p, z);
      setList(Array.isArray(data.content) ? data.content : []);
      setPage(typeof data.page === 'number' ? data.page : p);
      setSize(typeof data.size === 'number' ? data.size : z);
      setLast(Boolean(data.last));
    } catch (e) {
      setList([]); setError(e.response?.data?.message || '후기 목록을 불러오지 못했습니다.');
    } finally { setLoading(false); }
  }, [size]);

  useEffect(() => {
    if (!userId) return;
    fetchSummary(userId);
    fetchList(userId, role, 0, size);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchList(userId, role, 0, size);
  }, [role]);

  return (
    <Container>
      <Header>
        <Title>사용자 프로필 #{userId}</Title>
        <SmallBtn onClick={() => navigate(-1)}>뒤로</SmallBtn>
      </Header>

      <Summary>
        <Badge>판매자 평균 {Number(sumSeller?.averageScore ?? 0).toFixed(2)}★ · {sumSeller?.reviewCount ?? 0}건</Badge>
        <Badge>구매자 평균 {Number(sumBuyer?.averageScore ?? 0).toFixed(2)}★ · {sumBuyer?.reviewCount ?? 0}건</Badge>
      </Summary>

      <Tabs>
        <TabBtn $active={role==='SELLER'} onClick={() => setRole('SELLER')}>판매자 후기</TabBtn>
        <TabBtn $active={role==='BUYER'} onClick={() => setRole('BUYER')}>구매자 후기</TabBtn>
      </Tabs>

      {loading ? (
        <div style={{color:'#666'}}>불러오는 중...</div>
      ) : error ? (
        <div style={{color:'#d32f2f'}}>{error}</div>
      ) : list.length === 0 ? (
        <div style={{color:'#666'}}>등록된 후기가 없습니다.</div>
      ) : (
        <List>
          {list.map(rv => (
            <Item key={rv.reviewId}>
              <div>
                <div style={{fontWeight:600}}>{rv.reviewerNickname || '사용자'}</div>
                {Array.isArray(rv.ratingKeywords) && rv.ratingKeywords.length > 0 && (
                  <div style={{fontSize:'0.9rem', color:'#666'}}>{rv.ratingKeywords.join(', ')}</div>
                )}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span style={{fontSize:'0.85rem', color:'#555'}}>{rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('ko-KR') : ''}</span>
                <span style={{color:'#007bff', fontWeight:700}}>{Number(rv.ratingScore).toFixed(2)}★</span>
              </div>
            </Item>
          ))}
        </List>
      )}

      <Pager>
        <SmallBtn onClick={() => fetchList(userId, role, Math.max(0, page-1), size)} disabled={page<=0}>이전</SmallBtn>
        <SmallBtn onClick={() => !last && fetchList(userId, role, page+1, size)} disabled={last}>다음</SmallBtn>
      </Pager>
    </Container>
  );
};

export default UserProfile;

