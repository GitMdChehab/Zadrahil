import React, { useState, useEffect } from 'react';
import {
  BranchRef,
  GradeRef,
  CurriculumTrackRef,
  DonationCategoryRef,
  ExpenseItemRef,
  Teacher,
  AcademicCircle,
  DatabaseSchema,
} from '../../types';

export type ReferenceItemType =
  | 'branch'
  | 'teacher'
  | 'circle'
  | 'grade'
  | 'curriculum'
  | 'donation'
  | 'expense';

interface EditReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ReferenceItemType;
  item: any | null; // null for add mode, object for edit mode
  db: DatabaseSchema;
  onSave: (type: ReferenceItemType, savedItem: any, isNew: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const EditReferenceModal: React.FC<EditReferenceModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  db,
  onSave,
  onShowToast,
}) => {
  const isNew = !item;
  const currentRate = db.exchangeRate?.usdToLbp || 89500;

  // Form State
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setFormData({ ...item });
    } else {
      // Default empty templates
      const genId = (prefix: string) => `${prefix}-${Date.now().toString().slice(-4)}`;
      switch (type) {
        case 'branch':
          setFormData({
            id: genId('br'),
            name: '',
            location: '',
            supervisor: '',
            phone: '+961 ',
            capacity: 50,
            circlesCount: 0,
            studentsCount: 0,
            notes: '',
          });
          break;
        case 'teacher':
          setFormData({
            id: genId('t'),
            name: '',
            branch: db.branches?.[0] || 'فرع برجا الرئيسي',
            specialization: 'حفظ وتجويد القرآن الكريم',
            phone: '+961 ',
            circlesCount: 1,
            salaryUSD: 140,
            notes: '',
          });
          break;
        case 'circle':
          setFormData({
            id: genId('circ'),
            number: (db.circles?.length || 0) + 1,
            name: '',
            teacherName: db.teachers?.[0]?.name || '',
            branch: db.branches?.[0] || 'فرع برجا الرئيسي',
            time: 'عصراً (4:00 - 6:00)',
            room: 'القاعة 1',
            studentsCount: 0,
          });
          break;
        case 'grade':
          setFormData({
            id: genId('gr'),
            name: '',
            stage: 'الابتدائية',
            targetAge: '7-8 سنوات',
            studentsCount: 0,
          });
          break;
        case 'curriculum':
          setFormData({
            id: genId('cur'),
            title: '',
            category: 'تحفيظ',
            description: '',
            levelsCount: 4,
            partsRequired: '3 أجزاء',
            certificate: 'إجازة في التلاوة والتجويد',
          });
          break;
        case 'donation':
          setFormData({
            id: genId('don-cat'),
            name: '',
            description: '',
            targetUSD: 50,
            targetLBP: 50 * currentRate,
            isRecurring: true,
          });
          break;
        case 'expense':
          setFormData({
            id: genId('exp-item'),
            name: '',
            category: 'تشغيل وصيانة',
            estMonthlyUSD: 100,
            estMonthlyLBP: 100 * currentRate,
            notes: '',
          });
          break;
      }
    }
  }, [isOpen, type, item]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      // Auto calculate LBP if targetUSD changed for donation/expense
      if (type === 'donation' && field === 'targetUSD') {
        updated.targetLBP = (Number(value) || 0) * currentRate;
      }
      if (type === 'expense' && field === 'estMonthlyUSD') {
        updated.estMonthlyLBP = (Number(value) || 0) * currentRate;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (type === 'branch' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة اسم الفرع');
      return;
    }
    if (type === 'teacher' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة اسم المعلم');
      return;
    }
    if (type === 'circle' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة اسم الحلقة');
      return;
    }
    if (type === 'grade' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة اسم المرحلة / الصف');
      return;
    }
    if (type === 'curriculum' && !formData.title?.trim()) {
      onShowToast('يرجى كتابة عنوان المسار التعليمي');
      return;
    }
    if (type === 'donation' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة مسمى فئة التبرع');
      return;
    }
    if (type === 'expense' && !formData.name?.trim()) {
      onShowToast('يرجى كتابة اسم بند المصروف');
      return;
    }

    onSave(type, formData, isNew);
    onClose();
  };

  const getTitle = () => {
    const action = isNew ? 'إضافة' : 'تعديل بيانات';
    switch (type) {
      case 'branch':
        return `${action} فرع مرجعي`;
      case 'teacher':
        return `${action} معلم / معلمة`;
      case 'circle':
        return `${action} حلقة قرآنية`;
      case 'grade':
        return `${action} مرحلة أو صف دراسي`;
      case 'curriculum':
        return `${action} مسار أو منهاج تعليمي`;
      case 'donation':
        return `${action} فئة تبرع أو كفالة`;
      case 'expense':
        return `${action} بند مصروف تشغيلي`;
      default:
        return `${action} عنصر مرجعي`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e1bfb5] bg-[#f7f9fb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">
                {isNew ? 'add_circle' : 'edit'}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-base text-[#191c1e]">{getTitle()}</h2>
              <p className="text-xs text-[#747779]">
                {isNew ? 'إدخال سجل جديد في قاعدة البيانات المرجعية' : 'تحديث الحقول والبيانات المرجعية'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#e0e3e5] text-[#59413a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* BRANCH FORM */}
          {type === 'branch' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">اسم الفرع *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: فرع برجا الرئيسي"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الموقع والعنوان</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="مثال: برجا - الشارع العام"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المشرف المسؤول</label>
                  <input
                    type="text"
                    value={formData.supervisor || ''}
                    onChange={(e) => handleChange('supervisor', e.target.value)}
                    placeholder="مثال: الشيخ عمر الحجار"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">هاتف التواصل</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+961 70 123456"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الطاقة الاستيعابية (طالب)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity || 50}
                    onChange={(e) => handleChange('capacity', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">عدد الحلقات</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.circlesCount || 0}
                    onChange={(e) => handleChange('circlesCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الطلاب المسجلون</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.studentsCount || 0}
                    onChange={(e) => handleChange('studentsCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">ملاحظات ومواصفات المقر</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="مثال: يضم 4 قاعات تحفيظ ومصلى وصالة أنشطة..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
              </div>
            </div>
          )}

          {/* TEACHER FORM */}
          {type === 'teacher' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">اسم المعلم / المعلمة *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: الشيخ بلال محمود"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الفرع المسند *</label>
                  <select
                    value={formData.branch || db.branches?.[0]}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    {(db.branches || ['فرع برجا الرئيسي', 'فرع شحيم', 'فرع الجية', 'فرع كترمايا']).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">التخصص والمسار</label>
                  <input
                    type="text"
                    value={formData.specialization || ''}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    placeholder="مثال: إجازة حفص وقراءات عشر"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+961 70 000000"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">عدد الحلقات المسندة</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.circlesCount || 1}
                    onChange={(e) => handleChange('circlesCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المكافأة الشهرية بالدولار ($)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.salaryUSD || 140}
                      onChange={(e) => handleChange('salaryUSD', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-emerald-800"
                    />
                    <span className="absolute left-3 top-2 font-bold text-emerald-800">$</span>
                  </div>
                  <span className="text-[11px] text-[#747779] mt-1 block">
                    تعادل تقريباً: {(((formData.salaryUSD || 140) * currentRate)).toLocaleString()} ل.ل.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CIRCLE FORM */}
          {type === 'circle' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">رقم الحلقة *</label>
                  <input
                    type="number"
                    required
                    value={formData.number || 1}
                    onChange={(e) => handleChange('number', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-[#9b2f00]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-[#191c1e] mb-1">اسم ومسمى الحلقة *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: حلقة الإمام نافع (حفظ مكثف)"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المعلم المشرف *</label>
                  <select
                    value={formData.teacherName || ''}
                    onChange={(e) => handleChange('teacherName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    {(db.teachers || []).map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.branch})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الفرع *</label>
                  <select
                    value={formData.branch || db.branches?.[0]}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    {(db.branches || ['فرع برجا الرئيسي', 'فرع شحيم', 'فرع الجية', 'فرع كترمايا']).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الوقت / التوقيت</label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => handleChange('time', e.target.value)}
                    placeholder="مثال: عصراً (4:00 - 6:00)"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">القاعة / الغرفة</label>
                  <input
                    type="text"
                    value={formData.room || ''}
                    onChange={(e) => handleChange('room', e.target.value)}
                    placeholder="مثال: القاعة 1 (المكتبة)"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الطلاب المسجلون</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.studentsCount || 0}
                    onChange={(e) => handleChange('studentsCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GRADE FORM */}
          {type === 'grade' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">اسم الصف / المستوى *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: الصف الرابع الابتدائي"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المرحلة الدراسية</label>
                  <select
                    value={formData.stage || 'الابتدائية'}
                    onChange={(e) => handleChange('stage', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    <option value="الروضة والبراعم">الروضة والبراعم</option>
                    <option value="الابتدائية">الابتدائية</option>
                    <option value="المتوسطة">المتوسطة</option>
                    <option value="الثانوية والجامعية">الثانوية والجامعية</option>
                    <option value="حلقة عامة وكبار">حلقة عامة وكبار</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الفئة العمرية المستهدفة</label>
                  <input
                    type="text"
                    value={formData.targetAge || ''}
                    onChange={(e) => handleChange('targetAge', e.target.value)}
                    placeholder="مثال: 9-10 سنوات"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">عدد الطلاب المسجلين</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.studentsCount || 0}
                    onChange={(e) => handleChange('studentsCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CURRICULUM FORM */}
          {type === 'curriculum' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">عنوان المسار / المنهاج *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="مثال: مسار تحفيظ القرآن الكريم كاملاً"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">التصنيف</label>
                  <select
                    value={formData.category || 'تحفيظ'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    <option value="تحفيظ">تحفيظ</option>
                    <option value="تجويد وقراءات">تجويد وقراءات</option>
                    <option value="تأسيس وتلاوة">تأسيس وتلاوة</option>
                    <option value="علوم شرعية">علوم شرعية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">وصف المسار والأهداف</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="شرح مختصر عن المسار ومراحل الإنجاز..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">عدد المستويات</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.levelsCount || 1}
                    onChange={(e) => handleChange('levelsCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المقدار المطلوب</label>
                  <input
                    type="text"
                    value={formData.partsRequired || ''}
                    onChange={(e) => handleChange('partsRequired', e.target.value)}
                    placeholder="مثال: 30 جزءاً"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">الشهادة الممنوحة</label>
                  <input
                    type="text"
                    value={formData.certificate || ''}
                    onChange={(e) => handleChange('certificate', e.target.value)}
                    placeholder="مثال: شهادة خاتم القرآن الكريم"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DONATION CATEGORY FORM */}
          {type === 'donation' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">مسمى الكفالة أو التبرع *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="مثال: كفالة طالب علم قرآني"
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">تفاصيل ومصارف التبرع</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="مثال: تغطية الكتب والمواصلات والمكافآت التشجيعية..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المبلغ المستهدف بالدولار ($) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.targetUSD || 0}
                    onChange={(e) => handleChange('targetUSD', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المبلغ المقابل بالليرة اللبنانية (LBP)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetLBP || 0}
                    onChange={(e) => handleChange('targetLBP', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-[#59413a]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring ?? true}
                  onChange={(e) => handleChange('isRecurring', e.target.checked)}
                  className="w-4 h-4 text-[#9b2f00] rounded-sm accent-[#9b2f00]"
                />
                <label htmlFor="isRecurring" className="font-bold text-[#191c1e] cursor-pointer">
                  كفالة دورية متكررة (شهرية / سنوية)
                </label>
              </div>
            </div>
          )}

          {/* EXPENSE ITEM FORM */}
          {type === 'expense' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">اسم بند المصروف *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: رواتب ومكافآت المعلمين"
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">التصنيف</label>
                  <select
                    value={formData.category || 'كادر تعليمي'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-semibold"
                  >
                    <option value="كادر تعليمي">كادر تعليمي</option>
                    <option value="إيجارات ومقرات">إيجارات ومقرات</option>
                    <option value="تشغيل وصيانة">تشغيل وصيانة</option>
                    <option value="أنشطة وجوائز">أنشطة وجوائز</option>
                    <option value="نثريات ومطبوعات">نثريات ومطبوعات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المقدر شهرياً بالدولار ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.estMonthlyUSD || 0}
                    onChange={(e) => handleChange('estMonthlyUSD', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-[#ba1a1a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">المقدر شهرياً بالليرة اللبنانية (LBP)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estMonthlyLBP || 0}
                    onChange={(e) => handleChange('estMonthlyLBP', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none font-mono font-bold text-[#59413a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">ملاحظات التشغيل والإنفاق</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="ملاحظات تفصيلية..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#e1bfb5] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e1bfb5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-xl font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{isNew ? 'إضافة وحفظ' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
