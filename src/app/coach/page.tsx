'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import NavBar from '../../components/NavBar';

interface BookingRecord {
  id: string;
  member_name: string;
  date: string;
  time: string;
}

export default function CoachPage() {
  const [slots, setSlots] = useState<BookingRecord[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from('booking_records').select('*').order('date');
      setSlots((data as BookingRecord[]) || []);
    };
    fetchSlots();
  }, [refresh]);

  const addSlot = async () => {
    if (!date || !time) return;
    await supabase.from('available_slots').insert({ date, time, is_booked: false });
    setDate('');
    setTime('');
    setRefresh(!refresh);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <NavBar />

      <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">教練後台管理</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">預約日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">預約時間</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addSlot}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
            >
              新增可預約時段
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
}
