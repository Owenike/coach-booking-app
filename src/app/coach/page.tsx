'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import NavBar from '../../components/NavBar';

export default function CoachPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member',
    remaining_sessions: 0,
  });

  useEffect(() => {
    supabase.from('booking_records').select('*').then(({ data }) => setSlots(data || []));
  }, [refresh]);

  const addSlot = async () => {
    if (!date || !time) return;
    await supabase.from('available_slots').insert({ date, time, is_booked: false });
    setDate('');
    setTime('');
    setRefresh(!refresh);
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || newUser.remaining_sessions <= 0) return;
    await supabase.from('users').insert(newUser);
    setNewUser({ name: '', email: '', role: 'member', remaining_sessions: 0 });
    setRefresh(!refresh);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <NavBar />
      <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">教練後台管理</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">新增會員</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <input
              type="number"
              placeholder="堂數"
              value={newUser.remaining_sessions}
              onChange={(e) => setNewUser({ ...newUser, remaining_sessions: Number(e.target.value) })}
              className="px-4 py-2 border rounded-md"
            />
            <button
              onClick={addUser}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            >
              新增會員
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">學生預約紀錄</h2>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {slots.length === 0 ? (
              <p className="text-slate-500">目前尚無預約紀錄</p>
            ) : (
              slots.map((r) => (
                <li key={r.id} className="border p-3 rounded-md bg-slate-50 shadow-sm">
                  <p className="text-slate-700 font-medium">{r.member_name}</p>
                  <p className="text-sm text-slate-500">{r.date} {r.time}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
