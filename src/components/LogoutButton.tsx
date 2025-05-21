'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('登出失敗');
    } else {
      toast.success('已登出');
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:underline"
    >
      登出
    </button>
  );
}
