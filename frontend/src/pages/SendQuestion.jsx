import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const getUser = username => ({
  username,
  profilePhoto: '',
});

export default function SendQuestion() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {


    setUser(getUser(username));
  }, [username]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/questions/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toUsername: username, text, isAnonymous })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Soru gönderilemedi');
      setMessage('Soru başarıyla gönderildi!');
      setTimeout(() => navigate(`/profile/${username}`), 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#18181b] w-full">
      <Navbar />
      <div className="max-w-md mx-auto pt-10 px-2">
        <div className="bg-[#23232C] border border-[#27272a] rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-[#A8DADC] shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#B39CD0] flex items-center justify-center text-2xl font-extrabold text-[#18181b] border-2 border-[#A8DADC] shadow-md">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div className="text-lg font-bold text-[#A8DADC]">@{user.username}</div>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <textarea
              className="w-full rounded-lg px-4 py-3 bg-[#18181b] border border-[#27272a] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] font-medium transition"
              placeholder="Sorunuzu yazın..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              required
            />
            <label className="flex items-center gap-2 text-[#E4E4E4]">
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
              Soruyu anonim gönder
            </label>
            <button type="submit" disabled={loading || !text.trim()} className="w-full py-3 px-4 rounded-lg font-bold text-base mt-2 transition-all shadow-md bg-[#B39CD0] text-[#18181b] hover:bg-[#A8DADC] active:bg-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC] focus:ring-offset-2 disabled:opacity-60">
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
            {message && <div className="text-center text-[#A8DADC] mt-2 font-semibold">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
} 