import React from 'react';

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="bg-[#23232C] rounded-3xl shadow-2xl p-10 flex flex-col gap-7 border border-[#444] max-w-lg w-full text-center items-center" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}>
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: '#A8DADC', letterSpacing: '-0.5px' }}>AskApp'e Hoş Geldin!</h1>
        <p className="text-[#E4E4E4] mb-4 text-lg font-medium">Giriş başarılı! Artık soru sorabilir, cevaplayabilir ve topluluğa katılabilirsin.</p>
        <button
          onClick={handleLogout}
          className="p-3 rounded-lg font-bold transition-all duration-200 shadow-md hover:scale-105 active:scale-95 bg-[#B39CD0] text-[#2C2C2C] tracking-wide"
          style={{ fontFamily: 'Montserrat, sans-serif', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
} 