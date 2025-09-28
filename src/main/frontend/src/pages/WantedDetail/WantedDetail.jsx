// src/pages/WantedDetail/WantedDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBook, FaTag, FaUser, FaClock, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import WarningModal from '../../components/WarningModal/WarningModal';
import WantedComments from '../../components/Comments/WantedComments';
import { useWriting } from '../../contexts/WritingContext';
import { displayMaskedName } from '../../utils/nameMask';
import { AuthCtx } from '../../contexts/AuthContext';

/* ----------------------------- styled components ----------------------------- */
const PageWrapper = styled.div`
    display: flex; flex-direction: row; align-items: flex-start; width: 100%;
`;
const ChatListContainer = styled.div`
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
`;
const BackButton = styled.button`
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; font-weight: 700; cursor: pointer;
    &:hover{ transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
`;
const ReportButton = styled.button`
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
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    color: #c62828;
    font-weight: 700;
    cursor: pointer;
    &:hover{ background:#dc2626; color:#fff; border-color:#dc2626; transform: translateY(-1px); }
`;

const MetaRow = styled.div` display: flex; flex-wrap: wrap; gap: 8px; `;

const Chip = styled.span`
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid #e5e7eb; background: #f8fafc; color: #374151; font-weight: 600; font-size: 0.9rem; border-radius: 999px; padding: 6px 12px;
`;
const PriceChip = styled(Chip)` background: #eef5ff; border-color: #d7e7ff; color: #0d6efd; `;
const ConditionChip = styled(Chip)`
    background: ${({$condition}) => $condition === 'HIGH' ? '#eaf7ea' : $condition === 'MEDIUM' ? '#fff6e5' : $condition === 'LOW' ? '#fdeaea' : '#f8fafc'};
    border-color: ${({$condition}) => $condition === 'HIGH' ? '#cfe9cf' : $condition === 'MEDIUM' ? '#ffe7bf' : $condition === 'LOW' ? '#f7c7c7' : '#e5e7eb'};
    color: ${({$condition}) => $condition === 'HIGH' ? '#2e7d32' : $condition === 'MEDIUM' ? '#b26a00' : $condition === 'LOW' ? '#c62828' : '#374151'};
`;
const SubMeta = styled.div` display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px; color: #6b7280; font-size: .92rem; `;

const Layout = styled.div`
    display: grid; grid-template-columns: 2fr 1fr; gap: 18px; margin-top: 6px;
    @media (max-width: 980px){ grid-template-columns: 1fr; }
`;
const Card = styled.div` background: #fff; border: 1px solid #e9ecef; border-radius: 14px; padding: 22px; `;
const SectionTitle = styled.h3` margin: 0 0 12px 0; font-size: 1.05rem; color: #333; display:flex; align-items:center; gap:8px; `;
const BodyText = styled.div` color: #374151; line-height: 1.7; white-space: pre-wrap; `;
const InfoGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 12px; @media (max-width: 600px){ grid-template-columns: 1fr; } `;
const InfoItem = styled.div` border: 1px solid #eef2f6; border-radius: 10px; padding: 14px; background: #fafcff; `;
const Label = styled.div` color: #6b7280; font-size: .9rem; margin-bottom: 6px; `;
const Value = styled.div` color: #222; font-weight: 700; `;
const Small = styled.div` font-size: .86rem; color: #6b7280; `;

/* ---------------------------------- helpers ---------------------------------- */
function getAuthHeader() {
    const token = localStorage.getItem('accessToken') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// 상태 문자열을 UI 친화적으로 정규화 (상/중/하)
function normalizeCondition(v, t) {
    const val = (v ?? '').toString().trim();
    const up = val.toUpperCase();
    if (up === 'HIGH' || val === t('wantedWrite.condition.high')) return t('wantedDetail.condition.high');
    if (up === 'MEDIUM' || val === t('wantedWrite.condition.medium')) return t('wantedDetail.condition.medium');
    if (up === 'LOW' || val === t('wantedWrite.condition.low')) return t('wantedDetail.condition.low');
    return val || t('wantedDetail.condition.unspecified');
}

// 카테고리 문자열 번역
function translateCategory(category, t) {
    if (!category) return '-';
    if (category === '교양') return t('wantedDetail.category.general');
    if (category === '전공') return t('wantedDetail.category.major');
    return category;
}

// 탈퇴 여부를 다양한 백엔드 표현에서 폭넓게 감지
function isDeactivatedFromDetail(d) {
    const status = (d?.requesterStatus ?? d?.userStatus ?? d?.status ?? '').toString().trim().toUpperCase();
    if (['DEACTIVATED','WITHDRAWN','WITHDRAW','DELETED'].includes(status)) return true;
    if (d?.requesterDeactivated || d?.userDeactivated) return true;
    if (d?.requesterDeletedAt || d?.userDeletedAt) return true;
    return false;
}

export default function WantedDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { setUnsavedChanges, stopWriting } = useWriting();

    const [data, setData] = useState(null);
    const [mine, setMine] = useState(false);
    const { user } = useContext(AuthCtx);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 신고 모달 상태
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportEtcText, setReportEtcText] = useState('');
    const [reportExit, setShowReportExitModal] = useState(false);

    const handleSidebarMenu = (menu) => {
        switch (menu) {
            case 'wanted': navigate('/wanted'); break;
            case 'list': navigate('/wanted'); break;
            case 'home': navigate('/'); break;
            case 'my': navigate('/mypage'); break;
            case 'detail': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
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
                    // 내 글 여부 (AuthCtx 기준)
                    try {
                        const myId = user?.id;
                        setMine(myId != null && String(myId) === String(detail?.requesterId));
                    } catch { /* ignore */ }
                }
            } catch (e) {
                if (alive) setData(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // 삭제
    const handleDelete = async () => {
        if (!window.confirm(t('wantedDetail.confirmDelete'))) return;
        stopWriting();
        setUnsavedChanges(false);
        try {
            const headers = { ...getAuthHeader() };
            // Authorization 기반으로만 삭제 권한 판정 (임의 헤더 금지)
            const res = await fetch(`/api/wanted/${id}`, { method: 'DELETE', headers });
            if (res.status === 204) {
                setShowDeleteModal(false);
                navigate('/wanted');
                return;
            }
            const ct = res.headers.get('content-type') || '';
            const msg = ct.includes('application/json') ? (await res.json())?.message : await res.text();
            throw new Error(msg || t('wantedDetail.deleteFailed'));
        } catch (e) {
            alert(e.message || t('wantedDetail.deleteFailed'));
        }
    };

    /* 신고 생성 */
    const submitReport = async () => {
        try {
            const reasonText = reportReason || '';
            const payload = {
                targetType: 'WANTED',
                targetId: Number(id),
                reason: (reportReason === '기타' ? 'OTHER' : reasonText),
                ...(reportReason === '기타' ? { detail: reportEtcText.trim() } : {})
            };
            await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(payload),
            }).catch(() => null);
        } catch { /* ignore */ }
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
                    <div style={{ padding: 24 }}>Loading...</div>
                </MainContent>
            </PageWrapper>
        );
    }

    if (!data) {
        return (
            <PageWrapper>
                <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
                <MainContent>
                    <div style={{ padding: 24, color:'#c62828' }}>{t('wantedDetail.loadFailed')}</div>
                </MainContent>
            </PageWrapper>
        );
    }

    const ownerMasked = displayMaskedName(data?.requesterNickname || data?.requesterName || data?.requesterUsername || '-');
    const isRequesterDeactivated = isDeactivatedFromDetail(data);

    return (
        <PageWrapper>
            <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
            <MainContent>
                <ChatListContainer>
                    <HeaderCard>
                        <TitleRow>
                            <div style={{display:'flex',gap:8}}>
                                <BackButton onClick={() => navigate('/wanted')}><FaArrowLeft /> {t('common.back')}</BackButton>
                                <ReportTitleButton onClick={() => setShowReportModal(true)}><FaExclamationTriangle/> {t('wantedDetail.report')}</ReportTitleButton>
                            </div>
                        </TitleRow>

                        <Title>{data.title}</Title>

                        <MetaRow>
                            <Chip><FaUser/> {ownerMasked}</Chip>
                            <Chip><FaTag/> {translateCategory(data?.category, t)}</Chip>
                            <Chip><FaEye/> {t('wantedDetail.views', { cnt: data?.viewCount ?? 0 })}</Chip>
                            <Chip><FaClock/> {data?.createdAt ? new Date(data.createdAt).toLocaleString() : ''}</Chip>
                        </MetaRow>

                        <div style={{marginTop:10}}>
                            <Actions>
                                {mine && (
                                    <Button $variant="danger" onClick={() => setShowDeleteModal(true)}>{t('common.delete')}</Button>
                                )}
                                {!mine && (
                                    <ReportButton onClick={() => setShowReportModal(true)}>{t('wantedDetail.report')}</ReportButton>
                                )}
                            </Actions>
                        </div>
                    </HeaderCard>

                    {/* 본문 / 요약 / 댓글 */}
                    <Layout>
                        <div>
                            <Card>
                                <SectionTitle><FaBook /> {t('wantedDetail.requestContent')}</SectionTitle>
                                {data.contentToxic && (
                                    <div style={{
                                        marginBottom: 10,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: '#fff3cd',
                                        border: '1px solid #ffeeba',
                                        color: '#856404',
                                        fontSize: '.9rem',
                                        fontWeight: 700
                                    }}>
                                        {t('wantedDetail.toxicWarn')}
                                    </div>
                                )}
                                <BodyText>{data.content}</BodyText>
                            </Card>

                            <Card>
                                <SectionTitle><FaBook /> {t('wantedDetail.comments')}</SectionTitle>
                                <WantedComments wantedId={Number(id)} />
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <SectionTitle>{t('wantedDetail.requesterInfo')}</SectionTitle>
                                <InfoGrid>
                                    <InfoItem>
                                        <Label>{t('wantedDetail.requester')}</Label>
                                        <Value>{ownerMasked}</Value>
                                        {isRequesterDeactivated && <Small>{t('wantedDetail.deactivated')}</Small>}
                                    </InfoItem>
                                    <InfoItem>
                                        <Label>{t('wantedDetail.condition')}</Label>
                                        <Value>{normalizeCondition(data?.desiredCondition, t)}</Value>
                                    </InfoItem>
                                </InfoGrid>
                            </Card>
                        </div>
                    </Layout>
                </ChatListContainer>
            </MainContent>

            {/* 삭제 확인 모달 */}
            {showDeleteModal && (
                <WarningModal
                    title={t('wantedDetail.confirmDeleteTitle')}
                    description={t('wantedDetail.confirmDeleteDesc')}
                    confirmText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* 신고 모달 */}
            {showReportModal && (
                <WarningModal
                    title={t('wantedDetail.reportTitle')}
                    description={
                        <form onSubmit={handleReportSubmit} style={{display:'flex',flexDirection:'column',gap:10}}>
                            <label><input type="radio" name="rr" value="스팸" onChange={(e)=>setReportReason(e.target.value)} /> 스팸/광고</label>
                            <label><input type="radio" name="rr" value="욕설" onChange={(e)=>setReportReason(e.target.value)} /> 욕설/혐오 표현</label>
                            <label><input type="radio" name="rr" value="불법" onChange={(e)=>setReportReason(e.target.value)} /> 불법/권리침해</label>
                            <label><input type="radio" name="rr" value="기타" onChange={(e)=>setReportReason(e.target.value)} /> 기타</label>
                            {reportReason === '기타' && (
                                <textarea value={reportEtcText} onChange={(e)=>setReportEtcText(e.target.value)} placeholder="신고 사유를 입력하세요" style={{width:'100%',minHeight:80}}/>
                            )}
                            <div style={{display:'flex',gap:8,marginTop:8}}>
                                <button type="submit" className="btn-primary">{t('common.submit')}</button>
                                <button type="button" onClick={()=>setShowReportModal(false)} className="btn">{t('common.cancel')}</button>
                            </div>
                        </form>
                    }
                    confirmText={t('common.submit')}
                    cancelText={t('common.cancel')}
                    onConfirm={handleReportSubmit}
                    onCancel={() => setShowReportModal(false)}
                />
            )}

            {/* 신고 완료 안내 */}
            {reportExit && (
                <WarningModal
                    title={t('wantedDetail.reportDoneTitle')}
                    description={t('wantedDetail.reportDoneDesc')}
                    confirmText={t('common.ok')}
                    onConfirm={handleReportExit}
                />
            )}
        </PageWrapper>
    );
}
