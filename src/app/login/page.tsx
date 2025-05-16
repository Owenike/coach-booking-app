'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userPhone = session?.user?.phone;
      if (userPhone) {
        supabase.from('users').select('role').eq('phone', userPhone).single().then(({ data }) => {
          if (data?.role === 'member') router.push('/member');
          if (data?.role === 'coach') router.push('/coach');
          if (data?.role === 'manager') router.push('/manager');
        });
      }
    });
  }, [router]); // ✅ 已補上依賴

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    else setStep('verify');
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) {
      setError(error.message);
    } else {
      const userPhone = data?.user?.phone;
      const { data: user } = await supabase.from('users').select('role').eq('phone', userPhone).single();
      if (user?.role === 'member') router.push('/member');
      if (user?.role === 'coach') router.push('/coach');
      if (user?.role === 'manager') router.push('/manager');
      else setError('尚未註冊身份，請聯絡管理員');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">手機登入</h1>
        {step === 'phone' ? (
          <div className="space-y-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="請輸入電話，例如 +886912345678"
              className="w-full px-4 py-2 border rounded-md"
            />
            <button onClick={sendOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
              發送驗證碼
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="輸入簡訊驗證碼"
              className="w-full px-4 py-2 border rounded-md"
            />
            <button onClick={verifyOtp} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
              驗證並登入
            </button>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
