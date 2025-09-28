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
    &:hover{ transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
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

/* ----------------------------- helpers ----------------------------- */
// GET 전용: 헤더 없이(또는 단순 Accept) → preflight 방지
function publicHeaders() {
    return { Accept: 'application/json' };
}

// 인증/작성/삭제 전용: ASCII만, 닉네임 헤더 금지
function authHeaders() {
    const token = localStorage.getItem('accessToken') || '';
    const uidRaw = localStorage.getItem('userId') || '';
    const uid = /^\d+$/.test(uidRaw) ? uidRaw : ''; // 숫자만 허용(ASCII 보장)
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(uid ? { 'X-User-Id': uid } : {}),
        'Content-Type': 'application/json',
    };
}

function toJsonSafely(res) {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return Promise.resolve(null);
}

// 다양한 백엔드 응답 모양 방어적으로 처리
function normalizeApiData(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.comments)) return json.comments;
    if (Array.isArray(json.content)) return json.content;
    if (json.data && Array.isArray(json.data.comments)) return json.data.comments;
    if (json.data && Array.isArray(json.data.content)) return json.data.content;
    return [];
}

function buildTree(list) {
    const byId = new Map();
    list.forEach(c => {
        const id = c.id ?? c.commentId ?? c.cid;
        byId.set(id, { ...c, id, children: [] });
    });
    const roots = [];
    list.forEach(c => {
        const id = c.id ?? c.commentId ?? c.cid;
        const node = byId.get(id);
        const pid = c.parentId ?? c.parentCommentId ?? null;
        if (pid) {
            const p = byId.get(pid);
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
    const actors = [c?.user, c?.author, c?.writer, c?.reviewer, c?.commenter];
    for (const a of actors) {
        if (!a || typeof a !== 'object') continue;
        const s = U(a.status || a.accountStatus || a.userStatus || a.authorStatus);
        if (['DEACTIVATED','WITHDRAWN','WITHDRAW','DELETED'].includes(s)) return true;
        if (a.deactivated || a.isDeactivated || a.withdrawn || a.isWithdrawn ||
            a.isDeleted || a.deletedUser || a.userDeleted || a.deleted) return true;
        if (a.deactivatedAt || a.withdrawnAt || a.deletedAt) return true;
    }
    const top = U(c?.userStatus || c?.authorStatus);
    if (['DEACTIVATED','WITHDRAWN','WITHDRAW','DELETED'].includes(top)) return true;
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

/* 표시용 이름: 탈퇴자는 고정, 익명 패턴 유지, 나머지는 마스킹 */
function nameForComment(c, t) {
    if (isDeactivatedFromComment(c)) return '탈퇴된 회원';
    const raw =
        c?.authorNickname ?? c?.nickname ?? c?.username ??
        c?.authorName ?? c?.userName ?? c?.displayName ??
        c?.user?.nickname ?? c?.author?.nickname ??
        c?.user?.name ?? c?.author?.name ?? '';
    const name = (raw || '').toString().trim();
    if (!name) return t('common.anonymous') || '익명';
    if (looksAnonymousName(name, t)) return name;
    const masked = displayMaskedName(name, false);
    return masked || (t('common.anonymous') || '익명');
}

// 다양한 백엔드 필드에 대응해 userId 뽑기
function pickAuthorId(c) {
    return c.userId ?? c.authorId ?? c.writerId ?? c.user?.id ?? c.author?.id ?? null;
}

/* ----------------------------- component ----------------------------- */
export default function WantedComments({ wantedId }) {
    const { t } = useTranslation();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [textError, setTextError] = useState('');
    const [replyFor, setReplyFor] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyError, setReplyError] = useState('');

    const myId = (() => {
        const v = localStorage.getItem('userId');
        if (!/^\d+$/.test(v || '')) return null;
        return Number(v);
    })();

    const tree = useMemo(() => buildTree(list), [list]);

    async function fetchList() {
        setLoading(true);
        try {
            // ✅ GET은 헤더 없이
            const res = await fetch(`/api/wanted/${wantedId}/comments`, { headers: publicHeaders() });
            if (!res.ok) throw new Error(`목록 실패 (${res.status})`);
            const json = await toJsonSafely(res);
            setList(normalizeApiData(json));
        } catch (e) {
            console.error('[comments:list]', e);
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
        const authorId = pickAuthorId(c);
        const mine = myId != null && authorId != null && Number(authorId) === Number(myId);
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
