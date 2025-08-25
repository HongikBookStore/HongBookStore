import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBook, FaTag, FaUser, FaClock, FaEye } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import WarningModal from '../../components/WarningModal/WarningModal';
import WantedComments from '../../components/Comments/WantedComments';

const PageWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
`;

const Container = styled.div`
    padding: 28px;
    box-sizing: border-box;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
`;

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #6c757d;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    &:hover { background: #5a6268; }
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
`;

const Button = styled.button`
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid ${p => (p.$variant === 'danger' ? '#dc3545' : '#e5e7eb')};
    background: ${p => (p.$variant === 'primary' ? '#0d6efd' : p.$variant === 'danger' ? '#fff5f5' : '#fff')};
    color: ${p => (p.$variant === 'primary' ? '#fff' : p.$variant === 'danger' ? '#dc3545' : '#111')};
    font-weight: 700;
    cursor: pointer;
    transition: .15s ease;
    &:hover{
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,.06);
    }
    &:disabled{ opacity: .6; cursor: not-allowed; transform:none; box-shadow:none; }
`;

const HeaderCard = styled.div`
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 14px;
    padding: 22px;
    margin-bottom: 18px;
`;

const Title = styled.h1`
    font-size: 1.9rem;
    margin: 0 0 10px 0;
    color: #222;
`;

const MetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    color: #374151;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 999px;
    padding: 6px 12px;
`;

const PriceChip = styled(Chip)`
    background: #eef5ff;
    border-color: #d7e7ff;
    color: #0d6efd;
`;

const ConditionChip = styled(Chip)`
    background: ${({$lv}) =>
            $lv === '상' ? '#eaf7ee' : $lv === '중' ? '#fff6e5' : '#fdeaea'};
    border-color: ${({$lv}) =>
            $lv === '상' ? '#cfeedd' : $lv === '중' ? '#ffe7bf' : '#f7c7c7'};
    color: ${({$lv}) =>
            $lv === '상' ? '#2e7d32' : $lv === '중' ? '#b26a00' : '#c62828'};
`;

const SubMeta = styled.div`
    display: flex; flex-wrap: wrap; gap: 14px;
    margin-top: 10px; color: #6b7280; font-size: .92rem;
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
    margin-top: 6px;
    @media (max-width: 980px){ grid-template-columns: 1fr; }
`;

const Card = styled.div`
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 14px;
    padding: 22px;
`;

const SectionTitle = styled.h3`
    margin: 0 0 12px 0; font-size: 1.15rem; color: #333; display:flex; align-items:center; gap:8px;
`;

const BodyText = styled.div`
    color: #374151;
    line-height: 1.7;
    white-space: pre-wrap;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    @media (max-width: 600px){ grid-template-columns: 1fr; }
`;

const InfoItem = styled.div`
    border: 1px solid #eef2f6;
    border-radius: 10px;
    padding: 14px;
    background: #fafcff;
`;

const Label = styled.div`
    color: #6b7280; font-size: .9rem; margin-bottom: 6px;
`;

const Value = styled.div`
    color: #222; font-weight: 700;
`;

const Small = styled.div`
    font-size: .86rem; color: #6b7280;
`;

export default function WantedDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [mine, setMine] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/wanted/${id}`);
                const ct = res.headers.get('content-type') || '';
                if (!res.ok) {
                    const msg = ct.includes('application/json') ? (await res.json())?.message : await res.text();
                    throw new Error(msg || `상세 조회 실패 (${res.status})`);
                }
                const json = ct.includes('application/json') ? await res.json() : null;
                const detail = json?.data || json;
                setData(detail);

                const myId = localStorage.getItem('userId');
                if (myId && detail?.requesterId && String(detail.requesterId) === String(myId)) {
                    setMine(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const onDelete = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/wanted/${id}`, {
                method: 'DELETE',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `삭제 실패 (${res.status})`);
            }
            setShowDeleteModal(false);
            navigate('/wanted');
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const openDelete = () => {
        setShowDeleteModal(true);
        // WarningModal 렌더 실패 대비 폴백
        setTimeout(() => {
            const mounted = document.querySelector('[data-warning-modal-open="true"]');
            if (!mounted) {
                if (window.confirm('정말 삭제할까요?\n삭제하면 되돌릴 수 없습니다.')) onDelete();
                else setShowDeleteModal(false);
            }
        }, 0);
    };

    if (loading) {
        return (
            <PageWrapper>
                <SidebarMenu />
                <MainContent>
                    <Container>
                        <Card>불러오는 중…</Card>
                    </Container>
                </MainContent>
            </PageWrapper>
        );
    }

    if (!data) {
        return (
            <PageWrapper>
                <SidebarMenu />
                <MainContent>
                    <Container>
                        <Card>해당 글을 찾을 수 없습니다.</Card>
                        <div style={{ marginTop: 12 }}>
                            <Button onClick={() => navigate('/wanted')}>목록으로</Button>
                        </div>
                    </Container>
                </MainContent>
            </PageWrapper>
        );
    }

    // ⬇️ 여기서부터는 data가 존재하므로 안전하게 파생값 계산
    const condition = (data.condition || '').trim(); // '상/중/하'
    const displayAuthor =
        data.requesterNickname || data.requesterName || data.author || '익명 사용자';
    const createdAt = data.createdAt ? new Date(data.createdAt) : null;
    const views = typeof data.views !== 'undefined' ? Number(data.views) : null;

    // 🔹 카테고리/학과 표시용 텍스트
    const rawCategory = (data.category || '').trim();
    const displayCategory = data.department
        ? `${(rawCategory.split('>')[0]?.trim() || rawCategory || '전공')} / ${data.department}`
        : (rawCategory.split('>').pop()?.trim() || rawCategory || '-');

    return (
        <PageWrapper>
            <SidebarMenu active="wanted" />
            <MainContent>
                <Container>
                    <TopBar>
                        <BackButton onClick={() => navigate(-1)}>
                            <FaArrowLeft /> 뒤로가기
                        </BackButton>
                        <Actions>
                            <Button onClick={() => navigate('/wanted')}>목록</Button>
                            {mine && (
                                <>
                                    <Button $variant="primary" onClick={() => navigate(`/wanted/write/${id}`)}>수정</Button>
                                    <Button $variant="danger" onClick={openDelete}>삭제</Button>
                                </>
                            )}
                        </Actions>
                    </TopBar>

                    {/* 헤더 박스 */}
                    <HeaderCard>
                        <Title>{data.title}</Title>

                        <MetaRow>
                            <Chip><FaUser /> {displayAuthor}</Chip>
                            <ConditionChip $lv={condition}><FaTag /> 상태: {condition || '미지정'}</ConditionChip>
                            <PriceChip><FaTag /> 희망가: {Number(data.price || 0).toLocaleString()}원</PriceChip>
                        </MetaRow>

                        <SubMeta>
                            {displayCategory && <span><FaBook /> {displayCategory}</span>}
                            {createdAt && <span><FaClock /> 작성일: {createdAt.toLocaleString('ko-KR')}</span>}
                            {views !== null && <span><FaEye /> 조회수: {views.toLocaleString()}</span>}
                        </SubMeta>
                    </HeaderCard>

                    {/* 본문 / 요약 */}
                    <Layout>
                        <div>
                            <Card>
                                <SectionTitle><FaBook /> 요청 내용</SectionTitle>
                                {data.content
                                    ? <BodyText>{data.content}</BodyText>
                                    : <Small>작성된 설명이 없습니다.</Small>}
                            </Card>

                            {/* ⬇️ 댓글 모듈 추가 */}
                            <WantedComments wantedId={id} />
                        </div>

                        <Card>
                            <SectionTitle><FaTag /> 요청 요약</SectionTitle>
                            <InfoGrid>
                                <InfoItem>
                                    <Label>책 제목</Label>
                                    <Value>{data.title || '-'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>저자</Label>
                                    <Value>{data.author || '-'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>상태</Label>
                                    <Value>{condition || '-'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>희망 가격</Label>
                                    <Value>{Number(data.price || 0).toLocaleString()}원</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>카테고리</Label>
                                    <Value>{displayCategory || '-'}</Value>
                                </InfoItem>
                                <InfoItem>
                                    <Label>작성자</Label>
                                    <Value>{displayAuthor}</Value>
                                </InfoItem>
                            </InfoGrid>
                        </Card>
                    </Layout>
                </Container>
            </MainContent>

            {/* 삭제 모달 */}
            <WarningModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={onDelete}
                onCancel={() => setShowDeleteModal(false)}
                type="wanted"
                title="정말 삭제할까요?"
                description="삭제하면 되돌릴 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
                showSaveDraft={false}
                data-warning-modal-open="true"
            />
        </PageWrapper>
    );
}
