import React, { useState, useEffect } from 'react';

const privacyOptions = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'followers', label: 'Followers' },
  { value: 'following', label: 'Following' },
  { value: 'both', label: 'Followers and Following' },
  { value: 'none', label: 'No one' },
];

const hobbyOptions = [
  'Reading', 'Music', 'Sports', 'Cooking', 'Travel', 'Photography',
  'Painting', 'Dancing', 'Yoga', 'Meditation', 'Gardening', 'Collecting',
  'Gaming', 'Cinema', 'Theater', 'Concert', 'Festival', 'Camping',
  'Mountaineering', 'Swimming', 'Running', 'Cycling', 'Football', 'Basketball',
  'Volleyball', 'Tennis', 'Golf', 'Chess', 'Puzzle', 'Handcrafts',
  'Sewing', 'Knitting', 'Jewelry Making', 'Woodwork', 'Ceramics', 'Drawing',
  'Graphic Design', 'Web Design', 'Programming', 'Blogging', 'Vlogging',
  'Podcast', 'Radio', 'Television', 'Newspaper', 'Magazine', 'Philosophy',
  'Psychology', 'History', 'Geography', 'Science', 'Technology', 'Space',
  'Animals', 'Plants', 'Nature', 'Environment', 'Social Responsibility', 'Volunteering'
];

export default function Settings() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    hobbies: [],
    profilePhoto: '',
    height: '',
    weight: '',
    privacy: {
      questionCount: 'everyone',
      likeCount: 'everyone',
      followerCount: 'everyone',
      followingCount: 'everyone',
      mostAsked: 'everyone',
      mostLiked: 'everyone',
      mostFollowers: 'everyone',
      height: 'everyone',
      weight: 'everyone'
    },
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.user) {
          setForm({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            username: data.user.username || '',
            bio: data.user.bio || '',
            hobbies: data.user.hobbies || [],
            profilePhoto: data.user.profilePhoto || '',
            height: data.user.height || '',
            weight: data.user.weight || '',
            privacy: {
              questionCount: data.user.privacy?.questionCount || 'everyone',
              likeCount: data.user.privacy?.likeCount || 'everyone',
              followerCount: data.user.privacy?.followerCount || 'everyone',
              followingCount: data.user.privacy?.followingCount || 'everyone',
              mostAsked: data.user.privacy?.mostAsked || 'everyone',
              mostLiked: data.user.privacy?.mostLiked || 'everyone',
              mostFollowers: data.user.privacy?.mostFollowers || 'everyone',
              height: data.user.privacy?.height || 'everyone',
              weight: data.user.privacy?.weight || 'everyone'
            },
          });
        }
      } catch (err) {
        setMessage('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };
    try {
      fetchUser();
    } catch (err) {
      setMessage('Failed to fetch user data.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('privacy.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, privacy: { ...f.privacy, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleHobbyToggle = (hobby) => {
    setForm(f => ({
      ...f,
      hobbies: f.hobbies.includes(hobby)
        ? f.hobbies.filter(h => h !== hobby)
        : [...f.hobbies, hobby]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          height: form.height ? parseInt(form.height) : null,
          weight: form.weight ? parseInt(form.weight) : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setMessage('Settings saved!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#A8DADC] text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex justify-center items-start pt-10 px-2">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-[#23232C] border border-[#27272a] rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
        <h2 className="text-3xl font-extrabold text-[#A8DADC] mb-2">Settings & Privacy</h2>
        <div className="border-b border-[#27272a] pb-6">
          <h3 className="text-xl font-bold text-[#A8DADC] mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="First Name" />
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="Last Name" />
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Username</label>
              <input name="username" value={form.username} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="Username" />
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Profile Photo (URL)</label>
              <input name="profilePhoto" value={form.profilePhoto} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="https://..." />
            </div>
          </div>
        </div>
        <div className="border-b border-[#27272a] pb-6">
          <h3 className="text-xl font-bold text-[#A8DADC] mb-4">About</h3>
          <label className="block mb-1 text-[#E4E4E4] font-semibold">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="Tell us about yourself..." rows={3} />
        </div>
        <div className="border-b border-[#27272a] pb-6">
          <h3 className="text-xl font-bold text-[#A8DADC] mb-4">Hobbies</h3>
          <div className="flex flex-wrap gap-2">
            {hobbyOptions.map(hobby => (
              <button
                type="button"
                key={hobby}
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition ${form.hobbies.includes(hobby) ? 'bg-[#A8DADC] text-[#18181b]' : 'bg-[#23232C] text-[#A8DADC] border border-[#A8DADC]'}`}
                onClick={() => handleHobbyToggle(hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>
        <div className="border-b border-[#27272a] pb-6">
          <h3 className="text-xl font-bold text-[#A8DADC] mb-4">Physical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Height (cm)</label>
              <input name="height" value={form.height} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="Height" type="number" min={100} max={250} />
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Weight (kg)</label>
              <input name="weight" value={form.weight} onChange={handleChange} className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full" placeholder="Weight" type="number" min={30} max={300} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#A8DADC] mb-4">Privacy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your question count?</label>
              <select name="privacy.questionCount" value={form.privacy.questionCount} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your like count?</label>
              <select name="privacy.likeCount" value={form.privacy.likeCount} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your followers?</label>
              <select name="privacy.followerCount" value={form.privacy.followerCount} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your following?</label>
              <select name="privacy.followingCount" value={form.privacy.followingCount} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your most asked list?</label>
              <select name="privacy.mostAsked" value={form.privacy.mostAsked} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your most liked list?</label>
              <select name="privacy.mostLiked" value={form.privacy.mostLiked} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your most followers list?</label>
              <select name="privacy.mostFollowers" value={form.privacy.mostFollowers} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your height?</label>
              <select name="privacy.height" value={form.privacy.height} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#E4E4E4] font-semibold">Who can see your weight?</label>
              <select name="privacy.weight" value={form.privacy.weight} onChange={handleChange} className="py-2 px-3 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg w-full text-sm">
                {privacyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-lg font-bold text-base mt-2 transition-all shadow-md bg-[#B39CD0] text-[#18181b] hover:bg-[#A8DADC] active:bg-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC] focus:ring-offset-2">
          Save
        </button>
        {message && <div className="text-center text-[#A8DADC] mt-2 font-semibold">{message}</div>}
      </form>
    </div>
  );
} 