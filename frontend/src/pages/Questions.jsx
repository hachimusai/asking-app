import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Questions() {
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/auth/questions/unanswered', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setUnanswered(data.questions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#18181b] w-full">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-10 px-2">
        <h2 className="text-2xl font-bold text-[#A8DADC] mb-6">Unanswered Questions</h2>
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-zinc-400 italic">Loading questions...</div>
          ) : unanswered.length === 0 ? (
            <div className="text-zinc-400 italic">No unanswered questions yet.</div>
          ) : (
            unanswered.map(q => <UnansweredCard key={q.id} question={q} />)
          )}
        </div>
      </div>
    </div>
  );
}

function UnansweredCard({ question }) {
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = async () => {
    if (!answer.trim()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/auth/questions/${question._id}/answer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer: answer.trim() })
      });
      
      if (res.ok) {
        setAnswered(true);
      } else {
        alert('Answer failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (answered) return null;
  
  return (
    <div className="bg-[#23232C] border border-[#27272a] rounded-2xl shadow-xl p-6 flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-1">
        {question.isAnonymous ? (
          <div className="w-8 h-8 rounded-full bg-[#B39CD0] flex items-center justify-center text-base font-bold text-[#18181b]">?</div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#A8DADC] flex items-center justify-center text-base font-bold text-[#18181b]">
            {question.from?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          <div className="font-bold text-[#A8DADC]">
            {question.isAnonymous ? 'Anonymous' : `${question.from?.firstName || ''} ${question.from?.lastName || ''}`}
          </div>
          <div className="text-xs text-zinc-400">{question.isAnonymous ? '' : `@${question.from?.username || ''}`}</div>
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
        <button 
          onClick={handleAnswer}
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-[#A8DADC] text-[#18181b] font-bold hover:bg-[#B39CD0] transition disabled:opacity-50"
        >
          {submitting ? 'Answering...' : 'Answer'}
        </button>
      </div>
    </div>
  );
} 