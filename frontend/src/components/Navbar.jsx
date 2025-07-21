import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const notificationDropdownRef = useRef();
  const userDropdownRef = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationDropdownOpen && notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (dropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationDropdownOpen, dropdownOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      }
    } catch (err) {
      console.error('Bildirimler getirilemedi:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/auth/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Bildirim okundu işaretlenemedi:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Bildirimler silinemedi:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResult(null);
    setSearchError('');
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/search?username=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Arama başarısız');
      if (data.user) {
        setSearchResult(data.user);
      } else {
        setSearchError('Aradığınız kullanıcı adında üye yok.');
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <nav className="w-full bg-[#23232C] border-b border-[#27272a] px-4 py-2 flex items-center justify-between sticky top-0 z-50">










      <Link to="/feed" className="flex items-center gap-2 select-none">
        <span className="text-2xl font-extrabold text-[#A8DADC] tracking-tight">AskApp</span>
      </Link>
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 justify-center items-center mx-4 relative max-w-md">
        <input
          type="text"
          className="w-full rounded-lg px-4 py-2 bg-[#18181b] border border-[#27272a] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] font-medium transition"
          placeholder="Kullanıcı adı ara..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSearchResult(null); setSearchError(''); }}
        />
        <button type="submit" className="ml-2 px-4 py-2 rounded-lg bg-[#B39CD0] text-[#18181b] font-bold hover:bg-[#A8DADC] transition">Ara</button>





        {(searchResult || searchError) && (
          <div className="absolute left-0 top-12 w-full bg-[#23232C] border border-[#27272a] rounded-lg shadow-lg z-50 p-4">
            {searchResult ? (
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                setSearch(''); setSearchResult(null); setSearchError('');
                navigate(`/profile/${searchResult.username}`);
              }}>
                <div className="w-10 h-10 rounded-full bg-[#B39CD0] flex items-center justify-center text-lg font-bold text-[#18181b]">
                  {searchResult.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[#A8DADC]">{searchResult.username}</div>
                  <div className="text-[#E4E4E4] text-sm">{searchResult.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-[#FFC1CC] font-semibold">{searchError}</div>
            )}
          </div>
        )}
      </form>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} 
            className="relative p-2 rounded-full hover:bg-[#18181b] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#A8DADC]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0M21 19.5v-2a7.5 7.5 0 0 0-6-7.356V9a3 3 0 1 0-6 0v1.144A7.5 7.5 0 0 0 3 17.5v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notificationDropdownOpen && (
            <div ref={notificationDropdownRef} className="absolute right-0 mt-2 w-80 bg-[#23232C] border border-[#27272a] rounded-lg shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-[#27272a] flex items-center justify-between">
                <h3 className="font-bold text-[#A8DADC]">Bildirimler</h3>
                {notifications.length > 0 && (
                  <button
                    className="text-xs text-[#FFC1CC] hover:underline"
                    onClick={clearNotifications}
                  >
                    Temizle
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-4 text-[#E4E4E4] text-center">Henüz bildirim yok</div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`px-4 py-3 hover:bg-[#18181b] transition cursor-pointer ${!notification.isRead ? 'bg-[#18181b]' : ''}`}
                    onClick={() => {
                      markAsRead(notification._id);
                      if (notification.question) {
                        navigate(`/questions`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {notification.sender ? (
                        <div className="w-8 h-8 rounded-full bg-[#B39CD0] flex items-center justify-center text-sm font-bold text-[#18181b] flex-shrink-0">
                          {notification.sender.username[0].toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#A8DADC] flex items-center justify-center text-sm font-bold text-[#18181b] flex-shrink-0">
                          ?
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#E4E4E4] text-sm">{notification.text}</p>
                        <p className="text-[#a1a1aa] text-xs mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button className="relative p-2 rounded-full hover:bg-[#18181b] transition" onClick={() => navigate('/messages')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#FFC1CC]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.659 1.591l-7.591 7.591a1.5 1.5 0 0 1-2.122 0l-7.591-7.591A2.25 2.25 0 0 1 2.25 6.993V6.75" />
          </svg>
        </button>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 rounded-full bg-[#B39CD0] text-[#18181b] font-bold focus:outline-none focus:ring-2 focus:ring-[#A8DADC]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0v.75A2.25 2.25 0 0 1 17.25 22.5h-10.5A2.25 2.25 0 0 1 4.5 20.25v-.75Z" />
            </svg>
          </button>
          {dropdownOpen && (
            <div ref={userDropdownRef} className="absolute right-0 mt-2 w-44 bg-[#23232C] border border-[#27272a] rounded-lg shadow-lg py-2 z-50">
              <Link to="/settings" className="block px-4 py-2 text-[#A8DADC] hover:bg-[#18181b] transition">Ayarlar</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-[#FFC1CC] hover:bg-[#18181b] transition">Çıkış Yap</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 