'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NavBar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: session } = await supabase.auth.getSession();
      const phone = session.session?.user?.phone;
      if (!phone) return router.push('/login');
      setUserPhone(phone);

      const { data } = await supabase
        .from('users')
        .select('role, name')
        .eq('phone', phone)
        .single();

      if (data) {
        setUserRole(data.role || '');
        setUserName(data.name || '');
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      toast.error('登出失敗');
    } else {
      toast.success('已成功登出');
      router.push('/login');
    }
  };

  return (
    <>
      <nav className="w-full bg-white border-b shadow-sm mb-6">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
          <div
            className="text-lg font-bold text-slate-800 cursor-pointer"
            onClick={() => router.push('/login')}
          >
            APFEA 教練預約系統
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2">
            {userPhone && (
              <div className="text-sm text-slate-600">
                使用者：{userName}（{userPhone} / {userRole}）
              </div>
            )}
            <button
              onClick={() => router.push('/change-password')}
              className="text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 px-3 py-1 rounded"
            >
              修改密碼
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded disabled:opacity-50"
            >
              {loading ? '登出中...' : '登出'}
            </button>
          </div>
        </div>
      </nav>
      <ToastContainer position="bottom-center" autoClose={2000} />
    </>
  );
}
