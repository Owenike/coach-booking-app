'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 確保登入狀態，取得目前電話
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const userPhone = session?.user?.phone;
      if (!userPhone) {
        router.push('/login');
      } else {
        setPhone(userPhone);
      }
    });
  }, []);

  const handleChangePassword = async () => {
    setError('');
    if (!oldPassword || !newPassword || !confirm) {
      setError('請填寫所有欄位');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密碼長度至少 6 碼');
      return;
    }
    if (newPassword !== confirm) {
      setError('新密碼與確認密碼不一致');
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('password_hash')
      .eq('phone', phone)
      .single();

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(oldPassword, data?.password_hash);

    if (!isValid) {
      setError('舊密碼錯誤');
      setLoading(false);
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('phone', phone);

    setLoading(false);

    if (updateError) {
      setError('密碼更新失敗，請稍後再試');
    } else {
      toast.success('密碼已更新');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-xl font-semibold text-center text-slate-800 mb-6">修改密碼</h1>

        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="輸入舊密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="輸入新密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="再次確認新密碼"
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
        >
          {loading ? '修改中...' : '確認修改'}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
  );
}
