import React, { useState } from 'react';
import { AcademicCircle, ScheduleClass, Student } from '../../types';

interface ScheduleViewProps {
  scheduleClasses: ScheduleClass[];
  circles: AcademicCircle[];
  students: Student[];
  onShowToast: (msg: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  scheduleClasses,
  circles,
  students,
  onShowToast,
}) => {
  const [selectedCircleId, setSelectedCircleId] = useState<string>(circles[0]?.id || 'circle-1');
  const [activeFilter, setActiveFilter] = useState<'all' | 'quran' | 'sharia' | 'events'>('all');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    'st-1': 'present',
    'st-2': 'late',
    'st-3': 'absent',
    'st-4': 'present',
    'st-5': 'present',
    'st-6': 'present',
  });

  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    onShowToast(`تم حفظ وتوثيق سجل الحضور لحلقة "${circles.find(c => c.id === selectedCircleId)?.name}" بنجاح.`);
  };

  const currentCircle = circles.find((c) => c.id === selectedCircleId) || circles[0];
  const circleStudents = students.filter((s) => s.circleId === selectedCircleId || students.length < 5);

  const presentCount = circleStudents.filter((s) => (attendanceState[s.id] || 'present') === 'present').length;
  const lateCount = circleStudents.filter((s) => attendanceState[s.id] === 'late').length;
  const absentCount = circleStudents.filter((s) => attendanceState[s.id] === 'absent').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            الجدول الأسبوعي وتسجيل الحضور
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            متابعة مواعيد الحلقات وتوزيع القاعات مع نظام رصد الحضور اللحظي
          </p>
        </div>

        <div className="flex bg-[#f2f4f6] p-1 rounded-xl text-xs font-bold self-start md:self-auto">
          {[
            { id: 'all', label: 'كافة الأنشطة' },
            { id: 'quran', label: 'حلقات القرآن' },
            { id: 'sharia', label: 'العلوم الشرعية' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === f.id
                  ? 'bg-white text-[#9b2f00] shadow-xs font-bold'
                  : 'text-[#59413a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Weekly Schedule Grid (Left 2 cols) & Quick Attendance Widget (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Calendar Schedule */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9b2f00]">calendar_view_week</span>
              توزيع الحلقات على مدار الأسبوع
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9b2f00]"></span> قرآن
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#855300]"></span> شرعي
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fea619]"></span> عام
              </span>
            </div>
          </div>

          {/* Days Columns */}
          <div className="grid grid-cols-7 gap-2 min-h-[420px] bg-[#f7f9fb] p-3 rounded-xl border border-[#e1bfb5]/50 overflow-x-auto">
            {daysOfWeek.map((dayName, dayIdx) => {
              const dayClasses = scheduleClasses.filter((sc) => sc.dayIndex === dayIdx);
              const isToday = dayIdx === 1; // Example: Monday / الإثنين

              return (
                <div
                  key={dayIdx}
                  className={`flex flex-col rounded-xl p-2 min-w-[100px] ${
                    isToday ? 'bg-amber-50/60 border border-[#fea619]' : 'bg-white border border-[#e1bfb5]/30'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-[#e1bfb5]/30 mb-2">
                    <p className={`text-xs font-bold ${isToday ? 'text-[#9b2f00]' : 'text-[#191c1e]'}`}>
                      {dayName}
                    </p>
                    {isToday && (
                      <span className="text-[9px] font-bold bg-[#9b2f00] text-white px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                        اليوم
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {dayClasses.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-[#747779] py-8">
                        فترة راحة
                      </div>
                    ) : (
                      dayClasses.map((cls) => {
                        let bgClass = 'bg-[#fff8e1] border-[#ffe082] text-[#684000]';
                        if (cls.variant === 'primary') {
                          bgClass = 'bg-orange-50 border-orange-200 text-[#9b2f00]';
                        } else if (cls.variant === 'tertiary') {
                          bgClass = 'bg-amber-50 border-amber-200 text-[#855300]';
                        } else if (cls.variant === 'cancelled') {
                          bgClass = 'bg-red-50 border-red-200 text-[#ba1a1a] opacity-75';
                        }

                        return (
                          <div
                            key={cls.id}
                            className={`p-2 rounded-lg border text-xs flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow ${bgClass}`}
                          >
                            <div>
                              <p className="font-bold text-[11px] leading-tight line-clamp-1">{cls.title}</p>
                              <p className="text-[10px] opacity-80 mt-0.5">{cls.teacher}</p>
                            </div>
                            <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[9px] font-semibold">
                              <span>{cls.room}</span>
                              <span dir="ltr">{cls.startTime}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Attendance Widget */}
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fea619]">how_to_reg</span>
                تسجيل الحضور السريع
              </h2>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                جلسة مباشرة
              </span>
            </div>

            {/* Circle Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#59413a] mb-1">اختر الحلقة المستهدفة</label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#f2f4f6] text-xs font-bold text-[#191c1e] border-none outline-none"
              >
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.teacherName})
                  </option>
                ))}
              </select>
            </div>

            {/* Summary counters */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                <span className="block text-[10px] text-emerald-700 font-bold">حاضر</span>
                <span className="text-base font-black text-emerald-800">{presentCount}</span>
              </div>
              <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                <span className="block text-[10px] text-amber-700 font-bold">متأخر</span>
                <span className="text-base font-black text-amber-800">{lateCount}</span>
              </div>
              <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                <span className="block text-[10px] text-red-700 font-bold">غائب</span>
                <span className="text-base font-black text-red-800">{absentCount}</span>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {circleStudents.map((student) => {
                const currentStatus = attendanceState[student.id] || 'present';
                return (
                  <div
                    key={student.id}
                    className="p-2.5 rounded-xl bg-[#f7f9fb] border border-[#e1bfb5]/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#fea619]/20 text-[#9b2f00] text-xs flex items-center justify-center font-bold">
                        {student.avatarLetter || student.name.charAt(0)}
                      </span>
                      <span className="text-xs font-bold text-[#191c1e]">{student.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'present')}
                        title="حاضر"
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-[#59413a] border border-[#c4c7c9] hover:bg-emerald-50'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'late')}
                        title="متأخر"
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-[#59413a] border border-[#c4c7c9] hover:bg-amber-50'
                        }`}
                      >
                        ⏱
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'absent')}
                        title="غائب"
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : 'bg-white text-[#59413a] border border-[#c4c7c9] hover:bg-red-50'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e1bfb5]/40">
            <button
              onClick={handleSaveAttendance}
              className="w-full py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>حفظ سجل الحضور لليوم</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
