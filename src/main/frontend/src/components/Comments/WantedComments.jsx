// src/components/Comments/WantedComments.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaReply, FaTrash, FaUser, FaClock } from 'react-icons/fa';
import { displayMaskedName } from '../../utils/nameMask';
import { AuthCtx } from '../../contexts/AuthContext';

const Box = styled.div`
    margin-top: 18px;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 14px;
    padding: 22px;
`;

const Title = styled.h3`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.25rem;
    margin: 0 0 12px 0;
    color: #333;
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
    border: 1px solid #eef2f6; border-radius: 12px; padding: 12px;
    background: #fafcff; margin-bottom: 10px;
`;

const Meta = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; color: #6b7280; font-size: .9rem;
`;

const Name = styled.span`
    display: inline-flex; align-items: center; gap: 6px;
`;

const Content = styled.div`
    color: ${p => p.$deleted ? '#9ca3af' : '#111'}; white-space: pre-wrap;
`;

const Actions = styled.div`
    display: flex; gap: 8px; margin-top: 6px;
`;

const ReplyBox = styled.div`
    margin-top: 10px; margin-left: 26px;
`;

/* ----------------------- helpers ----------------------- */
function authHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const arr = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
    return arr.filter(Boolean);
}

function buildTree(flat) {
    const byId = new Map();
    const roots = [];
    flat.forEach(c => {
        byId.set(c.id, { ...c, replies: [] });
    });
    flat.forEach(c => {
        const cur = byId.get(c.id);
        if (!cur) return;
        if (cur.parentId) {
            const p = byId.get(cur.parentId);
            if (p) p.replies.push(cur);
            else roots.push(cur);
        } else {
            roots.push(cur);
        }
    });
    return roots;
}

function isDeactivatedFromComment(c) {
    const U = (v) => (v ?? '').toString().trim().toUpperCase();
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
        c?.userNickname ??
        c?.name ??
        null;

    if (!raw) return t('common.anonymous');

    if (looksAnonymousName(raw, t)) return raw;

    // 일반 닉네임/이름은 마스킹
    return displayMaskedName(raw);
}

export default function WantedComments({ wantedId }) {
    const { t } = useTranslation();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [textError, setTextError] = useState('');
    const [replyFor, setReplyFor] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyError, setReplyError] = useState('');
    const { user } = useContext(AuthCtx);
    const myId = user?.id ?? null;

    const tree = useMemo(() => buildTree(list), [list]);

    async function fetchList() {
        setLoading(true);
        try {
            const res = await fetch(`/api/wanted/${wantedId}/comments`);
            const json = await toJsonSafely(res);
            if (!res.ok) throw new Error(json?.message || t('wantedComments.error.loadFailed'));
            const arr = normalizeApiData(json);
            setList(arr);
        } catch (e) {
            alert(e.message || t('wantedComments.error.loadFailed'));
            setList([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wantedId]);

    async function submit() {
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
            setReplyText('');
            setReplyFor(null);
            await fetchList();
        } catch (e) {
            alert(e.message || t('wantedComments.error.replyFailed'));
        }
    }

    async function remove(id) {
        if (!window.confirm(t('wantedComments.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/wanted/${wantedId}/comments/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok && res.status !== 204) {
                const json = await toJsonSafely(res);
                throw new Error(json?.message || t('wantedComments.error.deleteFailed'));
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
                    <span>
            <FaClock/> {created ? created.toLocaleString() : ''}
          </span>
                </Meta>

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

                {c.replies && c.replies.length > 0 && (
                    <List>
                        {c.replies.map(renderItem)}
                    </List>
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
                    placeholder={t('wantedComments.placeholder')}
                />
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <Button $variant="primary" onClick={submit}>{t('wantedComments.submit')}</Button>
                    {textError && <div style={{ color:'#dc3545', fontSize:'.9rem' }}>{textError}</div>}
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
