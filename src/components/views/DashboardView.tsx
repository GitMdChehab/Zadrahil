import React, { useState } from 'react';
import { AcademicCircle, Donation, NavTab, Student } from '../../types';

interface DashboardViewProps {
  students: Student[];
  circles: AcademicCircle[];
  donations: Donation[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewRegistration: () => void;
  onOpenAddDonation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  circles,
  donations,
  onNavigateTab,
  onOpenNewRegistration,
  onOpenAddDonation,
}) => {
  const [attendancePeriod, setAttendancePeriod] = useState<'thisWeek' | 'lastWeek'>('thisWeek');

  const totalDonationsAmount = donations.reduce((acc, d) => acc + d.amount, 0);
  const activeStudentsCount = students.filter((s) => s.status === 'منتظم').length;
  const attendanceRate = Math.round((activeStudentsCount / (students.length || 1)) * 100);

  const weeklyAttendanceData = [
    { day: 'الأحد', rate: 96, count: '142 / 148' },
    { day: 'الإثنين', rate: 94, count: '139 / 148' },
    { day: 'الثلاثاء', rate: 92, count: '136 / 148' },
    { day: 'الأربعاء', rate: 98, count: '145 / 148' },
    { day: 'الخميس', rate: 91, count: '134 / 148' },
    { day: 'السبت', rate: 88, count: '130 / 148' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Page Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#855300]">النظام يعمل بكفاءة عالية</span>
          </div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            مرحباً بك في لوحة تحكم مركز زاد الرحيل
          </h1>
          <p className="text-sm text-[#59413a] mt-0.5">
            إدارة متكاملة للحلقات القرآنية والعلوم الشرعية والأنشطة الإدارية والمالية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewRegistration}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>تسجيل طالب جديد</span>
          </button>
          <button
            onClick={onOpenAddDonation}
            className="px-4 py-2.5 bg-[#fea619] hover:bg-[#ffb733] text-[#684000] rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            <span>إضافة تبرع</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div
          onClick={() => onNavigateTab('persons')}
          className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#9b2f00] cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#747779]">إجمالي الطلاب المسجلين</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#9b2f00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#191c1e]">{students.length}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              +8% هذا الشهر
            </span>
          </div>
          <p className="text-xs text-[#59413a] mt-2 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{activeStudentsCount} منتظم</span>
            <span>•</span>
            <span>{students.length - activeStudentsCount} بحاجة متابعة</span>
          </p>
        </div>

        {/* Card 2: Circles */}
        <div
          onClick={() => onNavigateTab('academic')}
          className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#9b2f00] cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#747779]">الحلقات القرآنية النشطة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#855300] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#191c1e]">{circles.length}</span>
            <span className="text-xs font-semibold text-[#855300] bg-amber-50 px-2 py-0.5 rounded-md">
              6 قاعات مجهزة
            </span>
          </div>
          <p className="text-xs text-[#59413a] mt-2">
            تغطي مستويات التلقين، الحفظ، والتجويد المتقدم
          </p>
        </div>

        {/* Card 3: Attendance */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#9b2f00] cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#747779]">متوسط الحضور الأسبوعي</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#191c1e]">{attendanceRate}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              ممتاز
            </span>
          </div>
          <div className="w-full bg-[#f2f4f6] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Donations */}
        <div
          onClick={() => onNavigateTab('donations')}
          className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#9b2f00] cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#747779]">إجمالي التبرعات الموثقة</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#191c1e]">
              {totalDonationsAmount.toLocaleString('ar-SA')}
            </span>
            <span className="text-xs font-bold text-[#747779]">ر.س</span>
          </div>
          <p className="text-xs text-[#59413a] mt-2">
            {donations.length} عمليات دعم مسجلة هذا الفصل
          </p>
        </div>
      </div>

      {/* Main Grid: Attendance Chart & Circles Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9b2f00]">bar_chart</span>
                مؤشر الحضور اليومي للحلقات
              </h2>
              <p className="text-xs text-[#747779]">رصد نسبة الحضور الفعلي للطلاب طوال أيام الأسبوع</p>
            </div>
            <div className="flex bg-[#f2f4f6] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setAttendancePeriod('thisWeek')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  attendancePeriod === 'thisWeek'
                    ? 'bg-white text-[#9b2f00] shadow-xs font-bold'
                    : 'text-[#59413a]'
                }`}
              >
                هذا الأسبوع
              </button>
              <button
                onClick={() => setAttendancePeriod('lastWeek')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  attendancePeriod === 'lastWeek'
                    ? 'bg-white text-[#9b2f00] shadow-xs font-bold'
                    : 'text-[#59413a]'
                }`}
              >
                الأسبوع السابق
              </button>
            </div>
          </div>

          {/* Bars representation */}
          <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 min-h-[200px]">
            {weeklyAttendanceData.map((d, index) => {
              const heightPct = d.rate;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-[#9b2f00] opacity-0 group-hover:opacity-100 transition-opacity bg-orange-50 px-1.5 py-0.5 rounded">
                    {d.rate}%
                  </div>
                  <div className="w-full max-w-[48px] bg-[#f2f4f6] rounded-xl h-44 relative flex items-end overflow-hidden p-1">
                    <div
                      className="w-full rounded-lg bg-linear-to-t from-[#9b2f00] to-[#fea619] group-hover:brightness-110 transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-[#191c1e]">{d.day}</span>
                  <span className="text-[10px] text-[#747779]">{d.count}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#e1bfb5]/40 flex items-center justify-between text-xs text-[#59413a]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#fea619]"></span>
                <span>نسبة الحضور المكتمل</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#f2f4f6]"></span>
                <span>الغياب والاعتذار</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-[#9b2f00] font-bold hover:underline flex items-center gap-1"
            >
              <span>تسجيل الحضور اليومي</span>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
          </div>
        </div>

        {/* Active Today Circles & Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fea619]">schedule</span>
                حلقات اليوم المقررة
              </h2>
              <span className="text-xs font-bold text-[#855300] bg-amber-50 px-2 py-0.5 rounded-lg">
                الفترة المسائية
              </span>
            </div>

            <div className="space-y-3">
              {circles.slice(0, 3).map((circle) => (
                <div
                  key={circle.id}
                  className="p-3.5 rounded-xl bg-[#f7f9fb] border border-[#e1bfb5]/50 hover:border-[#9b2f00]/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1e]">{circle.name}</h4>
                      <p className="text-[11px] text-[#59413a] mt-0.5">{circle.teacherName}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#e1bfb5] text-[#9b2f00]">
                      {circle.room}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#747779]">
                    <span className="flex items-center gap-1" dir="ltr">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {circle.timeSlot}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {circle.studentsCount} / {circle.maxStudents} طالب
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e1bfb5]/40">
            <button
              onClick={() => onNavigateTab('academic')}
              className="w-full py-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e0e3e5] text-xs font-bold text-[#59413a] transition-colors flex items-center justify-center gap-1"
            >
              <span>عرض كل الحلقات والمناهج</span>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Students Table Preview */}
      <div className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e1bfb5] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#191c1e]">سجل الطلاب المسجلين حديثاً</h2>
            <p className="text-xs text-[#747779]">أحدث الطلاب المضافين إلى مختلف المستويات والحلقات</p>
          </div>
          <button
            onClick={() => onNavigateTab('persons')}
            className="text-xs font-bold text-[#9b2f00] hover:underline flex items-center gap-1"
          >
            <span>عرض دليل الطلاب الكامل</span>
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                <th className="py-3 px-6">اسم الطالب</th>
                <th className="py-3 px-4">رقم القيد</th>
                <th className="py-3 px-4">المستوى الدراسي</th>
                <th className="py-3 px-4">الحلقة المقيد بها</th>
                <th className="py-3 px-4">حالة الحضور</th>
                <th className="py-3 px-6 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
              {students.slice(0, 4).map((student) => (
                <tr key={student.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#191c1e] flex items-center gap-2.5">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
                        {student.avatarLetter || student.name.charAt(0)}
                      </span>
                    )}
                    <span>{student.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#59413a]">{student.nationalId}</td>
                  <td className="py-3.5 px-4 text-[#59413a]">{student.level}</td>
                  <td className="py-3.5 px-4 font-medium text-[#191c1e]">{student.circleName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        student.status === 'منتظم'
                          ? 'bg-emerald-50 text-emerald-800'
                          : student.status === 'تأخير متكرر'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-left">
                    <button
                      onClick={() => onNavigateTab('persons')}
                      className="text-[#9b2f00] font-bold hover:underline"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
