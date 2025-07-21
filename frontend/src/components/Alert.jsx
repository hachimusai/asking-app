import React from 'react';

export default function Alert({ open, type = 'info', title, message, onClose, onConfirm, confirmText = 'Evet', cancelText = 'İptal', showConfirm = false }) {
  if (!open) return null;
  const color = type === 'error' ? 'bg-[#FFC1CC] text-[#2C2C2C]' : type === 'success' ? 'bg-[#A8DADC] text-[#2C2C2C]' : 'bg-[#B39CD0] text-[#2C2C2C]';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-xs sm:max-w-sm flex flex-col gap-4 ${color} animate-fadeIn`}>
        {title && <div className="text-lg font-bold mb-1">{title}</div>}
        <div className="text-base">{message}</div>
        <div className="flex gap-2 justify-end mt-2">
          {showConfirm ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#23232C] text-[#E4E4E4] font-semibold hover:bg-[#18181b] transition">{cancelText}</button>
              <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-[#A8DADC] text-[#23232C] font-bold hover:bg-[#B39CD0] transition">{confirmText}</button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#23232C] text-[#E4E4E4] font-semibold hover:bg-[#18181b] transition">Kapat</button>
          )}
        </div>
      </div>
    </div>
  );
} 