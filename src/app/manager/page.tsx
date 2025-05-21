'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import NavBar from '../../components/NavBar';

export default function ManagerPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member',
    remaining_sessions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.from('users').select('*');
      const { data: recordData } = await supabase.from('booking_records').select('*');
      setUsers(userData || []);
      setRecords(recordData || []);
    };
    fetchData();
  }, []);

  const addUser = async () => {
    if (!newUser.name || !newUser.email || (newUser.role === 'member' && newUser.remaining_sessions <= 0)) return;
    await supabase.from('users').insert(newUser);
    setNewUser({ name: '', email: '', role: 'member', remaining_sessions: 0 });
    location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <NavBar />
      <div className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-8">經理後台管理</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">新增教練 / 會員</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input
              placeholder="姓名"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-4 py-2 border rounded-md"
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="px-4 py-2 border rounded-md"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="member">會員</option>
              <option value="coach">教練</option>
            </select>
            <input
              type="number"
              placeholder="堂數"
              value={newUser.remaining_sessions}
              onChange={(e) => setNewUser({ ...newUser, remaining_sessions: Number(e.target.value) })}
              className="px-4 py-2 border rounded-md"
              disabled={newUser.role !== 'member'}
            />
            <button
              onClick={addUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              新增
            </button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">會員列表</h2>
          <div className="space-y-3">
            {users.filter(u => u.role === 'member').map((user) => (
              <div key={user.id} className="flex flex-col md:flex-row justify-between items-center border rounded-md px-4 py-3 bg-slate-50 shadow-sm">
                <div className="text-slate-700">
                  {user.name}（{user.email}）剩餘堂數：{user.remaining_sessions}
                </div>
                <input
                  type="number"
                  defaultValue={user.remaining_sessions}
                  onBlur={(e) =>
                    supabase.from('users').update({ remaining_sessions: Number(e.target.value) }).eq('id', user.id).then(() => location.reload())
                  }
                  className="mt-2 md:mt-0 border px-3 py-1 rounded-md w-32 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

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
