import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const genderOptions = [
  { value: '', label: 'Select' },
  { value: 0, label: 'Female' },
  { value: 1, label: 'Male' },
  { value: 2, label: 'Prefer not to say' },
];

function checkPasswordStrength(password) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

export default function AuthForm({ mode = 'login', onSubmit, loading, error }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password2, setPassword2] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (mode === 'register') {
      if (password !== password2) {
        setFormError('Passwords do not match!');
        return;
      }
      if (!checkPasswordStrength(password)) {
        setFormError('Password is not strong enough!');
        return;
      }
      if (!firstName || !lastName || !username || !email || !password || !birthdate || gender === '') {
        setFormError('All fields are required!');
        return;
      }
      onSubmit({ firstName, lastName, username, email, password, password2, birthdate, gender });
    } else {
      if (!emailOrUsername || !password) {
        setFormError('All fields are required!');
        return;
      }
      onSubmit({ emailOrUsername, password });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#18181b] px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl bg-[#23232C] border border-[#27272a] flex flex-col gap-6">
        <h2 className="text-4xl font-extrabold text-white text-center mb-2 tracking-tight">{mode === 'login' ? 'AskApp Login' : 'AskApp Register'}</h2>
        <p className="text-center text-zinc-400 mb-4 text-base font-medium">{mode === 'login' ? 'Login with your username or email.' : 'Register now and join the questions!'}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'login' ? (
            <>
              <div>
                <label className="block mb-1 text-[#E4E4E4] font-semibold" htmlFor="emailOrUsername">Username or Email</label>
                <input
                  id="emailOrUsername"
                  type="text"
                  name="emailOrUsername"
                  autoComplete="username"
                  className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                  placeholder="username or example@mail.com"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  required
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-[#E4E4E4] font-semibold" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[#E4E4E4] font-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[#E4E4E4] font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">Repeat Password</label>
                  <input
                    type="password"
                    name="password2"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] placeholder-[#a1a1aa] focus:outline-none focus:border-[#A8DADC] focus:ring-2 focus:ring-[#A8DADC] rounded-lg shadow-sm w-full font-medium transition"
                    placeholder="Repeat Password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg shadow-sm w-full font-medium transition"
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#E4E4E4] font-semibold">Gender</label>
                  <select
                    name="gender"
                    className="py-3 px-4 border border-[#27272a] bg-[#18181b] text-[#E4E4E4] rounded-lg shadow-sm w-full font-medium transition"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    required
                  >
                    {genderOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          {mode === 'register' && (
            <div className="text-xs text-zinc-400 mb-2">
              Password must be at least 8 characters, contain uppercase, lowercase, number, and special character.
              {!checkPasswordStrength(password) && password.length > 0 && (
                <div className="text-[#FFC1CC] font-semibold mt-1">Password is not strong enough!</div>
              )}
            </div>
          )}
          {(formError || error) && <div className="text-center text-sm font-semibold animate-pulse text-[#FFC1CC]">{formError || error}</div>}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-bold text-base mt-2 transition-all shadow-md bg-[#B39CD0] text-[#18181b] hover:bg-[#A8DADC] active:bg-[#A8DADC] focus:outline-none focus:ring-2 focus:ring-[#A8DADC] focus:ring-offset-2 ${loading ? 'opacity-60' : ''}`}
            disabled={loading}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {loading ? 'Loading...' : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        <div className="mt-2 text-center">
          {mode === 'login' ? (
            <span className="text-[#E4E4E4]">Don't have an account?{' '}
              <Link to="/register" className="text-[#A8DADC] underline">Register Now</Link>
            </span>
          ) : (
            <span className="text-[#E4E4E4]">Already have an account?{' '}
              <Link to="/login" className="text-[#A8DADC] underline">Login</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
