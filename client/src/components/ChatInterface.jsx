import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Paperclip, X, FileText, Download } from 'lucide-react';
import { API_URL, getToken } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function downloadAttachment(att) {
  const res = await fetch(`${API_URL}/files/${att.id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = att.original_name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function AttachmentView({ attachment }) {
  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    let alive = true;
    if (attachment && attachment.mimetype.startsWith('image/')) {
      fetch(`${API_URL}/files/${attachment.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (b && alive) setThumb(URL.createObjectURL(b));
        });
    }
    return () => {
      alive = false;
      if (thumb) URL.revokeObjectURL(thumb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment?.id]);
  if (!attachment) return null;
  if (attachment.mimetype.startsWith('image/') && thumb) {
    return (
      <img
        src={thumb}
        alt={attachment.original_name}
        className="mt-2 max-w-55 max-h-48 rounded-lg cursor-pointer"
        style={{ maxWidth: 220 }}
        onClick={() => downloadAttachment(attachment).catch(console.error)}
      />
    );
  }
  return (
    <button
      onClick={() => downloadAttachment(attachment).catch(console.error)}
      className="mt-2 flex items-center gap-2 text-sm underline opacity-90 hover:opacity-100"
    >
      <FileText size={16} /> {attachment.original_name}
      <span className="text-xs opacity-70">({Math.round(attachment.size / 1024)} KB)</span>
      <Download size={14} />
    </button>
  );
}

export default function ChatInterface({ currentUserId, mode }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [typingFrom, setTypingFrom] = useState(null);
  const [onlineIds, setOnlineIds] = useState([]);
  const [unreadBy, setUnreadBy] = useState({});
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);
  const selectedRef = useRef(null);
  selectedRef.current = selected;
  const typingTimeout = useRef(null);

  const listEndpoint = mode === 'doctor' ? `${API_URL}/patients` : `${API_URL}/doctors`;

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/unread-count`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadBy(Object.fromEntries((data.bySender || []).map((r) => [r.id, r.count])));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setError('');
        const url = search ? `${listEndpoint}?search=${encodeURIComponent(search)}` : listEndpoint;
        const res = await fetch(url, { headers: authHeaders() });
        if (res.status === 401) return setError('Session expired. Please log in again.');
        if (!res.ok) throw new Error('load failed');
        setUsers(await res.json());
      } catch (e) {
        console.error(e);
        setError('Could not load conversations. Is the Node API running on :5000?');
      }
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [listEndpoint, search]);

  // Initial load: messages are fetched on select; socket delivers live updates
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/messages/${selected.id}`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setMessages(data);
        await fetch(`${API_URL}/messages/read`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ partner_id: selected.id }),
        });
        refreshUnread();
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected, refreshUnread]);

  // Realtime socket
  useEffect(() => {
    const socket = getSocket();
    refreshUnread();

    const onMessage = (msg) => {
      const sel = selectedRef.current;
      const relevant =
        sel &&
        ((msg.sender_id === sel.id && msg.receiver_id === currentUserId) ||
          (msg.sender_id === currentUserId && msg.receiver_id === sel.id));
      if (relevant) {
        setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg]));
        if (msg.sender_id !== currentUserId) {
          fetch(`${API_URL}/messages/read`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ partner_id: msg.sender_id }),
          }).then(() => refreshUnread());
        }
      } else if (msg.receiver_id === currentUserId) {
        refreshUnread();
      }
    };
    const onTypingStart = ({ from }) => setTypingFrom(from);
    const onTypingStop = ({ from }) =>
      setTypingFrom((t) => (t === from ? null : t));
    const onPresence = (ids) => setOnlineIds(ids);
    const onRead = () => refreshUnread();

    socket.on('message:new', onMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('presence:update', onPresence);
    socket.on('message:read', onRead);
    socket.on('appointment:new', () => {});
    return () => {
      socket.off('message:new', onMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('presence:update', onPresence);
      socket.off('message:read', onRead);
    };
  }, [currentUserId, refreshUnread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingFrom]);

  const handleTyping = (v) => {
    setInput(v);
    const socket = getSocket();
    if (!selected) return;
    socket.emit('typing:start', { to: selected.id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { to: selected.id }), 1200);
  };

  const send = async () => {
    if ((!input.trim() && !pendingFile) || !selected) return;
    const content = input.trim() || (pendingFile ? `Sent ${pendingFile.original_name}` : '');
    const attachmentId = pendingFile?.id || null;
    setInput('');
    setPendingFile(null);
    getSocket().emit('typing:stop', { to: selected.id });
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content, receiver_id: selected.id, attachment_id: attachmentId }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((m) => (m.some((x) => x.id === newMsg.id) ? m : [...m, newMsg]));
      } else {
        setInput(content);
        setError('Failed to send message.');
      }
    } catch {
      setInput(content);
      setError('Failed to send message.');
    }
  };

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setError('File too large (max 10 MB).');
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setPendingFile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const typingVisible = typingFrom && selected && typingFrom === selected.id;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3 className="mb-3 font-semibold">Active Chats</h3>
        <input
          className="search-bar"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {error && <div className="p-2 mb-2 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
        <div className="chat-list">
          {users.map((u) => (
            <div
              key={u.id}
              className="chat-item"
              style={selected?.id === u.id ? { backgroundColor: '#f5f8f5' } : undefined}
              onClick={() => {
                setSelected(u);
                setMessages([]);
                setTypingFrom(null);
              }}
            >
              <div className="relative">
                <img src={u.avatar || '/placeholder.svg'} alt={u.name} className="avatar" />
                {onlineIds.includes(u.id) && (
                  <span className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h6 className="mb-1 font-medium">{u.name}</h6>
                <small className="text-gray-500">{u.details}</small>
              </div>
              {unreadBy[u.id] > 0 && (
                <span className="ml-2 min-w-6 h-6 px-2 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadBy[u.id]}
                </span>
              )}
            </div>
          ))}
          {users.length === 0 && !error && <p className="text-sm text-gray-500">No conversations found.</p>}
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-header">
          {selected ? (
            <>
              <img src={selected.avatar || '/placeholder.svg'} alt={selected.name} className="avatar" />
              <div>
                <h5 className="font-semibold">
                  {selected.name}{' '}
                  {onlineIds.includes(selected.id) && (
                    <span className="text-xs font-normal text-green-600">● online</span>
                  )}
                </h5>
                <span className="text-gray-500 text-sm">{selected.details}</span>
              </div>
            </>
          ) : (
            <h5 className="font-semibold">Select a chat to start messaging</h5>
          )}
        </div>

        <div className="messages">
          {selected ? (
            messages.length > 0 ? (
              messages.map((m) => (
                <div key={m.id} className={`chat-message ${m.sender_id === currentUserId ? 'sent' : ''}`}>
                  {m.content}
                  <AttachmentView attachment={m.attachment} />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 my-4">No messages yet. Start the conversation!</div>
            )
          ) : (
            <div className="text-center text-gray-500 my-4">Select a chat from the sidebar to view messages</div>
          )}
          {typingVisible && <div className="text-sm text-gray-400 italic my-2">typing…</div>}
          <div ref={endRef} />
        </div>

        {pendingFile && (
          <div className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2">
            <FileText size={16} className="text-blue-600" />
            <span className="flex-1 truncate">{pendingFile.original_name}</span>
            <button onClick={() => setPendingFile(null)} className="text-gray-500 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="message-box">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx"
            onChange={pickFile}
          />
          <button
            className="send-btn"
            style={{ backgroundColor: '#e5e7eb', color: '#1a2f4e' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={!selected || uploading}
            title="Attach file (image, PDF, TXT, DOC — max 10 MB)"
          >
            <Paperclip size={18} />
          </button>
          <input
            className="message-input"
            placeholder={selected ? 'Type your message...' : 'Select a chat to start messaging'}
            value={input}
            disabled={!selected}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="send-btn" onClick={send} disabled={!selected || (!input.trim() && !pendingFile) || uploading}>
            <Send size={18} />
          </button>
        </div>
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading file…</p>}

        {selected && mode === 'doctor' && (
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => setInput('How are you feeling today?')}>Check-in</button>
            <button className="quick-action-btn" onClick={() => setInput('Your test results are ready. Would you like to schedule a follow-up appointment?')}>Test Results</button>
            <button className="quick-action-btn" onClick={() => setInput('Remember to take your medication as prescribed.')}>Medication Reminder</button>
          </div>
        )}
      </div>
    </div>
  );
}
