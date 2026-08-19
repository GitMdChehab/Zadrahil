import React, { useState } from 'react';
import { AdminUser, UserAccount } from '../../types';

interface ProfileViewProps {
  adminUser: AdminUser;
  currentUser?: UserAccount | null;
  onUpdateAdminUser: (updated: AdminUser) => void;
  onUpdateCurrentUser?: (updated: UserAccount) => void;
  onShowToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  adminUser,
  currentUser,
  onUpdateAdminUser,
  onUpdateCurrentUser,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || adminUser.name);
  const [editUsername, setEditUsername] = useState(currentUser?.username || 'admin');
  const [editPassword, setEditPassword] = useState(currentUser?.password || '••••••');
  const [editEmail, setEditEmail] = useState(currentUser?.email || adminUser.email);
  const [editPhone, setEditPhone] = useState(currentUser?.phone || adminUser.phone);
  const [showPassword, setShowPassword] = useState(false);

  const displayUser = currentUser || {
    id: 'admin',
    name: adminUser.name,
    username: 'admin',
    password: '••••••••',
    role: adminUser.role,
    branch: 'جميع الفروع',
    phone: adminUser.phone,
    email: adminUser.email,
    active: true,
    lastLogin: adminUser.lastLogin,
    avatarUrl: adminUser.avatarUrl,
  };

  const auditActivities = [
    {
      id: 'a-1',
      action: 'اعتماد سند قبض تبرع رقم REC-2023-0941',
      time: 'اليوم، 10:45 ص',
      category: 'مالية',
    },
    {
      id: 'a-2',
      action: 'إضافة وتثبيت حلقة الإمام نافع في القاعة 1',
      time: 'اليوم، 09:15 ص',
      category: 'أكاديمي',
    },
    {
      id: 'a-3',
      action: 'تعديل وتحديث بيانات حساب مستخدم',
      time: 'أمس، 04:30 م',
      category: 'أمان وحسابات',
    },
    {
      id: 'a-4',
      action: 'نشر تعميم جدول الاختبارات النصفية',
      time: 'أمس، 10:15 ص',
      category: 'تعاميم',
    },
    {
      id: 'a-5',
      action: 'تسجيل دخول ناجح للنظام الإداري',
      time: 'اليوم، 08:30 ص',
      category: 'أمان',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        name: editName,
        username: editUsername.trim().toLowerCase(),
        password: editPassword.trim(),
        email: editEmail,
        phone: editPhone,
      });
    }

    onUpdateAdminUser({
      ...adminUser,
      name: editName,
      email: editEmail,
      phone: editPhone,
    });

    setIsEditing(false);
    onShowToast('تم تحديث بيانات الحساب وكلمة المرور بنجاح');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            الملف الشخصي وحساب تسجيل الدخول
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            بيانات الحساب الشخصي، اسم المستخدم (Username)، كلمة المرور (Password)، وسجل النشاطات
          </p>
        </div>

        <button
          onClick={() => {
            setEditName(displayUser.name);
            setEditUsername(displayUser.username);
            setEditPassword(displayUser.password);
            setEditEmail(displayUser.email || '');
            setEditPhone(displayUser.phone || '');
            setIsEditing(true);
          }}
          className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          <span>تعديل الحساب وكلمة المرور</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card (Left 1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={displayUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={displayUser.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#fea619] shadow-sm"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>

          <h2 className="text-lg font-bold text-[#191c1e]">{displayUser.name}</h2>
          <p className="text-xs font-semibold text-[#9b2f00] mt-0.5">{displayUser.role}</p>
          <span className="mt-2 text-[11px] bg-orange-50 text-[#855300] border border-[#e1bfb5] px-3 py-1 rounded-full font-medium">
            الفرع: {displayUser.branch || 'جميع الفروع'}
          </span>

          <div className="w-full mt-6 pt-6 border-t border-[#e1bfb5]/40 text-xs space-y-3 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[#747779]">اسم المستخدم (Username):</span>
              <span className="font-mono font-bold text-[#9b2f00]">@{displayUser.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#747779]">البريد الإلكتروني:</span>
              <span className="font-semibold text-[#191c1e]">{displayUser.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#747779]">رقم الجوال:</span>
              <span className="font-mono text-[#191c1e]" dir="ltr">{displayUser.phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#747779]">آخر تسجيل دخول:</span>
              <span className="text-[#191c1e]">{displayUser.lastLogin || 'اليوم'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#747779]">حالة الحساب:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                نشط ومفعل ✓
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Audit Feed (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Stats Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#e1bfb5] shadow-xs text-center">
              <span className="text-xs text-[#747779] block mb-1 font-medium">الصلاحية</span>
              <span className="text-base font-bold text-[#855300]">{displayUser.role}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e1bfb5] shadow-xs text-center">
              <span className="text-xs text-[#747779] block mb-1 font-medium">العمليات المنجزة</span>
              <span className="text-xl font-black text-[#9b2f00]">1,204</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e1bfb5] shadow-xs text-center">
              <span className="text-xs text-[#747779] block mb-1 font-medium">التعاميم</span>
              <span className="text-xl font-black text-[#191c1e]">32</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e1bfb5] shadow-xs text-center">
              <span className="text-xs text-[#747779] block mb-1 font-medium">تسجيلات الدخول</span>
              <span className="text-xl font-black text-emerald-700">245</span>
            </div>
          </div>

          {/* Security Credentials Card */}
          <div className="bg-linear-to-r from-amber-50/60 to-orange-50/50 p-5 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">key</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191c1e]">بيانات تسجيل الدخول الشخصية</h3>
                <p className="text-xs text-[#59413a]">
                  اسم المستخدم الحالي: <strong className="font-mono text-[#9b2f00]">@{displayUser.username}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditName(displayUser.name);
                setEditUsername(displayUser.username);
                setEditPassword(displayUser.password);
                setEditEmail(displayUser.email || '');
                setEditPhone(displayUser.phone || '');
                setIsEditing(true);
              }}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-[#9b2f00] border border-[#e1bfb5] rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              تغيير كلمة المرور
            </button>
          </div>

          {/* Audit Feed */}
          <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs">
            <h3 className="text-base font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9b2f00]">history</span>
              سجل العمليات والتدقيق الأخير (Audit Log)
            </h3>

            <div className="space-y-3">
              {auditActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-[#f7f9fb] border border-[#e1bfb5]/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#fea619]"></span>
                    <div>
                      <p className="font-bold text-[#191c1e]">{act.action}</p>
                      <p className="text-[10px] text-[#747779]">{act.time}</p>
                    </div>
                  </div>
                  <span className="bg-white border border-[#e1bfb5] text-[#59413a] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                    {act.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#e1bfb5] overflow-hidden p-6" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1bfb5] mb-4">
              <h3 className="text-base font-bold text-[#191c1e]">تعديل الحساب وكلمة المرور</h3>
              <button onClick={() => setIsEditing(false)} className="text-[#747779]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#59413a] mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">اسم المستخدم (Username)</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">كلمة المرور الجديدة (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 pl-8 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-2.5 text-[#747779]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e1bfb5]/40">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 font-semibold text-[#59413a]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
