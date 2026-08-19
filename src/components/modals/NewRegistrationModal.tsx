import React, { useState } from 'react';
import { AcademicCircle, CenterBranch, Student } from '../../types';
import { BRANCHES } from '../../data/dbData';

interface NewRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  circles: AcademicCircle[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onShowToast: (message: string) => void;
}

export const NewRegistrationModal: React.FC<NewRegistrationModalProps> = ({
  isOpen,
  onClose,
  circles,
  onAddStudent,
  onShowToast,
}) => {
  const [regType, setRegType] = useState<'student' | 'teacher' | 'donor' | 'staff'>('student');
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    age: '10',
    grade: 'صف رابع',
    branch: 'مصيلح' as CenterBranch,
    gender: 'بنات' as 'بنات' | 'صبيان' | 'نساء',
    phone: '',
    level: 'المستوى الأول',
    circleId: circles[0]?.id || '',
    guardianName: '',
    guardianPhone: '',
    memorizedParts: 1,
    notes: '',
  });

  if (!isOpen) return null;

  const filteredCircles = circles.filter(
    (c) => c.branch === formData.branch
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('يرجى إدخال الاسم كاملاً');
      return;
    }

    const selectedCircle =
      circles.find((c) => c.id === formData.circleId) ||
      filteredCircles[0] ||
      circles[0];

    if (regType === 'student') {
      onAddStudent({
        name: formData.name,
        nationalId: formData.nationalId || `109${Math.floor(1000000 + Math.random() * 9000000)}`,
        age: Number(formData.age) || 10,
        grade: formData.grade,
        branch: formData.branch,
        gender: formData.gender,
        joinYear: '1445 هـ',
        level: formData.level,
        circleId: selectedCircle?.id || 'circle-1',
        circleNumber: selectedCircle?.number || 1,
        circleName: selectedCircle?.name || 'حلقة تحفيظ',
        teacherName: selectedCircle?.teacherName || 'مشرف الحلقة',
        status: 'منتظم',
        avatarLetter: formData.name.charAt(0),
        phone: formData.phone,
        guardianName: formData.guardianName || 'ولي الأمر',
        guardianPhone: formData.guardianPhone || formData.phone,
        memorizedParts: Number(formData.memorizedParts) || 1,
        notes: formData.notes,
      });
      onShowToast(`تم تسجيل الطالب/ة "${formData.name}" بنجاح في قاعدة البيانات db.json`);
    } else {
      onShowToast(`تم تسجيل طلب "${formData.name}" كـ (${regType}) بنجاح`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-[#f7f9fb] px-6 py-4 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">تسجيل قيد جديد في db.json</h2>
              <p className="text-xs text-[#747779]">إضافة طالب أو منتسب جديد إلى فروع مركز زاد الرحيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747779] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#e0e3e5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Registration Type Selector */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-4 gap-2 bg-[#f2f4f6] p-1 rounded-xl">
            {[
              { id: 'student', label: 'طالب قرآن', icon: 'school' },
              { id: 'teacher', label: 'معلم / محفظ', icon: 'person_outline' },
              { id: 'donor', label: 'داعم / متبرع', icon: 'volunteer_activism' },
              { id: 'staff', label: 'إداري / مشرف', icon: 'badge' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRegType(t.id as any)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  regType === t.id
                    ? 'bg-white text-[#9b2f00] shadow-xs font-bold border border-[#e1bfb5]/40'
                    : 'text-[#59413a] hover:text-[#191c1e]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: يوسف خالد محمد المحمد"
              className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
            />
          </div>

          {regType === 'student' && (
            <>
              {/* Branch & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">الفرع التابع له *</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => {
                      const b = e.target.value as CenterBranch;
                      const matched = circles.find((c) => c.branch === b);
                      setFormData({
                        ...formData,
                        branch: b,
                        circleId: matched?.id || formData.circleId,
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">الفئة / النوع</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  >
                    <option value="بنات">فئة البنات</option>
                    <option value="صبيان">فئة الصبيان</option>
                    <option value="نساء">حلقة النساء والأمهات</option>
                  </select>
                </div>
              </div>

              {/* Age & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">العمر (سنوات)</label>
                  <input
                    type="number"
                    min="3"
                    max="80"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">الصف / المرحلة الدراسية</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="مثال: صف رابع، سابع، روضة..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Circle & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">الحلقة المراد التسكين بها</label>
                  <select
                    value={formData.circleId}
                    onChange={(e) => setFormData({ ...formData, circleId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  >
                    {filteredCircles.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.number} {c.name} ({c.teacherName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">المستوى التعليمي</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  >
                    <option value="المستوى التمهيدي">المستوى التمهيدي (القاعدة النورانية)</option>
                    <option value="المستوى الأول">المستوى الأول</option>
                    <option value="المستوى الثاني">المستوى الثاني</option>
                    <option value="المستوى الثالث">المستوى الثالث</option>
                    <option value="المستوى المتقدم بالسند">المستوى المتقدم بالسند المتصل</option>
                  </select>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="اسم ولي الأمر"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">هاتف ولي الأمر / التواصل</label>
                  <input
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي تفاصيل خاصة بالحفظ أو الأوقات..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e1bfb5]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#59413a] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#9b2f00] hover:bg-[#c2410c] text-white shadow-xs transition-all cursor-pointer"
            >
              حفظ وتسجيل في db.json
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
