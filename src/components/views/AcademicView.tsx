import React, { useState, useMemo } from 'react';
import { AcademicCircle, Student } from '../../types';
import { BRANCHES } from '../../data/dbData';

interface AcademicViewProps {
  circles: AcademicCircle[];
  students: Student[];
  onOpenAddCircle: () => void;
  onSelectCircle?: (circle: AcademicCircle) => void;
}

export const AcademicView: React.FC<AcademicViewProps> = ({
  circles,
  students,
  onOpenAddCircle,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedCircleForRoster, setSelectedCircleForRoster] = useState<AcademicCircle | null>(null);

  const filteredCircles = useMemo(() => {
    return circles.filter((c) => {
      const matchBranch = selectedBranch === 'all' || c.branch === selectedBranch;
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        String(c.number).includes(search);
      return matchBranch && matchSearch;
    });
  }, [circles, selectedBranch, search]);

  const curricula = [
    {
      id: 'cur-1',
      title: 'مسار التجويد والإتقان بالسند المتصل',
      desc: 'دراسة متون التجويد (تحفة الأطفال والمقدمة الجزرية) مع التطبيق العملي ونيل الإجازة المسندة.',
      levelsCount: '3 مستويات',
      studentsEnrolled: students.filter((s) => s.level?.includes('متقدم') || s.level?.includes('سند')).length || 38,
      icon: 'verified',
    },
    {
      id: 'cur-2',
      title: 'مسار الحفظ المتقن والمراجعة',
      desc: 'منهج الحفظ التراكمي بمعدل حزبين أسبوعياً مع المراجعة المستمرة ومتابعة السرد.',
      levelsCount: '5 مستويات',
      studentsEnrolled: students.filter((s) => s.level?.includes('الثاني') || s.level?.includes('الثالث')).length || 140,
      icon: 'menu_book',
    },
    {
      id: 'cur-3',
      title: 'مسار التلقين وبراعم القرآن',
      desc: 'تعليم القاعدة النورانية وتصحيح مخارج الحروف وقصار السور للفئات العمرية الناشئة.',
      levelsCount: 'مستويان',
      studentsEnrolled: students.filter((s) => s.level?.includes('التمهيدي') || s.level?.includes('الأول')).length || 98,
      icon: 'child_care',
    },
    {
      id: 'cur-4',
      title: 'حلقة النساء والأمهات وتدبر الآيات',
      desc: 'دروس أحكام التلاوة، التفسير الميسر، ومجالس مدارسة القرآن وتدبر معانيه لأمهات وسيدات الحي.',
      levelsCount: 'دورة مستمرة',
      studentsEnrolled: students.filter((s) => s.gender === 'نساء').length || 18,
      icon: 'auto_stories',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#855300] bg-amber-50 px-2.5 py-0.5 rounded-full">
              العام الدراسي 1445 هـ - 4 فروع معتمدة
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            الشؤون الأكاديمية والحلقات القرآنية (32 حلقة)
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            توزيع الحلقات على الفروع الأربعة: مصيلح (1-12)، مفرق الحجة (13-20)، النجارية (21-29)، الرادار (30-32)
          </p>
        </div>

        <button
          onClick={onOpenAddCircle}
          className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>إضافة حلقة جديدة</span>
        </button>
      </div>

      {/* Curricula & Tracks Section */}
      <div>
        <h2 className="text-base font-bold text-[#191c1e] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9b2f00]">library_books</span>
          المسارات التعليمية المعتمدة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {curricula.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#fea619] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#9b2f00] flex items-center justify-center mb-3 font-bold">
                  <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-[#191c1e] mb-1.5">{c.title}</h3>
                <p className="text-xs text-[#59413a] leading-relaxed">{c.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e1bfb5]/40 flex items-center justify-between text-xs font-semibold">
                <span className="text-[#855300] bg-amber-50 px-2 py-0.5 rounded-md">{c.levelsCount}</span>
                <span className="text-emerald-700 font-bold">{c.studentsEnrolled} طالب مسجل</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedBranch('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedBranch === 'all'
              ? 'bg-[#191c1e] text-white shadow-xs'
              : 'bg-white text-[#59413a] border border-[#e1bfb5] hover:bg-[#f2f4f6]'
          }`}
        >
          كل الحلقات ({circles.length})
        </button>
        {BRANCHES.map((branch) => {
          const count = circles.filter((c) => c.branch === branch).length;
          return (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBranch === branch
                  ? 'bg-[#9b2f00] text-white shadow-xs'
                  : 'bg-white text-[#59413a] border border-[#e1bfb5] hover:bg-[#f2f4f6]'
              }`}
            >
              <span>{branch}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedBranch === branch ? 'bg-white/20 text-white' : 'bg-[#f2f4f6] text-[#747779]'
              }`}>
                {count} حلقات
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث برقم الحلقة، اسم الحلقة، أو اسم المعلم..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#f2f4f6] border border-transparent text-xs text-[#191c1e] focus:bg-white focus:border-[#9b2f00] outline-none"
          />
          <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[18px]">
            search
          </span>
        </div>
        <div className="text-xs text-[#747779]">
          الحلقات المعروضة: <strong className="text-[#191c1e]">{filteredCircles.length}</strong> من أصل <strong className="text-[#191c1e]">{circles.length}</strong>
        </div>
      </div>

      {/* Active Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCircles.map((circle) => {
          const circleStudents = students.filter(
            (s) => s.circleId === circle.id || s.circleNumber === circle.number
          );
          const actualCount = circleStudents.length || circle.studentsCount;
          const fillRate = Math.round((actualCount / circle.maxStudents) * 100);

          return (
            <div
              key={circle.id}
              className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between hover:border-[#9b2f00] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-[#9b2f00] bg-orange-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>#{circle.number}</span>
                    <span>{circle.type}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#59413a] bg-[#f2f4f6] px-2 py-0.5 rounded-md">
                    {circle.room}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#191c1e]">{circle.name}</h3>
                <p className="text-xs text-[#59413a] mt-1 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#747779]">person</span>
                  <span>المعلم/ة: {circle.teacherName}</span>
                </p>

                <div className="mt-2 text-[11px] text-[#855300] bg-amber-50/70 px-2 py-1 rounded">
                  فرع: {circle.branch}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#747779] bg-[#f7f9fb] p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span>الأيام:</span>
                    <span className="font-semibold text-[#191c1e]">{circle.days}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التوقيت:</span>
                    <span className="font-mono text-[#191c1e]" dir="ltr">{circle.timeSlot}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e1bfb5]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#59413a]">الطلاب المسجلون:</span>
                  <span className="font-bold text-[#191c1e]">
                    {actualCount} من {circle.maxStudents} ({fillRate}%)
                  </span>
                </div>
                <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fillRate >= 90
                        ? 'bg-amber-600'
                        : 'bg-linear-to-r from-[#fea619] to-[#9b2f00]'
                    }`}
                    style={{ width: `${Math.min(fillRate, 100)}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => setSelectedCircleForRoster(circle)}
                  className="w-full mt-2 py-1.5 bg-[#f2f4f6] hover:bg-[#9b2f00] hover:text-white rounded-lg text-xs font-bold text-[#59413a] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span>عرض كشف طلاب الحلقة ({actualCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Circle Roster Modal */}
      {selectedCircleForRoster && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-[#e1bfb5] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#e1bfb5] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#9b2f00] bg-orange-50 px-2 py-0.5 rounded-full">
                  حلقة #{selectedCircleForRoster.number} - {selectedCircleForRoster.branch}
                </span>
                <h3 className="text-lg font-bold text-[#191c1e] mt-1">
                  كشف طلاب: {selectedCircleForRoster.name}
                </h3>
                <p className="text-xs text-[#59413a]">
                  المعلم/ة: {selectedCircleForRoster.teacherName} | {selectedCircleForRoster.days} ({selectedCircleForRoster.timeSlot})
                </p>
              </div>
              <button
                onClick={() => setSelectedCircleForRoster(null)}
                className="w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#e0e3e5] flex items-center justify-center text-[#59413a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {(() => {
                const roster = students.filter(
                  (s) => s.circleId === selectedCircleForRoster.id || s.circleNumber === selectedCircleForRoster.number
                );
                if (roster.length === 0) {
                  return <p className="text-center py-8 text-xs text-[#747779]">لا يوجد طلاب مسجلون حالياً في هذه الحلقة</p>;
                }
                return (
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#e1bfb5] text-[#747779] font-bold">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">اسم الطالب</th>
                        <th className="py-2 px-3">العمر</th>
                        <th className="py-2 px-3">الصف الدراسي</th>
                        <th className="py-2 px-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e1bfb5]/40">
                      {roster.map((st, index) => (
                        <tr key={st.id} className="hover:bg-[#f2f4f6]">
                          <td className="py-2.5 px-3 font-mono text-[#747779]">{index + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-[#191c1e]">{st.name}</td>
                          <td className="py-2.5 px-3 text-[#59413a]">{st.age} سنة</td>
                          <td className="py-2.5 px-3 text-[#59413a]">{st.grade || '—'}</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            <div className="p-4 border-t border-[#e1bfb5] bg-[#f7f9fb] rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedCircleForRoster(null)}
                className="px-5 py-2 bg-[#9b2f00] text-white font-bold text-xs rounded-xl hover:bg-[#c2410c] cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
