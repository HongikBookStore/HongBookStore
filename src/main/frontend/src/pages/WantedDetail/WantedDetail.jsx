// src/pages/WantedDetail/WantedDetail.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBook, FaTag, FaUser, FaClock, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import WarningModal from '../../components/WarningModal/WarningModal';
import WantedComments from '../../components/Comments/WantedComments';
import { useWriting } from '../../contexts/WritingContext';

/* ----------------------------- styled components ----------------------------- */
const PageWrapper = styled.div`
    display: flex; flex-direction: row; align-items: flex-start; width: 100%;
`;
const Container = styled.div` padding: 28px; box-sizing: border-box; `;

const TopBar = styled.div`
    display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px;
`;
const BackButton = styled.button`
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px;
    background: #f3f4f6; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
`;

const Actions = styled.div` display: flex; gap: 8px; `;
const Button = styled.button`
    padding: 10px 14px; border-radius: 10px;
    border: 1px solid ${p => (p.$variant === 'danger' ? '#dc3545' : p.$variant === 'ghost' ? '#e5e7eb' : '#e5e7eb')};
    background: ${p =>
            p.$variant === 'primary' ? '#0d6efd'
                    : p.$variant === 'danger' ? '#fff5f5'
                            : '#fff'};
    color: ${p =>
            p.$variant === 'primary' ? '#fff'
                    : p.$variant === 'danger' ? '#dc3545'
                            : '#111'};
    font-weight: 700; cursor: pointer; transition: .15s ease;
    &:hover{ transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
    &:disabled{ opacity: .6; cursor: not-allowed; transform:none; box-shadow:none; }
`;

const HeaderCard = styled.div` background: #fff; border: 1px solid #e9ecef; border-radius: 14px; padding: 22px; margin-bottom: 18px; `;
const TitleRow = styled.div`
    display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px;
`;
const Title = styled.h1` font-size: 1.9rem; margin: 0; color: #222; `;
const ReportTitleButton = styled.button`
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: #fff5f5;
    color: #dc2626;
    border: 2px solid #fecaca;
    border-radius: 10px;
    font-weight: 800;
    cursor: pointer;
    transition: .15s ease;
    white-space: nowrap;
    &:hover{ background:#dc2626; color:#fff; border-color:#dc2626; transform: translateY(-1px); }
`;

const MetaRow = styled.div` display: flex; flex-wrap: wrap; gap: 8px; `;

const Chip = styled.span`
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid #e5e7eb; background: #f8fafc; color: #374151; font-weight: 600; font-size: 0.9rem; border-radius: 999px; padding: 6px 12px;
`;
const PriceChip = styled(Chip)` background: #eef5ff; border-color: #d7e7ff; color: #0d6efd; `;
const ConditionChip = styled(Chip)`
    background: ${({$lv}) => $lv === '상' ? '#eaf7ee' : $lv === '중' ? '#fff6e5' : $lv === '하' ? '#fdeaea' : '#f8fafc'};
    border-color: ${({$lv}) => $lv === '상' ? '#cfeedd' : $lv === '중' ? '#ffe7bf' : $lv === '하' ? '#f7c7c7' : '#e5e7eb'};
    color: ${({$lv}) => $lv === '상' ? '#2e7d32' : $lv === '중' ? '#b26a00' : $lv === '하' ? '#c62828' : '#374151'};
`;
const SubMeta = styled.div` display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px; color: #6b7280; font-size: .92rem; `;

const Layout = styled.div`
    display: grid; grid-template-columns: 2fr 1fr; gap: 18px; margin-top: 6px;
    @media (max-width: 980px){ grid-template-columns: 1fr; }
`;
const Card = styled.div` background: #fff; border: 1px solid #e9ecef; border-radius: 14px; padding: 22px; `;
const SectionTitle = styled.h3` margin: 0 0 12px 0; font-size: 1.15rem; color: #333; display:flex; align-items:center; gap:8px; `;
const BodyText = styled.div` color: #374151; line-height: 1.7; white-space: pre-wrap; `;
const InfoGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 12px; @media (max-width: 600px){ grid-template-columns: 1fr; } `;
const InfoItem = styled.div` border: 1px solid #eef2f6; border-radius: 10px; padding: 14px; background: #fafcff; `;
const Label = styled.div` color: #6b7280; font-size: .9rem; margin-bottom: 6px; `;
const Value = styled.div` color: #222; font-weight: 700; `;
const Small = styled.div` font-size: .86rem; color: #6b7280; `;

/* ----------------------------- 신고 모달 스타일 ----------------------------- */
const ModalOverlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const ModalBox = styled.div`
    background: #fff; border-radius: 12px; padding: 32px 24px 24px 24px; min-width: 320px; max-width: 560px; width: 92vw;
    box-shadow: 0 2px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px;
`;
const ModalTitle = styled.div` font-size: 1.1rem; font-weight: 600; `;
const ModalActions = styled.div` display: flex; gap: 10px; justify-content: flex-end; `;
const ModalButton = styled.button`
    padding: 8px 16px; border-radius: 8px; border: none; background: #007bff; color: #fff; font-weight: 600; cursor: pointer;
    &:hover { background: #0056b3; }
    &[data-variant='cancel'] { background: #ccc; color: #333; &:hover { background: #bbb; } }
`;
const ReportRadio = styled.label`
    display: flex; align-items: center; gap: 8px; padding: 8px 0; cursor: pointer; font-size: 0.95rem;
    &:hover { color: #007bff; }
`;
const RadioInput = styled.input` margin: 0; cursor: pointer; `;
const ModalTextarea = styled.textarea`
    width: 100%; min-height: 80px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; font-size: 1rem; resize: vertical;
`;

/* ---------------------------------- helpers ---------------------------------- */
function getAuthHeader() {
    const token = localStorage.getItem('accessToken') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ 상태 문자열을 UI 친화적으로 정규화 (상/중/하)
function normalizeCondition(v) {
    const t = (v ?? '').toString().trim();
    const up = t.toUpperCase();
    if (up === 'HIGH' || t === '상') return '상';
    if (up === 'MEDIUM' || t === '중') return '중';
    if (up === 'LOW' || t === '하') return '하';
    return t || '미지정';
}

export default function WantedDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setUnsavedChanges, stopWriting } = useWriting();

    const [data, setData] = useState(null);
    const [mine, setMine] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ✅ 신고 모달 상태 (ChatRoom의 신고 모달 디자인 이식 + '기타' 세부 사유)
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportEtcText, setReportEtcText] = useState('');
    const [showReportExitModal, setShowReportExitModal] = useState(false);

    // ✅ 사이드바 메뉴 핸들러
    const handleSidebarMenu = (menu) => {
        switch (menu) {
            case 'booksale': navigate('/bookstore/add'); break;
            case 'wanted': navigate('/wanted'); break;
            case 'mybookstore': navigate('/bookstore'); break;
            case 'chat': navigate('/chat'); break;
            case 'comments': {
                const el = document.querySelector('[data-section="comments"]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            }
            case 'detail': {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            }
            default: break;
        }
    };

    // 상세 조회
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/wanted/${id}`);
                const ct = res.headers.get('content-type') || '';
                if (!res.ok) {
                    const msg = ct.includes('application/json') ? (await res.json())?.message : await res.text();
                    throw new Error(msg || `상세 조회 실패 (${res.status})`);
                }
                const json = ct.includes('application/json') ? await res.json() : null;
                const detail =
                    json && typeof json === 'object'
                        ? (('success' in json && json.success === false) ? null
                            : (('data' in json) ? json.data : json))
                        : json;

                if (alive) {
                    setData(detail || null);
                    // 내 글 여부
                    try {
                        const myId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}')?.id;
                        setMine(myId != null && String(myId) === String(detail?.requesterId));
                    } catch { /* ignore */ }
                }
            } catch (e) {
                console.error(e);
                if (alive) setData(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id]);

    // 본문 표시용 작성자
    const displayAuthor = data?.requesterNickname || data?.requesterName || '익명 사용자';

    /* ------------------------------ 삭제 핸들러 ------------------------------ */
    const openDelete = () => {
        stopWriting();
        setUnsavedChanges(false);
        setShowDeleteModal(true);
    };

    const onDelete = async () => {
        stopWriting();
        setUnsavedChanges(false);
        try {
            const headers = {
                ...getAuthHeader(),
            };
            // 일부 백엔드가 X-User-Id를 요구할 수 있으므로 보조 헤더 추가
            let userId = localStorage.getItem('userId');
            if (!userId) {
                try { userId = JSON.parse(localStorage.getItem('user') || '{}')?.id; } catch {}
            }
            if (userId) headers['X-User-Id'] = String(userId);

            const res = await fetch(`/api/wanted/${id}`, { method: 'DELETE', headers });
            if (res.status === 204) {
                setShowDeleteModal(false);
                navigate('/wanted');
                return;
            }
            let message = `삭제 실패 (${res.status})`;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                const d = await res.json().catch(() => null);
                if (d?.message) message = d.message;
            } else {
                const t = await res.text().catch(() => '');
                if (t) message = t;
            }
            throw new Error(message);
        } catch (err) {
            console.error('❌ onDelete error:', err);
            const msg = String(err?.message || '');
            if (msg.includes('권한') || msg.includes('403')) {
                alert('삭제 권한이 없습니다. 본인이 작성한 글만 삭제할 수 있습니다.');
            } else if (msg.includes('401')) {
                alert('로그인이 필요합니다. 다시 로그인해 주세요.');
                navigate('/login');
            } else {
                alert(msg || '삭제 중 오류가 발생했습니다.');
            }
        }
    };

    /* ------------------------------ 신고 핸들러 ------------------------------ */
    const openReport = () => {
        setReportReason('');
        setReportEtcText('');
        setShowReportModal(true);
    };

    // 실제 신고 API 시도 (없어도 동작하며 실패해도 UX 유지)
    const submitReport = async () => {
        try {
            const reasonText = reportReason === '기타'
                ? (reportEtcText || '기타')
                : reportReason;

            const payload = {
                type: 'WANTED',
                targetId: String(id),
                reason: (reportReason === '기타' ? 'OTHER' : reasonText),
                ...(reportReason === '기타' ? { detail: reportEtcText.trim() } : {})
            };
            await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(payload),
            }).catch(() => null);
        } catch { /* 무시: 실패해도 다음 단계 진행 */ }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason) return;
        if (reportReason === '기타' && !reportEtcText.trim()) return;
        setShowReportModal(false);
        await submitReport();
        setShowReportExitModal(true);
    };

    const handleReportExit = () => {
        setShowReportExitModal(false);
        navigate('/wanted');
    };

    /* ------------------------------ 렌더링 가드 ------------------------------ */
    if (loading) {
        return (
            <PageWrapper>
                <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
                <MainContent>
                    <Container><Card>불러오는 중…</Card></Container>
                </MainContent>
            </PageWrapper>
        );
    }

    if (!data) {
        return (
            <PageWrapper>
                <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
                <MainContent>
                    <Container>
                        <Card>해당 글을 찾을 수 없습니다.</Card>
                        <div style={{ marginTop: 12 }}><Button onClick={() => navigate('/wanted')}>목록으로</Button></div>
                    </Container>
                </MainContent>
            </PageWrapper>
        );
    }

    // ✅ 상태/카테고리/날짜/조회수 등 표시용 파생값
    const conditionKor = normalizeCondition(data.condition);
    const createdAt = data.createdAt ? new Date(data.createdAt) : null;
    const views = (typeof data.views !== 'undefined' ? Number(data.views) : (typeof data.viewCount !== 'undefined' ? Number(data.viewCount) : null));
    const rawCategory = (data.category || '').trim();
    const displayCategory = data.department
        ? `${(rawCategory.split('>')[0]?.trim() || rawCategory || '전공')} / ${data.department}`
        : (rawCategory.split('>').pop()?.trim() || rawCategory || '-');

    return (
        <PageWrapper>
            {/* ✅ 목록 페이지와 동일한 onMenuClick을 연결 */}
            <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
            <MainContent>
                <Container>
                    <TopBar>
                        <BackButton onClick={() => navigate(-1)}><FaArrowLeft /> 뒤로가기</BackButton>
                        <Actions>
                            <Button onClick={() => navigate('/wanted')}>목록</Button>
                            {mine ? (
                                <>
                                    <Button $variant="primary" onClick={() => navigate(`/wanted/write/${id}`)}>수정</Button>
                                    <Button $variant="danger" onClick={openDelete}>삭제</Button>
                                </>
                            ) : null /* 신고 버튼은 제목 옆으로 이동 */}
                        </Actions>
                    </TopBar>

                    {/* 헤더 */}
                    <HeaderCard>
                        <TitleRow>
                            <Title>{data.title}</Title>
                            {!mine && (
                                <ReportTitleButton title="신고하기" onClick={openReport}>
                                    <FaExclamationTriangle />
                                    신고
                                </ReportTitleButton>
                            )}
                        </TitleRow>

                        <MetaRow>
                            <Chip><FaUser /> {displayAuthor}</Chip>
                            <ConditionChip $lv={conditionKor}><FaTag /> 상태: {conditionKor}</ConditionChip>
                            <PriceChip><FaTag /> 희망가: {Number(data.price || 0).toLocaleString()}원</PriceChip>
                        </MetaRow>
                        <SubMeta>
                            {displayCategory && <span><FaBook /> {displayCategory}</span>}
                            {createdAt && <span><FaClock /> 작성일: {createdAt.toLocaleString('ko-KR')}</span>}
                            {views !== null && <span><FaEye /> 조회수: {views.toLocaleString()}</span>}
                        </SubMeta>
                    </HeaderCard>

                    {/* 본문 / 요약 / 댓글 */}
                    <Layout>
                        <div>
                            <Card>
                                <SectionTitle><FaBook /> 요청 내용</SectionTitle>
                                {data.contentToxic && (
                                    <div style={{
                                        marginBottom: 10,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: '#fff3cd',
                                        border: '1px solid #ffeeba',
                                        color: '#856404',
                                        fontSize: '0.92rem'
                                    }}>
                                        ⚠️ 부적절한 표현이 감지되었습니다
                                        {data.contentToxicLevel && (
                                            <> ({data.contentToxicLevel}{typeof data.contentToxicMalicious === 'number' ? `, ${Math.round(data.contentToxicMalicious*100)}%` : ''})</>
                                        )}
                                    </div>
                                )}
                                {data.content ? (
                                    <BodyText>{data.content}</BodyText>
                                ) : (
                                    <Small>작성된 설명이 없습니다.</Small>
                                )}
                            </Card>

                            {/* 댓글 섹션 */}
                            <div data-section="comments">
                                <WantedComments wantedId={id} />
                            </div>
                        </div>

                        <Card>
                            <SectionTitle><FaTag /> 요청 요약</SectionTitle>
                            <InfoGrid>
                                <InfoItem><Label>책 제목</Label><Value>{data.title || '-'}</Value></InfoItem>
                                <InfoItem><Label>저자</Label><Value>{data.author || '-'}</Value></InfoItem>
                                <InfoItem><Label>상태</Label><Value>{conditionKor}</Value></InfoItem>
                                <InfoItem><Label>희망 가격</Label><Value>{Number(data.price || 0).toLocaleString()}원</Value></InfoItem>
                                <InfoItem><Label>카테고리</Label><Value>{displayCategory}</Value></InfoItem>
                                <InfoItem><Label>작성자</Label><Value>{displayAuthor}</Value></InfoItem>
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

            {/* ✅ 신고 모달 (방금 넣은 디자인 + '기타' 세부 사유 입력) */}
            {showReportModal && (
                <ModalOverlay>
                    <ModalBox as="form" onSubmit={handleReportSubmit}>
                        <ModalTitle>신고 사유를 선택하세요</ModalTitle>

                        <ReportRadio>
                            <RadioInput
                                type="radio" name="report" value="욕설/비방"
                                checked={reportReason === '욕설/비방'}
                                onChange={e => setReportReason(e.target.value)}
                            />
                            욕설/비방
                        </ReportRadio>

                        <ReportRadio>
                            <RadioInput
                                type="radio" name="report" value="사기/허위매물"
                                checked={reportReason === '사기/허위매물'}
                                onChange={e => setReportReason(e.target.value)}
                            />
                            사기/허위매물
                        </ReportRadio>

                        <ReportRadio>
                            <RadioInput
                                type="radio" name="report" value="스팸/광고"
                                checked={reportReason === '스팸/광고'}
                                onChange={e => setReportReason(e.target.value)}
                            />
                            스팸/광고
                        </ReportRadio>

                        <ReportRadio>
                            <RadioInput
                                type="radio" name="report" value="기타"
                                checked={reportReason === '기타'}
                                onChange={e => setReportReason(e.target.value)}
                            />
                            기타
                        </ReportRadio>

                        {/* ✅ '기타' 선택 시 세부 사유 입력 */}
                        {reportReason === '기타' && (
                            <div>
                                <div style={{ marginBottom: 6, fontSize: '.92rem', color: '#555' }}>세부 사유</div>
                                <ModalTextarea
                                    value={reportEtcText}
                                    onChange={e => setReportEtcText(e.target.value)}
                                    placeholder="자세한 신고 사유를 입력해주세요."
                                />
                            </div>
                        )}

                        <ModalActions>
                            <ModalButton data-variant="cancel" type="button" onClick={() => setShowReportModal(false)}>취소</ModalButton>
                            <ModalButton type="submit" disabled={!reportReason || (reportReason === '기타' && !reportEtcText.trim())}>제출</ModalButton>
                        </ModalActions>
                    </ModalBox>
                </ModalOverlay>
            )}

            {/* ✅ 신고 후 나가기 확인 모달 */}
            {showReportExitModal && (
                <ModalOverlay>
                    <ModalBox>
                        <ModalTitle>신고가 접수되었습니다.<br/>목록으로 이동할까요?</ModalTitle>
                        <ModalActions>
                            <ModalButton data-variant="cancel" onClick={() => setShowReportExitModal(false)}>아니오</ModalButton>
                            <ModalButton onClick={handleReportExit}>예</ModalButton>
                        </ModalActions>
                    </ModalBox>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
}
