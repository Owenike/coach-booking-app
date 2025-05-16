'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import NavBar from '../../components/NavBar';

export default function ManagerPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: '', phone: '', role: 'member', remaining_sessions: 0 });

  useEffect(() => {
    supabase.from('users').select('*').then(({ data }) => setUsers(data || []));
    supabase.from('booking_records').select('*').then(({ data }) => setRecords(data || []));
  }, []);

  const updateSessions = async (id: string, sessions: number) => {
    await supabase.from('users').update({ remaining_sessions: sessions }).eq('id', id);
    location.reload();
  };

  const addUser = async () => {
    await supabase.from('users').insert(newUser);
    location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <NavBar />

      <div className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-8">經理後台管理</h1>

        {/* 新增會員 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">新增會員</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              placeholder="姓名"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="電話"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="堂數"
              value={newUser.remaining_sessions}
              onChange={(e) => setNewUser({ ...newUser, remaining_sessions: Number(e.target.value) })}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addUser}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2"
            >
              新增會員
            </button>
          </div>
        </section>

        {/* 修改會員堂數 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">會員列表</h2>
          <div className="space-y-3">
            {users.filter(u => u.role === 'member').map((user) => (
              <div key={user.id} className="flex flex-col md:flex-row justify-between items-center border rounded-md px-4 py-3 bg-slate-50 shadow-sm">
                <div className="text-slate-700">
                  {user.name}（{user.phone}）剩餘堂數：{user.remaining_sessions}
                </div>
                <input
                  type="number"
                  defaultValue={user.remaining_sessions}
                  onBlur={(e) => updateSessions(user.id, Number(e.target.value))}
                  className="mt-2 md:mt-0 border px-3 py-1 rounded-md w-32 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 預約紀錄 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">全部預約紀錄</h2>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {records.map((r) => (
              <li key={r.id} className="border p-3 rounded-md bg-slate-50 shadow-sm">
                <p className="font-medium text-slate-700">{r.member_name}</p>
                <p className="text-sm text-slate-500">{r.date} {r.time}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
