import React, { useState } from 'react';
import { AcademicCircle, CenterBranch, Student } from '../../types';
import { BRANCHES } from '../../data/dbData';

interface StudentProfileModalProps {
  student: Student | null;
  circles: AcademicCircle[];
  onClose: () => void;
  onUpdateStatus: (studentId: string, status: Student['status']) => void;
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  circles,
  onClose,
  onUpdateStatus,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student?.name || '');
  const [age, setAge] = useState(student?.age || 10);
  const [grade, setGrade] = useState(student?.grade || '');
  const [branch, setBranch] = useState<CenterBranch>(student?.branch || 'مصيلح');
  const [circleId, setCircleId] = useState(student?.circleId || '');
  const [level, setLevel] = useState(student?.level || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [guardianName, setGuardianName] = useState(student?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone || '');
  const [notes, setNotes] = useState(student?.notes || '');
  const [memorizedParts, setMemorizedParts] = useState(student?.memorizedParts || 1);

  if (!student) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const selCircle = circles.find((c) => c.id === circleId);
    onUpdateStudent(student.id, {
      name,
      age: Number(age) || 10,
      grade,
      branch,
      circleId,
      circleNumber: selCircle?.number || student.circleNumber,
      circleName: selCircle?.name || student.circleName,
      teacherName: selCircle?.teacherName || student.teacherName,
      level,
      phone,
      guardianName,
      guardianPhone,
      notes,
      memorizedParts: Number(memorizedParts) || 1,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-[#f7f9fb] px-6 py-5 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#fea619]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#fea619]/30 text-[#9b2f00] flex items-center justify-center font-bold text-lg border-2 border-[#fea619]">
                {student.avatarLetter || student.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">{student.name}</h2>
              <p className="text-xs text-[#747779]">
                رقم القيد: {student.nationalId} | فرع {student.branch}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                isEditing ? 'bg-[#9b2f00] text-white' : 'bg-white border border-[#e1bfb5] text-[#59413a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isEditing ? 'visibility' : 'edit'}
              </span>
              <span>{isEditing ? 'معاينة' : 'تعديل'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#747779] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#e0e3e5] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#59413a] mb-1">اسم الطالب</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">العمر</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">الصف الدراسي</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">الفرع</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as CenterBranch)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-bold"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">الحلقة</label>
                  <select
                    value={circleId}
                    onChange={(e) => setCircleId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  >
                    {circles.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.number} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">المستوى</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">الأجزاء المحفوظة</label>
                  <input
                    type="number"
                    value={memorizedParts}
                    onChange={(e) => setMemorizedParts(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">ولي الأمر</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">هاتف ولي الأمر</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#59413a] hover:bg-[#f2f4f6]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#9b2f00] text-white hover:bg-[#c2410c]"
                >
                  حفظ التعديلات في db.json
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Status Bar */}
              <div className="bg-[#f2f4f6] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#747779] font-medium">حالة الانتظام الحالية</p>
                  <p className="text-sm font-bold text-[#191c1e]">{student.status}</p>
                </div>
                <div className="flex gap-1">
                  {(['منتظم', 'تأخير متكرر', 'منقطع'] as Student['status'][]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(student.id, st)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        student.status === st
                          ? 'bg-[#9b2f00] text-white shadow-xs'
                          : 'bg-white text-[#59413a] border border-[#c4c7c9] hover:bg-[#e0e3e5]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e1bfb5]/30">
                  <span className="text-xs text-[#747779] block mb-0.5">العمر والصف الدراسي</span>
                  <span className="font-bold text-[#191c1e]">{student.age} سنة ({student.grade || '—'})</span>
                </div>
                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e1bfb5]/30">
                  <span className="text-xs text-[#747779] block mb-0.5">الفرع</span>
                  <span className="font-bold text-[#9b2f00]">{student.branch}</span>
                </div>
                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e1bfb5]/30">
                  <span className="text-xs text-[#747779] block mb-0.5">الحلقة والمعلم</span>
                  <span className="font-bold text-[#191c1e]">
                    #{student.circleNumber} {student.circleName}
                  </span>
                  <span className="block text-[11px] text-[#855300]">{student.teacherName}</span>
                </div>
                <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#e1bfb5]/30">
                  <span className="text-xs text-[#747779] block mb-0.5">الأجزاء المحفوظة</span>
                  <span className="font-bold text-[#9b2f00]">{student.memorizedParts || 1} جزء من القرآن</span>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="bg-[#f7f9fb] p-4 rounded-xl border border-[#e1bfb5]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#59413a]">
                  <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                  <span>بيانات ولي الأمر والتواصل</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#747779]">ولي الأمر:</span>
                  <span className="font-bold text-[#191c1e]">{student.guardianName || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#747779]">رقم الطوارئ:</span>
                  <span className="font-bold text-[#191c1e]" dir="ltr">{student.guardianPhone || student.phone || 'غير مسجل'}</span>
                </div>
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="bg-[#fff8e1] p-3 rounded-xl border border-[#ffe082] text-xs text-[#684000]">
                  <span className="font-bold block mb-1">ملاحظات المشرف والمعلم:</span>
                  {student.notes}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f7f9fb] px-6 py-3 border-t border-[#e1bfb5] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف قيد الطالب "${student.name}" من db.json؟`)) {
                onDeleteStudent(student.id);
                onClose();
              }
            }}
            className="text-xs font-semibold text-[#ba1a1a] hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>حذف القيد من db.json</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#9b2f00] hover:bg-[#c2410c] text-white transition-all shadow-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
