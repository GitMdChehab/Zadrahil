import React, { useState } from 'react';
import { AcademicCircle } from '../../types';

interface AddCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCircle: (circle: Omit<AcademicCircle, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const AddCircleModal: React.FC<AddCircleModalProps> = ({
  isOpen,
  onClose,
  onAddCircle,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AcademicCircle['type']>('حفظ ومراجعة');
  const [teacherName, setTeacherName] = useState('');
  const [days, setDays] = useState('الأحد - الأربعاء (عصراً)');
  const [timeSlot, setTimeSlot] = useState('16:00 - 17:30');
  const [room, setRoom] = useState('القاعة 1');
  const [maxStudents, setMaxStudents] = useState(15);
  const [period, setPeriod] = useState<'صباحي' | 'مسائي'>('مسائي');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !teacherName) {
      alert('يرجى ملء اسم الحلقة واسم المعلم');
      return;
    }

    onAddCircle({
      name,
      type,
      teacherName,
      days,
      timeSlot,
      room,
      studentsCount: 0,
      maxStudents: Number(maxStudents) || 15,
      period,
    });

    onShowToast(`تم إنشاء "${name}" بنجاح وإسنادها إلى ${teacherName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        <div className="bg-[#f7f9fb] px-6 py-4 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">إضافة حلقة قرآنية جديدة</h2>
              <p className="text-xs text-[#747779]">إنشاء شعبة تعليمية وتعيين المقر والمدرس</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747779] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#e0e3e5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">اسم الحلقة *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حلقة الإمام ورش، حلقة التميز القرآنية..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">المسار والمنهج</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="حفظ ومراجعة">حفظ ومراجعة</option>
                <option value="تلقين">تلقين وتصحيح تلاوة</option>
                <option value="تجويد متقدم">تجويد وإتقان متقدم</option>
                <option value="علوم شرعية">علوم شرعية وسيرة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">الفترة</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="مسائي">الفترة المسائية (عصراً ومغرباً)</option>
                <option value="صباحي">الفترة الصباحية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">المعلم المشرف *</label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="مثال: الشيخ عبدالله الدوسري"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">القاعة / الفصل</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="القاعة 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">الأيام</label>
              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="الأحد - الأربعاء"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">التوقيت</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="16:00 - 17:30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">الطاقة الاستيعابية (الحد الأقصى للطلاب)</label>
            <input
              type="number"
              min="5"
              max="35"
              value={maxStudents}
              onChange={(e) => setMaxStudents(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e1bfb5]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#59413a] hover:bg-[#f2f4f6] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#9b2f00] hover:bg-[#c2410c] text-white shadow-sm transition-all"
            >
              حفظ وتثبيت الحلقة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
