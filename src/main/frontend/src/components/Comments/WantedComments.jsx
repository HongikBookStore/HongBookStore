import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaReply, FaTrash, FaUser, FaClock } from 'react-icons/fa';

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

function authHeaders() {
    const token = localStorage.getItem('accessToken');
    const uid = localStorage.getItem('userId');
    const nick = localStorage.getItem('nickname');
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(uid ? { 'X-USER-ID': uid } : {}),
        ...(nick ? { 'X-USER-NICKNAME': nick } : {}),
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

export default function WantedComments({ wantedId }) {
    const { t } = useTranslation();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [textError, setTextError] = useState('');
    const [replyFor, setReplyFor] = useState(null); // commentId
    const [replyText, setReplyText] = useState('');
    const [replyError, setReplyError] = useState('');
    const myId = (() => {
        const v = localStorage.getItem('userId');
        if (!v) return null;
        try { return Number(v); } catch (_) { return null; }
    })();

    const tree = useMemo(() => buildTree(list), [list]);

    async function fetchList() {
        setLoading(true);
        try {
            const res = await fetch(`/api/wanted/${wantedId}/comments`, { headers: authHeaders() });
            if (!res.ok) throw new Error(`목록 실패 (${res.status})`);
            const json = await toJsonSafely(res);
            setList(normalizeApiData(json));
        } catch (e) {
            console.error(e);
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
            console.error(e);
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
            console.error(e);
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
        return (
            <Item key={c.id}>
                <Meta>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                        <FaUser/>{c.authorNickname || t('common.anonymous')}
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

                {/* children */}
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

            {/* 원댓글 입력기 */}
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

            {/* 목록 */}
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
