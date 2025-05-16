'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import NavBar from '../../components/NavBar';
import 'react-toastify/dist/ReactToastify.css';

type Slot = {
  id: string;
  date: string;
  time: string;
  is_booked: boolean;
};

type User = {
  id: string;
  name: string;
  phone: string;
  remaining_sessions: number;
};

type BookingRecord = {
  id: string;
  date: string;
  time: string;
};

type FormData = {
  slotId: string;
};

export default function MemberPage() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<BookingRecord[]>([]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await supabase.auth.getSession();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const phone = session.data.session?.user.phone;

      if (phone) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData } = await supabase.from('users').select('*').eq('phone', phone).single();
        setUser(userData as User);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: booking } = await supabase
          .from('booking_records')
          .select('*')
          .eq('member_phone', phone)
          .order('date', { ascending: false });
        setRecords((booking as BookingRecord[]) || []);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: available } = await supabase
        .from('available_slots')
        .select('*')
        .eq('is_booked', false);
      setSlots((available as Slot[]) || []);
    };

    fetchUserAndData();
  }, []);

  const onSubmit = async (formData: FormData) => {
    const { slotId } = formData;
    const selectedSlot = slots.find((s) => s.id === slotId);
    if (!selectedSlot || !user) return;

    await supabase.from('booking_records').insert({
      member_name: user.name,
      member_phone: user.phone,
      date: selectedSlot.date,
      time: selectedSlot.time,
    });

    await supabase.from('available_slots').update({ is_booked: true }).eq('id', slotId);

    toast.success('預約成功！');
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <NavBar />

      <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">會員預約中心</h1>

        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-md">
          <h2 className="text-lg font-semibold text-green-800 mb-1">📲 加入 LINE 接收預約通知</h2>
          <p className="text-sm text-green-700">
            請掃描下方 QR Code 加入我們的 LINE 官方帳號，並傳送您的手機號碼（如：+886912345678）來完成綁定。
          </p>
          <div className="flex justify-center mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://qr-official.line.me/gs/M_373obwhc_GW.png?oat_content=qr"
              alt="加入 LINE"
              className="w-40 h-40"
            />
          </div>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-slate-700 font-medium">👤 {user.name}</p>
            <p className="text-slate-600 text-sm">電話：{user.phone}</p>
            <p className="text-slate-600 text-sm">剩餘堂數：{user.remaining_sessions}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">選擇預約時段</label>
            <select
              {...register('slotId')}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">請選擇</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.date} {slot.time}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
          >
            立即預約
          </button>
        </form>

        <h2 className="text-lg font-semibold mt-8 mb-2 text-slate-700">📋 預約紀錄</h2>
        <ul className="space-y-2 max-h-[200px] overflow-y-auto">
          {records.map((r) => (
            <li key={r.id} className="border p-3 rounded-md bg-slate-50 text-slate-700">
              {r.date} {r.time}
            </li>
          ))}
        </ul>

        <ToastContainer
          position="bottom-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
