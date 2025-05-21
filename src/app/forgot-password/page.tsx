'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');

    if (!phone.startsWith('+886') || phone.length < 11) {
      setError('請輸入正確的台灣手機號碼（如 +886912345678）');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('phone', phone)
      .single();

    if (error || !data) {
      setError('查無此帳號');
      setLoading(false);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });

    setLoading(false);

    if (otpError) {
      setError('驗證碼發送失敗：' + otpError.message);
    } else {
      toast.success('驗證碼已送出');
      router.push(`/reset-password?phone=${encodeURIComponent(phone)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-xl font-semibold text-center text-slate-800 mb-6">忘記密碼</h1>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="請輸入手機號碼（+886 開頭）"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '發送中...' : '傳送驗證碼'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
