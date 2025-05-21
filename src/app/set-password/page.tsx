'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ 若無 phone 或登入者不是此 phone，直接跳轉回 /login
  useEffect(() => {
    const verifySession = async () => {
      if (!phone) {
        router.push('/login');
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      const sessionPhone = session.session?.user?.phone;

      if (!sessionPhone || sessionPhone !== phone) {
        toast.error('驗證失敗，請重新登入');
        router.push('/login');
      }
    };

    verifySession();
  }, [phone, router]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('密碼長度至少需 6 碼');
      return;
    }
    if (password !== confirm) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('phone', phone);

    if (updateError) {
      setError('密碼儲存失敗，請聯絡管理員');
      setLoading(false);
      return;
    }

    // 自動建立 Session
    const { error: loginError } = await supabase.auth.signInWithOtp({ phone });

    if (loginError) {
      setError('登入失敗：' + loginError.message);
      setLoading(false);
      return;
    }

    // 查 role 後導向
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('phone', phone)
      .single();

    toast.success('密碼設定成功，正在登入...');
    setLoading(false);

    if (user?.role === 'member') router.push('/member');
    else if (user?.role === 'coach') router.push('/coach');
    else if (user?.role === 'manager') router.push('/manager');
    else router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">設定密碼</h1>

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
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '設定中...' : '設定密碼並登入'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
