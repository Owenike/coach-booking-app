'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 👉 包裝用元件（讓 useSearchParams 運作並防止預渲染錯誤）
export default function EnterPasswordPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-10">載入中...</div>}>
      <EnterPasswordPage />
    </Suspense>
  );
}

// 👉 實際登入邏輯元件
function EnterPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('請重新登入');
      router.push('/login');
    }
  }, [email]);

  const handleLogin = async () => {
    setError('');

    if (!password) {
      setError('請輸入密碼');
      return;
    }

    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password_hash, role')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      setError('帳號不存在');
      setLoading(false);
      return;
    }

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, userData.password_hash);

    if (!isValid) {
      setError('密碼錯誤');
      setLoading(false);
      return;
    }

    // 建立 session（模擬登入，不再寄 OTP）
    const { error: loginError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (loginError) {
      setError('登入失敗：' + loginError.message);
      setLoading(false);
      return;
    }

    toast.success('登入成功，正在導向...');
    setLoading(false);

    if (userData.role === 'member') router.push('/member');
    else if (userData.role === 'coach') router.push('/coach');
    else if (userData.role === 'manager') router.push('/manager');
    else router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">輸入密碼</h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '登入中...' : '登入'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}

// ✅ 告訴 Next.js：這是動態頁面（不要預渲染）
export const dynamic = 'force-dynamic';
