import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();
  const currentUsername = localStorage.getItem('username');
  const currentUserId = localStorage.getItem('userId');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
        fetch(`http://localhost:5000/api/auth/users/${username}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          return fetch(`http://localhost:5000/api/auth/questions/answered/${username}?page=1&limit=10`);
        } else {
          setError('Kullanıcı bulunamadı.');
          throw new Error('Kullanıcı bulunamadı.');
        }
      })
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setHasMore(data.hasMore || false);
      })
      .catch(() => setError('Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#A8DADC] text-xl">Yükleniyor...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-[#FFC1CC] text-xl">{error}</div>;
  if (!user) return null;

  const isOwnProfile = currentUsername === user.username;
  const visibleQuestions = questions.slice(0, visibleCount);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/auth/users/${username}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Kullanıcı bilgileri getirilemedi:', err);
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteAlert(true);
  };
  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/auth/questions/${deleteTargetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setQuestions(prev => prev.filter(q => q._id !== deleteTargetId));
    }
    setShowDeleteAlert(false);
    setDeleteTargetId(null);
  };

  const handleStartConversation = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/messages/conversations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ otherUserId: user._id })
    });
    if (res.ok) {
      const data = await res.json();
      navigate(`/messages?conversation=${data.conversation._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181b] w-full">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-10 px-2 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/5 flex-shrink-0 flex flex-col items-center gap-6">
          <ProfileSidebar user={user} isOwnProfile={isOwnProfile} navigate={navigate} fetchUser={fetchUser} />
          {!isOwnProfile && user._id && (
            <button className="mt-4 px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition text-sm w-full" onClick={handleStartConversation}>
              Send Message
            </button>
          )}
        </aside>
        <main className="w-full lg:w-4/5 flex flex-col gap-8">
          <ProfileMain user={user} />
          <div className="hidden lg:flex flex-row gap-6 w-full">
            {user.mostAsked && user.mostAsked.length > 0 && user.privacy?.mostAsked !== 'none' && <MostList title="Most Asked Questions" icon={<QuestionIcon />} data={user.mostAsked} color="#A8DADC" />}
            {user.mostLiked && user.mostLiked.length > 0 && user.privacy?.mostLiked !== 'none' && <MostList title="Most Liked Questions" icon={<LikeIcon />} data={user.mostLiked} color="#FFC1CC" />}
            {user.mostCommented && user.mostCommented.length > 0 && user.privacy?.mostAsked !== 'none' && (
              <MostList title="Most Commented Questions" icon={<CommentIcon />} data={user.mostCommented} color="#FFC1CC" />
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-[#A8DADC] mb-4">Answered Questions</h3>
            <div className="flex flex-col gap-6">
              {visibleQuestions.length === 0 ? (
                <div className="text-zinc-400 italic">No questions have been asked to this user yet.</div>
              ) : (
                visibleQuestions.map(q => <QuestionCard key={q._id} question={q} isOwnProfile={isOwnProfile} onDelete={id => setQuestions(prev => prev.filter(qq => qq._id !== id))} handleDelete={handleDelete} />)
              )}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button onClick={() => {
                  const nextPage = Math.floor(visibleCount / 10) + 2;
                  fetch(`http://localhost:5000/api/auth/questions/answered/${username}?page=${nextPage}&limit=10`)
                    .then(res => res.json())
                    .then(data => {
                      setQuestions(prev => [...prev, ...data.questions]);
                      setHasMore(data.hasMore);
                      setVisibleCount(prev => prev + 10);
                    });
                }} className="px-6 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition">Load More</button>
              </div>
            )}
          </div>
        </main>
      </div>
      <div className="lg:hidden max-w-2xl mx-auto mt-8 px-2 flex flex-col gap-6">
        {user.mostAsked && user.mostAsked.length > 0 && user.privacy?.mostAsked !== 'none' && <MostList title="Most Asked Questions" icon={<QuestionIcon />} data={user.mostAsked} color="#A8DADC" horizontal />}
        {user.mostLiked && user.mostLiked.length > 0 && user.privacy?.mostLiked !== 'none' && <MostList title="Most Liked Questions" icon={<LikeIcon />} data={user.mostLiked} color="#FFC1CC" horizontal />}
        {user.mostFollowers && user.mostFollowers.length > 0 && user.privacy?.mostFollowers !== 'none' && <MostList title="Most Followed Accounts" icon={<UserGroupIcon />} data={user.mostFollowers} color="#B39CD0" horizontal />}
        {user.mostCommented && user.mostCommented.length > 0 && user.privacy?.mostAsked !== 'none' && (
          <MostList title="Most Commented Questions" icon={<CommentIcon />} data={user.mostCommented} color="#FFC1CC" horizontal />
        )}
      </div>
      <Alert
        open={showDeleteAlert}
        type="info"
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={confirmDelete}
        showConfirm
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

function ProfileSidebar({ user, isOwnProfile, navigate, fetchUser }) {
  const [following, setFollowing] = React.useState(false);
  const [loadingFollow, setLoadingFollow] = React.useState(false);
  const currentUsername = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    if (!isOwnProfile && user.isFollowing !== undefined) {
      setFollowing(user.isFollowing);
    }
  }, [user, isOwnProfile]);

  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${user.username}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowing(true);
        if (fetchUser) {
          await fetchUser();
        }
      }
    } finally {
      setLoadingFollow(false);
    }
  };
  const handleUnfollow = async () => {
    setLoadingFollow(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${user.username}/unfollow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowing(false);
        if (fetchUser) {
          await fetchUser();
        }
      }
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="w-full bg-[#23232C] border border-[#27272a] rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4">
      {user.profilePhoto ? (
        <img src={user.profilePhoto} alt="Profil" className="w-20 h-20 rounded-full object-cover border-4 border-[#A8DADC] shadow-md" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-[#B39CD0] flex items-center justify-center text-3xl font-extrabold text-[#18181b] border-4 border-[#A8DADC] shadow-md">
          {user.username[0].toUpperCase()}
        </div>
      )}
      <div className="text-xl font-bold text-white text-center">{user.firstName} {user.lastName}</div>
      <div className="text-[#A8DADC] font-semibold text-base">@{user.username}</div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {user.hobbies && user.hobbies.map((hobby, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-[#A8DADC] text-[#18181b] text-xs font-semibold shadow-sm">{hobby}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-4 w-full">
        <StatBox label="Followers" value={user.stats?.followers ?? 0} color="#A8DADC" hidden={user.privacy?.followerCount === 'none'} tooltip="Follower count hidden" />
        <StatBox label="Following" value={user.stats?.following} color="#FFC1CC" hidden={user.privacy?.followingCount === 'none'} tooltip="Following count hidden" />
        <StatBox label="Questions" value={user.stats?.questions} color="#B39CD0" hidden={user.privacy?.questionCount === 'none'} tooltip="Question count hidden" />
        <StatBox label="Likes" value={user.stats?.likes} color="#E4E4E4" hidden={user.privacy?.likeCount === 'none'} tooltip="Like count hidden" />
      </div>
      {isOwnProfile ? (
        <button className="mt-4 px-4 py-2 rounded-lg bg-[#B39CD0] text-[#18181b] font-bold hover:bg-[#A8DADC] transition text-sm w-full" onClick={() => navigate('/settings')}>Edit Profile</button>
      ) : (
        <>
          <button className="mt-4 px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition text-sm w-full" onClick={() => navigate(`/sendquestion/${user.username}`)}>Send Question</button>
          {following ? (
            <button disabled={loadingFollow} className="mt-2 px-4 py-2 rounded-lg bg-[#23232C] border border-[#A8DADC] text-[#A8DADC] font-bold hover:bg-[#B39CD0] transition text-sm w-full" onClick={handleUnfollow}>{loadingFollow ? '...' : 'Unfollow'}</button>
          ) : (
            <button disabled={loadingFollow} className="mt-2 px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition text-sm w-full" onClick={handleFollow}>{loadingFollow ? '...' : 'Follow'}</button>
          )}
        </>
      )}
    </div>
  );
}

function ProfileMain({ user }) {
  return (
    <div className="w-full bg-[#23232C] border border-[#27272a] rounded-2xl shadow-2xl p-8 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[#A8DADC] mb-2">About User</h2>
<div className="text-zinc-400 mt-2 text-base max-w-2xl">{user.bio || <span className="italic text-zinc-600">No description yet.</span>}</div>
            {(user.height || user.weight) && (
        <div className="flex flex-wrap gap-4 mt-4">
          {user.height && (
            <div className="flex items-center gap-2">
              <span className="text-[#A8DADC] font-semibold">Height:</span>
              <span className="text-[#E4E4E4]">{user.height} cm</span>
            </div>
          )}
          {user.weight && (
            <div className="flex items-center gap-2">
              <span className="text-[#A8DADC] font-semibold">Weight:</span>
              <span className="text-[#E4E4E4]">{user.weight} kg</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, isOwnProfile, onDelete, handleDelete }) {
  const navigate = useNavigate();
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(Array.isArray(question.likes) ? question.likes.length : (typeof question.likes === 'number' ? question.likes : 0));
  const currentUserId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    if (Array.isArray(question.likes) && currentUserId) {
      setLiked(question.likes.includes(currentUserId));
    }
  }, [question.likes, currentUserId]);

  const handleLike = async () => {
    const res = await fetch(`http://localhost:5000/api/auth/questions/${question._id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(true);
      setLikeCount(data.likes || likeCount + 1);
    }
  };
  const handleUnlike = async () => {
    const res = await fetch(`http://localhost:5000/api/auth/questions/${question._id}/unlike`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(false);
      setLikeCount(data.likes || likeCount - 1);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    const res = await fetch(`http://localhost:5000/api/auth/questions/${question._id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: comment })
    });
    
    if (res.ok) {
      const data = await res.json();
      question.comments.push(data.comment);
      setComment('');
      setShowCommentInput(false);
      setShowComments(true);
    }
  };

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-[#23232C] border border-[#27272a] rounded-2xl shadow-xl p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-2">
        {question.isAnonymous ? (
          <div className="w-10 h-10 rounded-full bg-[#B39CD0] flex items-center justify-center text-lg font-bold text-[#18181b]">?</div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#A8DADC] flex items-center justify-center text-lg font-bold text-[#18181b]">
            {question.from.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-bold text-[#A8DADC]">
            {question.isAnonymous ? 'Anonymous' : `${question.from.firstName} ${question.from.lastName}`}
          </div>
          <div className="text-xs text-zinc-400">{question.isAnonymous ? '' : `@${question.from.username}`}</div>
        </div>
      </div>
      <div className="text-white text-base mb-2">{renderWithMentions(question.text, navigate)}</div>
      <div className="bg-[#18181b] rounded-lg p-4 mt-1 border border-[#27272a]">
        {question.answer ? (
          <>
            <span className="text-[#A8DADC] font-semibold">Answer: </span>
            <span className="text-[#E4E4E4]">{renderWithMentions(question.answer, navigate)}</span>
            {question.answeredAt && (
              <div className="text-xs text-zinc-400 mt-1">Answered on: {new Date(question.answeredAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </>
        ) : (
          <span className="text-zinc-500 italic">Not answered yet.</span>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <button onClick={liked ? handleUnlike : handleLike} className="flex items-center gap-1 text-[#A8DADC] hover:underline">
          <LikeIcon /> {likeCount}
        </button>
        <button className="flex items-center gap-1 text-[#B39CD0] hover:underline">
          <RepostIcon /> {question.reposts}
        </button>
        <button className="flex items-center gap-1 text-[#FFC1CC] hover:underline" onClick={() => setShowCommentInput(v => !v)}>
          <CommentIcon /> Comment
        </button>
        {question.comments.length > 0 && (
          <button className="flex items-center gap-1 text-[#A8DADC] hover:underline" onClick={() => setShowComments(v => !v)}>
            <ViewCommentsIcon /> View Comments
          </button>
        )}
        {isOwnProfile && handleDelete && (
          <button className="flex items-center gap-1 text-[#FFC1CC] hover:underline" onClick={() => handleDelete(question._id)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Delete
          </button>
        )}
      </div>
      {showCommentInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            className="flex-1 py-2 px-3 rounded-lg border border-[#27272a] bg-[#18181b] text-[#E4E4E4] focus:outline-none focus:border-[#A8DADC]"
            placeholder="Write your comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button 
            className="px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition"
            onClick={handleComment}
          >
            Send
          </button>
        </div>
      )}
      {showComments && question.comments.length > 0 && (
        <div className="mt-3 bg-[#18181b] rounded-lg p-3">
          {question.comments.map((c, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full bg-[#B39CD0] flex items-center justify-center text-sm font-bold text-[#18181b] cursor-pointer hover:opacity-80"
                onClick={() => c.user && typeof c.user === 'object' && c.user.username && navigate(`/profile/${c.user.username}`)}
              >
                {c.user && typeof c.user === 'object' && c.user.username
                  ? c.user.username[0].toUpperCase()
                  : '-'}
              </div>
              <div>
                <div
                  className="font-semibold text-[#A8DADC] cursor-pointer hover:underline"
                  onClick={() => c.user && typeof c.user === 'object' && c.user.username && navigate(`/profile/${c.user.username}`)}
                >
                  {c.user && typeof c.user === 'object' && c.user.username
                    ? c.user.username
                    : 'User'}
                </div>
                <div className="text-zinc-400 text-sm">{renderWithMentions(c.text, navigate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UnansweredCard({ question }) {
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  if (answered) return null;
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-1">
        {question.isAnonymous ? (
          <div className="w-8 h-8 rounded-full bg-[#B39CD0] flex items-center justify-center text-base font-bold text-[#18181b]">?</div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#A8DADC] flex items-center justify-center text-base font-bold text-[#18181b]">
            {question.from.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-bold text-[#A8DADC]">
            {question.isAnonymous ? 'Anonymous' : `${question.from.firstName} ${question.from.lastName}`}
          </div>
          <div className="text-xs text-zinc-400">{question.isAnonymous ? '' : `@${question.from.username}`}</div>
        </div>
      </div>
      <div className="text-white text-base mb-2">{question.text}</div>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          className="flex-1 py-2 px-3 rounded-lg border border-[#27272a] bg-[#23232C] text-[#E4E4E4] focus:outline-none focus:border-[#A8DADC]"
          placeholder="Write your answer..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
        />
        <button onClick={() => setAnswered(true)} className="px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition">Answer</button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, hidden, tooltip }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-xl shadow-md relative group" style={{ background: color, minWidth: 70 }}>
      {hidden ? (
        <>
          <div className="text-lg font-bold text-[#18181b]"><EyeOffIcon /></div>
          {tooltip && (
            <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-[#23232C] text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition">{tooltip}</div>
          )}
        </>
      ) : (
        <div className="text-lg font-bold text-[#18181b]">{typeof value === 'number' ? value : (value ? value : 0)}</div>
      )}
      <div className="text-xs font-semibold text-[#23232C]">{label}</div>
    </div>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#18181b" className="w-5 h-5 inline-block align-middle">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.685 6.073 6 9.75 6 1.563 0 3.06-.322 4.437-.91M6.75 6.75l10.5 10.5m-7.5-2.25a3 3 0 1 0 4.242-4.242" />
    </svg>
  );
}
function LikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#A8DADC" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-6 0v4M5.5 15.5l.5 2.5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l.5-2.5M4 15.5h16" />
    </svg>
  );
}
function RepostIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#B39CD0" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75V3.75m0 0L14.25 6.75m3-3-3 3m3-3H6.75A2.25 2.25 0 0 0 4.5 9v6m0 0v3m0-3h13.5" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFC1CC" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.659 1.591l-7.591 7.591a1.5 1.5 0 0 1-2.122 0l-7.591-7.591A2.25 2.25 0 0 1 2.25 6.993V6.75" />
    </svg>
  );
}
function ViewCommentsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#A8DADC" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L12 16.5m0 0l-3.75 3m3.75-3V4.5" />
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#A8DADC" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747" />
    </svg>
  );
}
function UserGroupIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#B39CD0" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a48.88 48.88 0 0 0 3.342 3.342M2.43 2.43a18 18 0 0 0 25.26 25.26M12 12c2.45 0 4.71-.2 6.74-.58M12 12c2.45 0 4.71-.2 6.74-.58M12 12c2.45 0 4.71-.2 6.74-.58" />
    </svg>
  );
}

function MostList({ title, icon, data, color, horizontal }) {
  return (
    <div className={horizontal ? 'flex-1' : 'w-1/3'}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" style={{ color }}>{icon}</span>
        <span className="font-bold text-[#E4E4E4] text-base">{title}</span>
      </div>
      <div className={horizontal ? 'flex gap-3 overflow-x-auto pb-2' : 'flex flex-col gap-3'}>
        {(!data || data.length === 0) ? (
          <div className="text-zinc-400 italic px-2 py-3">No {title.toLowerCase()} yet.</div>
        ) : (
          data.map((item, i) => {
            const user = item.user || item; 
            return (
              <div key={i} className="flex items-center gap-3 bg-[#23232C] border border-[#27272a] rounded-lg px-4 py-2 min-w-[180px]">
                <div className="w-10 h-10 rounded-full bg-[#B39CD0] flex items-center justify-center text-lg font-bold text-[#18181b]">
                  {user.profilePhoto ? <img src={user.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" /> : user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#A8DADC]">{user.username || '-'}</div>
                  <div className="text-sm text-[#E4E4E4]">{user.firstName || ''} {user.lastName || ''}</div>
                  <div>{item.count ? `(${item.count})` : ''}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 

function renderWithMentions(text, navigate) {
  return text.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <span
          key={i}
          className="text-[#A8DADC] font-bold cursor-pointer hover:underline"
          onClick={() => navigate(`/profile/${username}`)}
        >
          {part}
        </span>
      );
    }
    return part;
  });
} 