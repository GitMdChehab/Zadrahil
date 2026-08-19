import React, { useState } from 'react';
import { DatabaseSchema, UserAccount } from '../../types';
import { api } from '../../services/api';
import { INITIAL_USERS } from '../../data/dbData';
import { EditUserModal } from '../modals/EditUserModal';

interface SettingsViewProps {
  onShowToast: (msg: string) => void;
  database: DatabaseSchema;
  onDatabaseReload: (newDb: DatabaseSchema) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onShowToast,
  database,
  onDatabaseReload,
}) => {
  const [centerName, setCenterName] = useState('مركز زاد الرحيل لتعليم وتدريب القرآن الكريم والعلوم الشرعية');
  const [phone, setPhone] = useState('+966 50 123 4567');
  const [email, setEmail] = useState('info@zadarraheel.edu');
  const [address, setAddress] = useState('المقر الرئيسي: مصيلح | الفروع: مفرق الحجة، النجارية، الرادار');
  
  // Feature toggles
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);

  const usersList: UserAccount[] = database.users && database.users.length > 0
    ? database.users
    : INITIAL_USERS;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('تم حفظ وتحديث إعدادات المركز العامة بنجاح');
  };

  const handleDownloadDbJson = () => {
    api.exportDatabase(database);
    onShowToast('تم تنزيل ملف db.json بنجاح على جهازك');
  };

  const handleResetToPdfData = async () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين قاعدة البيانات db.json إلى كشوفات الـ PDF الأصلية (294 طالب، 32 حلقة، 30 معلم)؟')) {
      setIsResetting(true);
      try {
        const freshDb = await api.resetDatabase();
        onDatabaseReload(freshDb);
        onShowToast('تمت إعادة تعيين قاعدة البيانات db.json بنجاح إلى الـ 294 طالباً');
      } catch (err) {
        onShowToast('حدث خطأ أثناء إعادة التعيين');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.students)) {
          await api.saveDatabase(parsed);
          onDatabaseReload(parsed);
          onShowToast(`تم استيراد قاعدة البيانات بنجاح (${parsed.students.length} طالب)`);
        } else {
          alert('الملف المرفوع لا يطابق بنية DatabaseSchema المطلوبة');
        }
      } catch (err) {
        alert('خطأ في قراءة ملف الـ JSON المرفوع');
      }
    };
    reader.readAsText(file);
  };

  // User Management Handlers
  const handleSaveUser = (savedUser: UserAccount) => {
    const existingIndex = usersList.findIndex((u) => u.id === savedUser.id);
    let updatedUsers: UserAccount[];

    if (existingIndex >= 0) {
      updatedUsers = usersList.map((u) => (u.id === savedUser.id ? savedUser : u));
      onShowToast(`تم تحديث حساب المستخدم (${savedUser.name}) بنجاح`);
    } else {
      updatedUsers = [savedUser, ...usersList];
      onShowToast(`تم إنشاء حساب جديد لـ (${savedUser.name}) بنجاح`);
    }

    const updatedDb: DatabaseSchema = {
      ...database,
      users: updatedUsers,
    };

    api.saveDatabase(updatedDb);
    onDatabaseReload(updatedDb);
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === 'admin') {
      alert('لا يمكن حذف حساب المدير العام الأساسي (admin).');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف حساب المستخدم (${user.name} - @${user.username}) نهائياً؟`)) {
      const updatedUsers = usersList.filter((u) => u.id !== user.id);
      const updatedDb: DatabaseSchema = {
        ...database,
        users: updatedUsers,
      };

      api.saveDatabase(updatedDb);
      onDatabaseReload(updatedDb);
      onShowToast(`تم حذف حساب (${user.name}) بنجاح`);
    }
  };

  const handleToggleUserStatus = (user: UserAccount) => {
    const updatedUsers = usersList.map((u) =>
      u.id === user.id ? { ...u, active: !u.active } : u
    );
    const updatedDb: DatabaseSchema = {
      ...database,
      users: updatedUsers,
    };

    api.saveDatabase(updatedDb);
    onDatabaseReload(updatedDb);
    onShowToast(`تم ${!user.active ? 'تفعيل' : 'تعطيل'} حساب (${user.name}) بنجاح`);
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const text = `بيانات الدخول إلى مركز زاد الرحيل:\nالاسم: ${user.name}\nاسم المستخدم: ${user.username}\nكلمة المرور: ${user.password}\nالدور: ${user.role}`;
    navigator.clipboard.writeText(text);
    onShowToast(`تم نسخ بيانات حساب (${user.name}) للحافظة`);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch)) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'مدير عام':
        return 'bg-[#9b2f00] text-white';
      case 'مشرف تعليمي':
        return 'bg-amber-100 text-[#855300] border border-amber-300';
      case 'أمين صندوق':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'معلم حلقة':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'مشرف فرع':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'موظف استقبال':
        return 'bg-teal-100 text-teal-800 border border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              قاعدة البيانات db.json متصلة ونشطة
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            إعدادات النظام وإدارة المستخدمين (Username & Password)
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            إدارة حسابات الدخول، تعيين أسماء المستخدمين وكلمات المرور، والتحكم في قاعدة بيانات المركز
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsEditUserModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>إضافة مستخدم جديد</span>
          </button>
          <button
            onClick={handleDownloadDbJson}
            className="px-3.5 py-2.5 bg-white hover:bg-[#f2f4f6] text-[#59413a] border border-[#e1bfb5] rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>تحميل db.json</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* USER ACCOUNTS & LOGIN CREDENTIALS MANAGEMENT (THE MAIN FOCUS) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e1bfb5]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">
                دليل حسابات تسجيل الدخول والصلاحيات ({usersList.length} مستخدم)
              </h2>
              <p className="text-xs text-[#59413a]">
                تخصيص اسم المستخدم (Username) وكلمة المرور (Password) والصلاحيات لكل فرد في الكادر
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="بحث بالاسم أو اسم المستخدم..."
                className="w-48 sm:w-56 px-3 py-1.5 pr-8 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[16px]">
                search
              </span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-medium text-[#191c1e] outline-none"
            >
              <option value="all">جميع الأدوار</option>
              <option value="مدير عام">مدير عام</option>
              <option value="مشرف تعليمي">مشرف تعليمي</option>
              <option value="أمين صندوق">أمين صندوق</option>
              <option value="معلم حلقة">معلم حلقة</option>
              <option value="مشرف فرع">مشرف فرع</option>
              <option value="موظف استقبال">موظف استقبال</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#f7f9fb] text-[#747779] border-b border-[#e1bfb5]">
                <th className="py-3 px-3 font-bold">المستخدم والاسم الكامل</th>
                <th className="py-3 px-3 font-bold font-mono">اسم المستخدم (Username)</th>
                <th className="py-3 px-3 font-bold font-mono">كلمة المرور (Password)</th>
                <th className="py-3 px-3 font-bold">الدور والصلاحيات</th>
                <th className="py-3 px-3 font-bold">الفرع</th>
                <th className="py-3 px-3 font-bold">الهاتف</th>
                <th className="py-3 px-3 font-bold text-center">الحالة</th>
                <th className="py-3 px-3 font-bold">آخر دخول</th>
                <th className="py-3 px-3 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1bfb5]/40 text-[#191c1e]">
              {filteredUsers.map((user) => {
                const isRevealed = revealedPasswords[user.id];
                return (
                  <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#fea619]"
                        />
                        <div>
                          <p className="font-bold text-[#191c1e]">{user.name}</p>
                          <p className="text-[10px] text-[#747779]">{user.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#9b2f00] dir-ltr text-left">
                      @{user.username}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#f2f4f6] px-2 py-1 rounded-md text-[11px] font-semibold text-[#191c1e]">
                          {isRevealed ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(user.id)}
                          className="text-[#747779] hover:text-[#191c1e] p-1 rounded"
                          title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isRevealed ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(user)}
                          className="text-[#747779] hover:text-[#9b2f00] p-1 rounded"
                          title="نسخ بيانات الدخول"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#59413a] font-medium">
                      {user.branch}
                    </td>

                    <td className="py-3 px-3 text-[#59413a] font-mono text-[11px] dir-ltr text-left">
                      {user.phone || '—'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          user.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {user.active ? '● نشط' : '○ معطل'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-[#747779]">
                      {user.lastLogin || '—'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setUserToEdit(user);
                            setIsEditUserModalOpen(true);
                          }}
                          className="p-1.5 text-[#59413a] hover:text-[#9b2f00] hover:bg-orange-50 rounded-lg transition-colors"
                          title="تعديل المستخدم وكلمة المرور"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.username === 'admin'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.username === 'admin'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-[#ba1a1a] hover:bg-red-50 cursor-pointer'
                          }`}
                          title="حذف الحساب"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Status & Controls Card */}
      <div className="bg-linear-to-br from-amber-50/60 to-orange-50/40 p-6 rounded-2xl border border-[#e1bfb5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e1bfb5]/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">ملف قاعدة البيانات: db.json</h2>
              <p className="text-xs text-[#59413a]">
                تطبيق القراءة والكتابة الحية على ملف db.json متزامن مع ذاكرة النظام والتخزين الدائم
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3.5 py-2 bg-white hover:bg-[#f2f4f6] text-[#59413a] border border-[#e1bfb5] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>استيراد ملف db.json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetToPdfData}
              disabled={isResetting}
              className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>إعادة تعيين لكشوفات PDF (294 طالب)</span>
            </button>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#e1bfb5] text-center">
            <p className="text-[11px] text-[#747779]">إجمالي الطلاب المسجلين</p>
            <p className="text-xl font-black text-[#9b2f00] mt-0.5">{database.students?.length || 0}</p>
            <span className="text-[10px] text-emerald-700 font-bold">مطابق لكشوفات الـ PDF</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#e1bfb5] text-center">
            <p className="text-[11px] text-[#747779]">إجمالي الحلقات القرآنية</p>
            <p className="text-xl font-black text-[#191c1e] mt-0.5">{database.circles?.length || 0}</p>
            <span className="text-[10px] text-[#855300] font-bold">32 حلقة معتمدة</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#e1bfb5] text-center">
            <p className="text-[11px] text-[#747779]">المعلمون والمشرفون</p>
            <p className="text-xl font-black text-[#191c1e] mt-0.5">{database.teachers?.length || 0}</p>
            <span className="text-[10px] text-[#59413a] font-bold">30 كادر تعليمي</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#e1bfb5] text-center">
            <p className="text-[11px] text-[#747779]">المستخدمون النشطون</p>
            <p className="text-xl font-black text-[#191c1e] mt-0.5">{usersList.filter((u) => u.active).length}</p>
            <span className="text-[10px] text-[#59413a] font-bold">حسابات دخول مفعلة</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Info Form (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs">
            <h2 className="text-base font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9b2f00]">business</span>
              البيانات الرسمية للمركز
            </h2>

            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#59413a] mb-1">اسم المركز الرسمي</label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">هاتف الاستقبال والتواصل</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59413a] mb-1">البريد الإلكتروني الرسمي</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1">فروع ومقرات المركز</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Panel: Toggles */}
        <div className="space-y-6">
          {/* Notifications Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fea619]">notifications_active</span>
              التنبيهات والاتصال
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9fb] cursor-pointer">
                <div>
                  <p className="font-bold text-[#191c1e]">رسائل WhatsApp لأولياء الأمور</p>
                  <p className="text-[11px] text-[#747779]">إرسال تقرير الغياب والحفظ تلقائياً</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9fb] cursor-pointer">
                <div>
                  <p className="font-bold text-[#191c1e]">تنبيهات SMS للحالات الطارئة</p>
                  <p className="text-[11px] text-[#747779]">بوابة الرسائل القصيرة المباشرة</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9fb] cursor-pointer">
                <div>
                  <p className="font-bold text-[#191c1e]">التقرير المالي الأسبوعي</p>
                  <p className="text-[11px] text-[#747779]">إرسال ملخص الصندوق للمدير العام</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailReports}
                  onChange={(e) => setEmailReports(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9fb] cursor-pointer">
                <div>
                  <p className="font-bold text-[#191c1e]">النسخ الاحتياطي التلقائي لـ db.json</p>
                  <p className="text-[11px] text-[#747779]">مزامنة دورية وتحديث السجلات</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
        initialUser={userToEdit}
        branches={database.branches || ['مصيلح', 'النجارية', 'مصيلح ومفرق الحجة ومفرق النجارية', 'مصيلح الرادار']}
      />
    </div>
  );
};
