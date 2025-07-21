import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <div className="w-full md:w-80 bg-[#23232C] border-r border-[#27272a] h-full overflow-y-auto flex-shrink-0">
      <div className="p-4 font-bold text-[#A8DADC] text-lg">Mesajlar</div>
      {conversations.length === 0 && <div className="text-zinc-400 p-4">Hiç konuşma yok.</div>}
      {conversations.map(conv => {
        const other = conv.participants.find(u => u._id !== localStorage.getItem('userId'));
        return (
          <div key={conv._id} onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#18181b] transition ${selectedId === conv._id ? 'bg-[#18181b]' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-[#B39CD0] flex items-center justify-center text-lg font-bold text-[#18181b]">
              {other?.profilePhoto ? <img src={other.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" /> : other?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#A8DADC] truncate">{other?.firstName} {other?.lastName}</div>
              <div className="text-xs text-zinc-400 truncate">@{other?.username}</div>
              <div className="text-xs text-zinc-400 truncate mt-1">{conv.lastMessage}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessageList({ messages, userId }) {
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
      {messages.map(msg => (
        <div key={msg._id} className={`flex ${String(msg.sender._id) === String(userId) ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${String(msg.sender._id) === String(userId) ? 'bg-[#A8DADC] text-[#18181b]' : 'bg-[#23232C] text-[#E4E4E4] border border-[#27272a]'}`}>
            <div className="text-sm">{msg.text}</div>
            <div className="text-xs text-zinc-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  const socketRef = useRef();
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    if (userId) {
      socketRef.current.emit('join', userId);
    }
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setConversations(data.conversations || []);
        const params = new URLSearchParams(location.search);
        const convId = params.get('conversation');
        if (convId && data.conversations) {
          const found = data.conversations.find(c => c._id === convId);
          if (found) setSelected(found);
        }
      });
  }, [location.search]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/messages/conversations/${selected._id}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .finally(() => setLoading(false));
  }, [selected]);

  useEffect(() => {
    if (!socketRef.current) return;
    const handleNewMessage = (msg) => {
      if (selected && msg.conversation === selected._id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socketRef.current.on('newMessage', handleNewMessage);
    return () => {
      socketRef.current.off('newMessage', handleNewMessage);
    };
  }, [selected]);













  const handleSend = async e => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    const token = localStorage.getItem('token');
    const other = selected.participants.find(u => u._id !== userId);
    const res = await fetch('http://localhost:5000/api/messages/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ conversationId: selected._id, receiverId: other._id, text: message })
    });
    if (res.ok) {
      setMessage('');
      const data = await res.json();
      setMessages(prev => [...prev, data.data]);



      socketRef.current.emit('sendMessage', { toUserId: other._id, message: data.data });
    }
  };

  return (
    <div className="min-h-screen bg-[#18181b] w-full flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full h-[80vh] mt-8 rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl">
        <ConversationList conversations={conversations} selectedId={selected?._id} onSelect={setSelected} />
        <div className="flex-1 flex flex-col bg-[#18181b]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-zinc-400">Bir konuşma seçin</div>
          ) : (
            <>
              <MessageList messages={[...messages].reverse()} userId={userId} />
              <form onSubmit={handleSend} className="p-4 flex gap-2 border-t border-[#27272a] bg-[#23232C]">
                <input
                  type="text"
                  className="flex-1 rounded-lg px-4 py-2 bg-[#18181b] border border-[#27272a] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] font-medium transition"
                  placeholder="Mesaj yaz..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="px-6 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition disabled:opacity-60" disabled={loading || !message.trim()}>Gönder</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 