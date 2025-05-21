'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('請輸入有效的 Email');
      return;
    }

    setLoading(true);

    // 查詢該 email 是否存在
    const { data: user, error } = await supabase
      .from('users')
      .select('email_verified, password_hash')
      .eq('email', email)
      .single();

    if (error || !user) {
      toast.error('此帳號不存在');
      setLoading(false);
      return;
    }

    if (!user.email_verified) {
      // 未驗證 → 發送驗證信
      const origin = window.location.origin;
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${origin}/verify-email-success?email=${email}`,
        },
      });

      if (sendError) {
        toast.error('驗證信寄送失敗');
      } else {
        toast.success('驗證信已寄出，請查收 Email');
      }

      setLoading(false);
      return;
    }

    // 若已驗證 → 判斷是否設定過密碼
    if (!user.password_hash) {
      router.push(`/set-password?email=${encodeURIComponent(email)}`);
    } else {
      router.push(`/enter-password?email=${encodeURIComponent(email)}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">登入系統</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="請輸入 Email"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '處理中...' : '下一步'}
        </button>
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
