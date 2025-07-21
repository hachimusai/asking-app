import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function LeaderboardCard({ title, users, color }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <div className="font-bold text-base mb-2" style={{ color }}>{title}</div>
      <div className="flex flex-col gap-2">
        {users && users.length > 0 ? users.map((user, i) => (
          <div key={user.username} className="flex items-center gap-3 bg-[#23232C] border border-[#27272a] rounded-lg px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#B39CD0] flex items-center justify-center text-base font-bold text-[#18181b] cursor-pointer" onClick={() => user.username && navigate(`/profile/${user.username}`)}>
              {user.profilePhoto ? <img src={user.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" /> : user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => user.username && navigate(`/profile/${user.username}`)}>
              <div className="font-bold text-[#A8DADC]">{user.username}</div>
              <div className="text-xs text-[#E4E4E4]">{user.firstName} {user.lastName}</div>
            </div>
            {user.followersCount !== undefined && <div className="text-xs text-[#A8DADC]">{user.followersCount} followers</div>}
            {user.answeredCount !== undefined && <div className="text-xs text-[#A8DADC]">{user.answeredCount} answers</div>}
            {user.likeCount !== undefined && <div className="text-xs text-[#A8DADC]">{user.likeCount} likes</div>}
            {user.questionCount !== undefined && <div className="text-xs text-[#A8DADC]">{user.questionCount} questions</div>}
          </div>
        )) : <div className="text-zinc-400 italic">No data</div>}
      </div>
    </div>
  );
}

function FeedCard({ question }) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#23232C] border border-[#27272a] rounded-2xl shadow-xl p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#B39CD0] flex items-center justify-center text-lg font-bold text-[#18181b] cursor-pointer" onClick={() => question.to?.username && navigate(`/profile/${question.to.username}`)}>
          {question.to?.profilePhoto ? <img src={question.to.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" /> : question.to?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="cursor-pointer" onClick={() => question.to?.username && navigate(`/profile/${question.to.username}`)}>
          <div className="font-bold text-[#B39CD0]">{question.to?.firstName} {question.to?.lastName}</div>
          <div className="text-xs text-zinc-400">@{question.to?.username}</div>
        </div>
        <div className="ml-auto text-xs text-zinc-400">{question.answeredAt ? new Date(question.answeredAt).toLocaleString('en-US') : ''}</div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#A8DADC] flex items-center justify-center text-base font-bold text-[#18181b] cursor-pointer" onClick={() => question.from?.username && navigate(`/profile/${question.from.username}`)}>
          {question.from?.profilePhoto ? <img src={question.from.profilePhoto} alt="avatar" className="w-full h-full rounded-full object-cover" /> : question.from?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="cursor-pointer" onClick={() => question.from?.username && navigate(`/profile/${question.from.username}`)}>
          <span className="font-semibold text-[#A8DADC]">{question.from?.firstName} {question.from?.lastName}</span>
          <span className="ml-1 text-xs text-zinc-400">@{question.from?.username}</span>
        </div>
        <span className="mx-2 text-zinc-400">→</span>
        <span className="text-white text-base">{question.text}</span>
      </div>
      <div className="bg-[#18181b] rounded-lg p-4 mt-1 border border-[#27272a] flex items-center gap-2">
        <span className="text-[#A8DADC] font-semibold">Answer: </span>
        <span className="text-[#E4E4E4]">{question.answer}</span>
        {question.to && (
          <span className="ml-2 text-xs text-[#B39CD0] font-semibold">@{question.to.username}</span>
        )}
      </div>
    </div>
  );
}

export default function Feed() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [feed, setFeed] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchLeaderboard = async () => {
      const res = await fetch('http://localhost:5000/api/auth/global/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    };
    fetchLeaderboard();
    interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/auth/global/feed?page=${feedPage}&limit=10`)
      .then(res => res.json())
      .then(data => {
        if (feedPage === 1) setFeed(data.questions);
        else setFeed(prev => [...prev, ...data.questions]);
        setFeedHasMore(data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [feedPage]);

  return (
    <div className="min-h-screen bg-[#18181b] w-full">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-8 px-2 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-4 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-white mb-4">Global Feed</h1>
          {loading && <div className="text-zinc-400 italic">Loading...</div>}
          {!loading && feed.length === 0 && <div className="text-zinc-400 italic">No answered questions yet.</div>}
          {feed.map(q => <FeedCard key={q._id} question={q} />)}
          {feedHasMore && !loading && (
            <div className="flex justify-center mt-4">
              <button onClick={() => setFeedPage(p => p + 1)} className="px-6 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition">Load More</button>
            </div>
          )}
        </div>
        <aside className="md:col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#A8DADC] mb-2">Leaderboard</h2>
          {leaderboard ? (
            <>
              <LeaderboardCard title="Most Followers" users={leaderboard.mostFollowers} color="#A8DADC" />
              <LeaderboardCard title="Most Answers" users={leaderboard.mostAnswered} color="#B39CD0" />
              <LeaderboardCard title="Most Likes" users={leaderboard.mostLiked} color="#FFC1CC" />
              <LeaderboardCard title="Most Questions" users={leaderboard.mostAsked} color="#A8DADC" />
            </>
          ) : <div className="text-zinc-400 italic">Loading...</div>}
        </aside>
      </div>
    </div>
  );
} 