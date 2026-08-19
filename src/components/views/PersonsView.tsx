import React, { useState, useMemo } from 'react';
import { AcademicCircle, CenterBranch, Student, Teacher } from '../../types';
import { BRANCHES } from '../../data/dbData';

interface PersonsViewProps {
  students: Student[];
  circles: AcademicCircle[];
  teachers: Teacher[];
  onOpenNewRegistration: () => void;
  onSelectStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateStatus: (studentId: string, status: Student['status']) => void;
}

export const PersonsView: React.FC<PersonsViewProps> = ({
  students,
  circles,
  teachers,
  onOpenNewRegistration,
  onSelectStudent,
  onDeleteStudent,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCircle, setSelectedCircle] = useState<string>('all');

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nationalId.includes(search) ||
        s.circleName.toLowerCase().includes(search.toLowerCase()) ||
        (s.teacherName && s.teacherName.toLowerCase().includes(search.toLowerCase()));
      const matchBranch = selectedBranch === 'all' || s.branch === selectedBranch;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchCircle =
        selectedCircle === 'all' ||
        s.circleId === selectedCircle ||
        String(s.circleNumber) === selectedCircle;
      return matchSearch && matchBranch && matchGender && matchStatus && matchCircle;
    });
  }, [students, search, selectedBranch, selectedGender, selectedStatus, selectedCircle]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialization.toLowerCase().includes(search.toLowerCase()) ||
        (t.branch && t.branch.toLowerCase().includes(search.toLowerCase()));
      const matchBranch = selectedBranch === 'all' || t.branch === selectedBranch;
      return matchSearch && matchBranch;
    });
  }, [teachers, search, selectedBranch]);

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['رقم القيد', 'اسم الطالب', 'العمر', 'الصف الدراسي', 'الفرع', 'رقم الحلقة', 'اسم الحلقة', 'المعلم', 'النوع', 'الحالة', 'الأجزاء المحفوظة'];
    const rows = filteredStudents.map((s) => [
      s.nationalId,
      s.name,
      s.age,
      s.grade,
      s.branch,
      s.circleNumber,
      s.circleName,
      s.teacherName,
      s.gender,
      s.status,
      s.memorizedParts || 1,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `كشف_طلاب_زاد_الرحيل_${selectedBranch === 'all' ? 'الكل' : selectedBranch}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#9b2f00]/10 text-[#9b2f00] text-xs font-bold px-2.5 py-0.5 rounded-full">
              بيانات قاعدة البيانات المعتمدة (db.json)
            </span>
            <span className="text-xs text-[#59413a]">
              إجمالي الطلاب: <strong className="text-[#191c1e]">{students.length}</strong> | المعلمون: <strong className="text-[#191c1e]">{teachers.length}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">دليل الطلاب ومنسوبي المركز</h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            بيانات طلاب فروع المركز الأربعة (مصيلح، مفرق الحجة، النجارية، الرادار) المسجلة في db.json
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#f2f4f6] p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-[#9b2f00] shadow-xs'
                  : 'text-[#59413a]'
              }`}
            >
              الطلاب ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'teachers'
                  ? 'bg-white text-[#9b2f00] shadow-xs'
                  : 'text-[#59413a]'
              }`}
            >
              المعلمون والمشرفون ({teachers.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تصدير الكشف إلى ملف Excel/CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={onOpenNewRegistration}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>إضافة طالب جديد</span>
          </button>
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
          كل الفروع ({students.length})
        </button>
        {BRANCHES.map((branch) => {
          const count = students.filter((s) => s.branch === branch).length;
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
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Secondary Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="البحث باسم الطالب، الهوية، المعلم، الحلقة..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#f2f4f6] border border-transparent text-xs text-[#191c1e] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[18px]">
                  search
                </span>
              </div>

              {/* Gender Filter */}
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none cursor-pointer"
              >
                <option value="all">كل الفئات (بنات / صبيان / نساء)</option>
                <option value="بنات">فئة البنات</option>
                <option value="صبيان">فئة الصبيان</option>
                <option value="نساء">حلقة النساء والأمهات</option>
              </select>

              {/* Filter Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none cursor-pointer"
              >
                <option value="all">كل حالات الانتظام</option>
                <option value="منتظم">منتظم</option>
                <option value="تأخير متكرر">تأخير متكرر</option>
                <option value="منقطع">منقطع</option>
              </select>

              {/* Filter Circle */}
              <select
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none cursor-pointer max-w-[220px]"
              >
                <option value="all">كل الحلقات (32 حلقة)</option>
                {circles
                  .filter((c) => selectedBranch === 'all' || c.branch === selectedBranch)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.number} {c.name} ({c.teacherName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-xs text-[#747779]">
              الطلاب المعروضون: <span className="font-bold text-[#191c1e]">{filteredStudents.length}</span> من أصل <span className="font-bold">{students.length}</span>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                    <th className="py-3.5 px-6">الطالب</th>
                    <th className="py-3.5 px-3">العمر / الصف</th>
                    <th className="py-3.5 px-3">الفرع</th>
                    <th className="py-3.5 px-4">رقم واسم الحلقة</th>
                    <th className="py-3.5 px-4">المعلم / المحفظ</th>
                    <th className="py-3.5 px-3">المستوى</th>
                    <th className="py-3.5 px-3">الحالة</th>
                    <th className="py-3.5 px-6 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#747779]">
                        لا توجد نتائج مطابقة لبحثك في هذا الفرع
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-[#f2f4f6]/60 transition-colors group cursor-pointer"
                        onClick={() => onSelectStudent(student)}
                      >
                        {/* Student Name */}
                        <td className="py-3.5 px-6 font-bold text-[#191c1e] flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-[#fea619]"
                            />
                          ) : (
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              student.gender === 'نساء'
                                ? 'bg-purple-100 text-purple-800'
                                : student.gender === 'بنات'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.avatarLetter || student.name.charAt(0)}
                            </span>
                          )}
                          <div>
                            <p className="font-bold text-[#191c1e] group-hover:text-[#9b2f00] transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-[#747779] font-mono">
                              هوية: {student.nationalId}
                            </p>
                          </div>
                        </td>

                        {/* Age & Grade */}
                        <td className="py-3.5 px-3 text-[#59413a]">
                          <span className="font-bold text-[#191c1e]">{student.age} سنة</span>
                          <span className="block text-[10px] text-[#747779]">{student.grade || 'صف دراسي'}</span>
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-3 text-[#59413a]">
                          <span className="text-[11px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                            {student.branch || 'مصيلح'}
                          </span>
                        </td>

                        {/* Circle */}
                        <td className="py-3.5 px-4 font-medium text-[#855300]">
                          <span className="inline-block bg-amber-50 text-[#855300] px-1.5 py-0.5 rounded text-[10px] font-bold ml-1">
                            #{student.circleNumber || 1}
                          </span>
                          <span>{student.circleName}</span>
                        </td>

                        {/* Teacher */}
                        <td className="py-3.5 px-4 text-[#191c1e] font-medium">
                          {student.teacherName || 'مشرف الحلقة'}
                        </td>

                        {/* Level */}
                        <td className="py-3.5 px-3 text-[#59413a]">
                          <span className="text-[11px]">{student.level}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={student.status}
                            onChange={(e) => onUpdateStatus(student.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-none outline-none cursor-pointer ${
                              student.status === 'منتظم'
                                ? 'bg-emerald-50 text-emerald-800'
                                : student.status === 'تأخير متكرر'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            <option value="منتظم">منتظم</option>
                            <option value="تأخير متكرر">تأخير متكرر</option>
                            <option value="منقطع">منقطع</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="p-1 text-[#59413a] hover:text-[#9b2f00] rounded hover:bg-white transition-colors"
                              title="عرض ملف الطالب"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`حذف قيد الطالب "${student.name}" من قاعدة البيانات db.json؟`)) {
                                  onDeleteStudent(student.id);
                                }
                              }}
                              className="p-1 text-[#747779] hover:text-[#ba1a1a] rounded hover:bg-red-50 transition-colors"
                              title="حذف القيد"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Teachers Directory (All 30 Teachers across 4 Branches) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#9b2f00] transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold text-base">
                  {teacher.name.split(' ')[0].charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#191c1e]">{teacher.name}</h3>
                  <p className="text-xs text-[#855300] font-medium mt-0.5">{teacher.specialization}</p>
                  <span className="inline-block mt-1 bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    فرع: {teacher.branch}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#59413a] bg-[#f7f9fb] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[#747779]">عدد الحلقات المسندة:</span>
                  <span className="font-bold text-[#191c1e]">{teacher.circlesCount} حلقة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#747779]">الجوال:</span>
                  <span className="font-mono text-[#191c1e]" dir="ltr">{teacher.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#747779]">البريد:</span>
                  <span className="text-[#191c1e]">{teacher.email}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => alert(`تم إرسال رسالة تواصل إلى المعلم/ة ${teacher.name}`)}
                  className="w-full py-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] rounded-xl text-xs font-bold text-[#59413a] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>تواصل ومتابعة السجلات</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
