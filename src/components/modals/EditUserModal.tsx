import React, { useState, useEffect } from 'react';
import { CenterBranch, UserAccount, UserRole } from '../../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserAccount) => void;
  initialUser?: UserAccount | null;
  branches: CenterBranch[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUser,
  branches,
}) => {
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    name: '',
    username: '',
    password: '',
    role: 'معلم حلقة',
    branch: 'جميع الفروع',
    phone: '',
    email: '',
    active: true,
    avatarUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        ...initialUser,
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'معلم حلقة',
        branch: 'جميع الفروع',
        phone: '',
        email: '',
        active: true,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?w=150`,
      });
    }
    setErrors({});
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'الاسم الكامل مطلوب';
    }
    if (!formData.username?.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام ونقاط فقط';
    }
    if (!formData.password?.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 4) {
      newErrors.password = 'كلمة المرور يجب ألا تقل عن 4 خانات';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalUser: UserAccount = {
      id: initialUser?.id || `usr-${Date.now()}`,
      username: formData.username!.trim().toLowerCase(),
      password: formData.password!.trim(),
      name: formData.name!.trim(),
      role: (formData.role as UserRole) || 'معلم حلقة',
      branch: (formData.branch as CenterBranch | 'جميع الفروع') || 'جميع الفروع',
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || '',
      active: formData.active ?? true,
      lastLogin: initialUser?.lastLogin || 'لم يسجل دخول بعد',
      createdAt: initialUser?.createdAt || new Date().toISOString().split('T')[0],
      avatarUrl:
        formData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    onSave(finalUser);
    onClose();
  };

  const rolesList: { role: UserRole; desc: string; icon: string }[] = [
    { role: 'مدير عام', desc: 'صلاحيات كاملة لإدارة المركز والمستخدمين والإعدادات', icon: 'shield_person' },
    { role: 'مشرف تعليمي', desc: 'إشراف على الحلقات والطلاب والمعلمين وجدول الحصص', icon: 'school' },
    { role: 'أمين صندوق', desc: 'إدارة المالية والسندات والتبرعات والمصروفات', icon: 'payments' },
    { role: 'معلم حلقة', desc: 'متابعة طلاب حلقته ورصد الحفظ والحضور', icon: 'menu_book' },
    { role: 'مشرف فرع', desc: 'إدارة شؤون وأنشطة فرع محدد بالكامل', icon: 'domain' },
    { role: 'موظف استقبال', desc: 'تسجيل الطلاب الجدد ومتابعة الاستفسارات', icon: 'badge' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-50 to-orange-50 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">
                {initialUser ? 'manage_accounts' : 'person_add'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">
                {initialUser ? 'تعديل بيانات المستخدم وحساب الدخول' : 'إنشاء حساب مستخدم جديد'}
              </h2>
              <p className="text-xs text-[#59413a]">
                تحديد اسم المستخدم (Username) وكلمة المرور (Password) والصلاحيات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#59413a] hover:bg-white/80 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#59413a] mb-1">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: الشيخ بلال محمود"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
              {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-bold text-[#59413a] mb-1">
                اسم المستخدم (Username) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="مثال: bilal.teacher"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 pl-8 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#747779] text-[18px]">
                  alternate_email
                </span>
              </div>
              {errors.username && <p className="text-[11px] text-red-600 mt-1">{errors.username}</p>}
            </div>
          </div>

          {/* Password & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#59413a] mb-1">
                كلمة المرور (Password) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 pr-8 pl-8 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#747779] text-[18px]">
                  key
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2.5 text-[#747779] hover:text-[#191c1e]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block font-bold text-[#59413a] mb-1">حالة الحساب</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="active_status"
                    checked={formData.active === true}
                    onChange={() => setFormData({ ...formData, active: true })}
                    className="accent-[#9b2f00]"
                  />
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    نشط (مسموح بالدخول)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="active_status"
                    checked={formData.active === false}
                    onChange={() => setFormData({ ...formData, active: false })}
                    className="accent-red-600"
                  />
                  <span className="text-red-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    معطل
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-bold text-[#59413a] mb-1.5">
              الدور والصلاحيات الوظيفية <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rolesList.map((r) => {
                const isSelected = formData.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setFormData({ ...formData, role: r.role })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-[#9b2f00] bg-orange-50/60 ring-2 ring-[#fea619]/30'
                        : 'border-[#e1bfb5] bg-white hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] mt-0.5 ${
                        isSelected ? 'text-[#9b2f00]' : 'text-[#747779]'
                      }`}
                    >
                      {r.icon}
                    </span>
                    <div>
                      <p className="font-bold text-[#191c1e]">{r.role}</p>
                      <p className="text-[10px] text-[#747779] line-clamp-1">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#59413a] mb-1">الفرع المخصص</label>
              <select
                value={formData.branch || 'جميع الفروع'}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="جميع الفروع">جميع الفروع (مركزي)</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#59413a] mb-1">رقم الهاتف للتواصل</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+961 70 123456"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
              />
            </div>

            <div>
              <label className="block font-bold text-[#59413a] mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@zadarraheel.edu"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-[#e1bfb5] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#c4c7c9] hover:bg-[#f2f4f6] text-[#59413a] rounded-xl font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{initialUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
