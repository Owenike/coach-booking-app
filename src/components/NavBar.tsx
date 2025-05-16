'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function NavBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm mb-6">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="text-lg font-bold text-slate-800 cursor-pointer"
          onClick={() => router.push('/login')}
        >
          APFEA 教練預約系統
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
        >
          登出
        </button>
      </div>
    </nav>
  );
}
