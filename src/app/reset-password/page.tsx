'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!phone) router.push('/login');
  }, [phone]);

  const handleReset = async () => {
    setError('');
    if (!code) {
      setError('請輸入驗證碼');
      return;
    }
    if (password.length < 6) {
      setError('密碼長度至少 6 碼');
      return;
    }
    if (password !== confirm) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms'
    });

    if (verifyError || !data?.user?.phone) {
      setError('驗證失敗，請重新操作');
      setLoading(false);
      return;
    }

    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('phone', phone);

    if (updateError) {
      setError('密碼更新失敗，請聯絡管理員');
      setLoading(false);
      return;
    }

    toast.success('密碼已重設，請重新登入');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-xl font-semibold text-center text-slate-800 mb-6">重設密碼</h1>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="請輸入簡訊驗證碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入新密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="再次確認密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '設定中...' : '設定密碼'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
