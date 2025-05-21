'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VerifyEmailSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) {
        toast.error('無效的驗證連結');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('email', email);

      if (error) {
        toast.error('驗證失敗，請重新登入');
        router.push('/login');
      } else {
        toast.success('Email 驗證成功，請設定密碼');
        setTimeout(() => {
          router.push(`/set-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }

      setLoading(false);
    };

    verifyEmail();
  }, [email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200 text-center">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">驗證中...</h1>
        {loading ? <p className="text-slate-600">正在處理您的驗證...</p> : null}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
