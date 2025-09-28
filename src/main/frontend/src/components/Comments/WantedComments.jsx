// src/components/Comments/WantedComments.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaReply, FaTrash, FaUser, FaClock } from 'react-icons/fa';
import { displayMaskedName } from '../../utils/nameMask';

const Box = styled.div`
    margin-top: 18px;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 14px;
    padding: 22px;
`;

const Title = styled.h3`
    margin: 0 0 12px 0; font-size: 1.15rem; color: #333;
`;

const EditorRow = styled.div`
    display: flex; gap: 8px; align-items: flex-start; margin-bottom: 12px;
`;

const Textarea = styled.textarea`
    flex: 1; min-height: 90px; resize: vertical;
    border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px;
    outline: none; font-size: .95rem;
    &:focus { border-color: #0d6efd; }
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

const List = styled.ul`
    list-style: none; margin: 0; padding: 0;
`;

const Item = styled.li`
    padding: 14px 0;
    border-top: 1px solid #f1f3f5;
    &:first-child { border-top: 0; }
`;

const RepliesList = styled.ul`
    list-style: none;
    margin: 10px 0 0 26px;
    padding-left: 12px;
    border-left: 3px solid #eef2f6;
`;

const Meta = styled.div`
    display: flex; gap: 10px; align-items: center; color: #6b7280; font-size: .9rem; margin-bottom: 6px;
`;

const Content = styled.div`
    white-space: pre-wrap; color: ${p => p.$deleted ? '#9aa0a6' : '#222'};
`;

const Actions = styled.div`
    display: flex; gap: 8px; margin-top: 6px;
`;

const ReplyBox = styled.div`
    margin-top: 10px; margin-left: 26px;
`;

/** ---- Robust current-user inference (JWT → user object → legacy localStorage) ---- */
function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
        return JSON.parse(decodeURIComponent(escape(atob(padded))));
    } catch { return null; }
}
function toNum(v){ if (v==null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function getCurrentUserLocal() {
    const token = localStorage.getItem('accessToken') || '';
    let id = null, nickname = null;

    // 1) JWT payload 우선
    if (token) {
        const p = parseJwt(token);
        if (p) {
            id = toNum(p.id ?? p.userId ?? p.uid ?? p.sub ?? null);
            nickname = (p.nickname ?? p.name ?? p.preferred_username ?? null);
        }
    }
    // 2) 저장된 user 객체 보조
    if (id == null || !nickname) {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            if (id == null) id = toNum(u?.id);
            if (!nickname) nickname = u?.nickname ?? u?.name ?? null;
        } catch {}
    }
    // 3) 레거시 키 보조
    if (id == null) id = toNum(localStorage.getItem('userId'));
    if (!nickname) nickname = localStorage.getItem('nickname') || '익명';

    return { id, nickname };
}

/* ----------------------- helpers ----------------------- */
function authHeaders() {
    const token = localStorage.getItem('accessToken');
    const me = getCurrentUserLocal();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(me.id != null ? { 'X-USER-ID': String(me.id) } : {}),
        ...(me.nickname ? { 'X-USER-NICKNAME': me.nickname } : {}),
        'Content-Type': 'application/json',
    };
}

function toJsonSafely(res) {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return Promise.resolve(null);
}

function normalizeApiData(json) {
    if (!json) return [];
    const arr = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    return arr;
}

function buildTree(list) {
    const byId = new Map();
    list.forEach(c => {
        byId.set(c.id, { ...c, children: [] });
    });
    const roots = [];
    list.forEach(c => {
        const node = byId.get(c.id);
        if (c.parentId) {
            const p = byId.get(c.parentId);
            if (p) p.children.push(node);
            else roots.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
}

/* 작성자(배우) 객체의 탈퇴 여부만 본다. 댓글 자체의 status/deleted는 사용하지 않음 */
function isDeactivatedFromComment(c) {
    const U = v => (v ?? '').toString().toUpperCase();

    // 백엔드별 작성자 객체 후보들
    const actors = [
        c?.user, c?.author, c?.writer, c?.reviewer, c?.commenter,
    ];

    for (const a of actors) {
        if (!a || typeof a !== 'object') continue;

        const s = U(a.status || a.accountStatus || a.userStatus || a.authorStatus);
        if (['DEACTIVATED', 'WITHDRAWN', 'WITHDRAW', 'DELETED'].includes(s)) return true;

        if (
            a.deactivated || a.isDeactivated || a.withdrawn || a.isWithdrawn ||
            a.isDeleted || a.deletedUser || a.userDeleted || a.deleted
        ) return true;

        if (a.deactivatedAt || a.withdrawnAt || a.deletedAt) return true;
    }

    // top-level 이지만 '사용자 상태'를 의미하는 필드만 허용
    const topStatus = U(c?.userStatus || c?.authorStatus);
    if (['DEACTIVATED', 'WITHDRAWN', 'WITHDRAW', 'DELETED'].includes(topStatus)) return true;
    if (c?.userDeactivated || c?.authorDeactivated) return true;
    if (c?.userDeletedAt || c?.authorDeletedAt) return true;

    return false;
}

function looksAnonymousName(name, t) {
    const n = (name ?? '').toString().trim();
    if (!n) return false;
    const anonKo = (t?.('common.anonymous') || '익명').toString();
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reKo = /^익명\s*\d*$/i;
    const reI18n = new RegExp(`^${esc(anonKo)}\\s*\\d*$`, 'i');
    const reEn = /^anonymous\s*\d*$/i;
    return reKo.test(n) || reI18n.test(n) || reEn.test(n);
}

/* 표시용 이름: 탈퇴자는 "탈퇴된 회원" 고정, 익명 패턴은 원형 유지, 나머지는 마스킹 */
function nameForComment(c, t) {
    if (isDeactivatedFromComment(c)) return '탈퇴된 회원';

    // 가능한 이름 키들을 넓게 커버
    const raw =
        c?.authorNickname ??
        c?.nickname ??
        c?.username ??
        c?.authorName ??
        c?.userName ??
        c?.displayName ??
        c?.user?.nickname ??
        c?.author?.nickname ??
        c?.user?.name ??
        c?.author?.name ??
        '';

    const name = (raw || '').toString().trim();
    if (!name) return t('common.anonymous') || '익명';

    if (looksAnonymousName(name, t)) return name; // 익명/익명1 그대로
    const masked = displayMaskedName(name, false);
    return masked || (t('common.anonymous') || '익명');
}

/* ----------------------- component ----------------------- */
export default function WantedComments({ wantedId }) {
    const { t } = useTranslation();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [textError, setTextError] = useState('');
    const [replyFor, setReplyFor] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyError, setReplyError] = useState('');
    const myId = getCurrentUserLocal().id;

    const tree = useMemo(() => buildTree(list), [list]);

    async function fetchList() {
        setLoading(true);
        try {
            const res = await fetch(`/api/wanted/${wantedId}/comments`, { headers: authHeaders() });
            if (!res.ok) throw new Error(`목록 실패 (${res.status})`);
            const json = await toJsonSafely(res);
            setList(normalizeApiData(json));
        } catch {
            setList([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchList(); }, [wantedId]);

    async function submitRoot() {
        const body = { content: text.trim() };
        if (!body.content) return;
        try {
            setTextError('');
            const res = await fetch(`/api/wanted/${wantedId}/comments`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            const json = await toJsonSafely(res);
            if (!res.ok) {
                if (res.status === 400 && json?.success === false && json?.data?.field) {
                    const d = json.data;
                    const lvl = d.predictionLevel ? ` (${d.predictionLevel}${typeof d.malicious === 'number' ? `, ${Math.round(d.malicious*100)}%` : ''})` : '';
                    setTextError((json.message || '부적절한 표현이 감지되었습니다.') + lvl);
                    return;
                }
                throw new Error(json?.message || t('wantedComments.error.createFailed', { status: res.status }));
            }
            setText('');
            await fetchList();
        } catch (e) {
            alert(e.message || t('wantedComments.error.createFailed'));
        }
    }

    async function submitReply(parentId) {
        const body = { content: replyText.trim() };
        if (!body.content) return;
        try {
            setReplyError('');
            const res = await fetch(`/api/wanted/${wantedId}/comments/${parentId}/replies`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            const json = await toJsonSafely(res);
            if (!res.ok) {
                if (res.status === 400 && json?.success === false && json?.data?.field) {
                    const d = json.data;
                    const lvl = d.predictionLevel ? ` (${d.predictionLevel}${typeof d.malicious === 'number' ? `, ${Math.round(d.malicious*100)}%` : ''})` : '';
                    setReplyError((json.message || '부적절한 표현이 감지되었습니다.') + lvl);
                    return;
                }
                throw new Error(json?.message || t('wantedComments.error.replyFailed', { status: res.status }));
            }
            setReplyFor(null);
            setReplyText('');
            await fetchList();
        } catch (e) {
            alert(e.message || t('wantedComments.error.replyFailed'));
        }
    }

    async function remove(commentId) {
        if (!window.confirm(t('wantedComments.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/wanted/${wantedId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok && res.status !== 204) {
                const json = await toJsonSafely(res);
                throw new Error(json?.message || t('wantedComments.error.deleteFailed', { status: res.status }));
            }
            await fetchList();
        } catch (e) {
            console.error(e);
            alert(e.message || t('wantedComments.error.deleteFailed'));
        }
    }

    const renderItem = (c) => {
        const created = c.createdAt ? new Date(c.createdAt) : null;
        const mine = myId != null && Number(c.userId) === Number(myId);
        const displayName = nameForComment(c, t);

        return (
            <Item key={c.id}>
                <Meta>
          <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
            <FaUser/>{displayName}
          </span>
                    {created && (
                        <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <FaClock/>{created.toLocaleString('ko-KR')}
            </span>
                    )}
                </Meta>

                {c.contentToxic && (
                    <div style={{
                        marginBottom: 6,
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeeba'
                    }}>
                        경고
                    </div>
                )}

                <Content $deleted={c.deleted}>
                    {c.deleted ? t('wantedComments.deletedComment') : c.content}
                </Content>

                <Actions>
                    <Button onClick={() => { setReplyFor(c.id); setReplyText(''); }}>
                        <FaReply/> {t('wantedComments.reply')}
                    </Button>
                    {mine && (
                        <Button $variant="danger" onClick={() => remove(c.id)}>
                            <FaTrash/> {t('wantedComments.delete')}
                        </Button>
                    )}
                </Actions>

                {replyFor === c.id && (
                    <ReplyBox>
                        <EditorRow>
                            <Textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder={t('wantedComments.replyPlaceholder')}
                            />
                            {replyError && (
                                <div style={{ color:'#dc3545', fontSize:'.9rem', marginTop: 6 }}>{replyError}</div>
                            )}
                            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                                <Button $variant="primary" onClick={() => submitReply(c.id)}>{t('wantedComments.submit')}</Button>
                                <Button onClick={() => { setReplyFor(null); setReplyText(''); }}>{t('wantedComments.cancel')}</Button>
                            </div>
                        </EditorRow>
                    </ReplyBox>
                )}

                {c.children && c.children.length > 0 && (
                    <RepliesList>
                        {c.children.map(ch => renderItem(ch))}
                    </RepliesList>
                )}
            </Item>
        );
    };

    return (
        <Box>
            <Title>{t('wantedComments.title')}</Title>

            <EditorRow>
                <Textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={t('wantedComments.commentPlaceholder')}
                />
                {textError && (
                    <div style={{ color:'#dc3545', fontSize:'.9rem', marginTop: 6 }}>{textError}</div>
                )}
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <Button $variant="primary" onClick={submitRoot}>{t('wantedComments.submit')}</Button>
                    <Button onClick={() => setText('')}>{t('wantedComments.cancel')}</Button>
                </div>
            </EditorRow>

            {loading ? (
                <div style={{color:'#6b7280'}}>{t('wantedComments.loading')}</div>
            ) : (
                <List>
                    {tree.length === 0 ? (
                        <li style={{color:'#6b7280'}}>{t('wantedComments.noComments')}</li>
                    ) : (
                        tree.map(renderItem)
                    )}
                </List>
            )}
        </Box>
    );
}
