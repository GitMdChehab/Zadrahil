import React, { useState } from 'react';
import { CENTER_LOGO } from '../Sidebar';
import { UserAccount } from '../../types';
import { INITIAL_USERS } from '../../data/dbData';

interface LoginViewProps {
  users?: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users = INITIAL_USERS,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const availableUsers = users && users.length > 0 ? users : INITIAL_USERS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      const matchedUser = availableUsers.find((u) => {
        const matchUser =
          u.username.toLowerCase() === cleanUsername ||
          (u.email && u.email.toLowerCase() === cleanUsername);
        return matchUser && u.password === cleanPassword;
      });

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
        return;
      }

      if (matchedUser.active === false) {
        setIsLoading(false);
        setErrorMsg('هذا الحساب معطل حالياً من قِبل إدارة المركز.');
        return;
      }

      // Update last login
      const updatedUser: UserAccount = {
        ...matchedUser,
        lastLogin: 'اليوم، ' + new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' }),
      };

      if (rememberMe) {
        localStorage.setItem('zad_remember_user', cleanUsername);
      }

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  const handleQuickLogin = (u: UserAccount) => {
    setUsername(u.username);
    setPassword(u.password);
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      if (u.active === false) {
        setIsLoading(false);
        setErrorMsg('هذا الحساب معطل حالياً من قِبل إدارة المركز.');
        return;
      }

      const updatedUser: UserAccount = {
        ...u,
        lastLogin: 'اليوم، ' + new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' }),
      };

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 300);
  };

  const getRoleBadge = (role: string) => {
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 py-8 relative bg-[#1c1917]"
      dir="rtl"
    >
      {/* Authentic Background with warm overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity filter saturate-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#1c1917]/90 via-[#292524]/95 to-[#1c1917]/98" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Login Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e1bfb5] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
          <div>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <img
                  src={CENTER_LOGO}
                  alt="Zad Al-Raheel Logo"
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#fea619] shadow-md hover:scale-105 transition-transform"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#855300] tracking-tight">
                مركز زاد الرحيل لتعليم وتدريب القرآن الكريم
              </h1>
              <p className="text-xs font-semibold text-[#59413a] mt-0.5">
                بوابة تسجيل الدخول للنظام الإداري والتعليمي
              </p>
              <div className="h-1 w-12 bg-[#fea619] rounded-full mt-2"></div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-shake">
                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                  error
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#59413a] mb-1.5">
                  اسم المستخدم (Username) أو البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="مثال: admin أو bilal.teacher"
                    dir="ltr"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono font-medium text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-[#747779] text-[20px]">
                    account_circle
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59413a] mb-1.5">
                  كلمة المرور (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="أدخل كلمة المرور"
                    dir="ltr"
                    className="w-full px-4 py-3 pr-10 pl-10 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-mono font-medium text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none text-left"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-[#747779] text-[20px]">
                    lock
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-[#747779] hover:text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#59413a]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                  />
                  <span>تذكر بيانات تسجيل الدخول</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="text-[#9b2f00] font-bold hover:underline lg:hidden"
                >
                  {showDemoAccounts ? 'إخفاء الحسابات التجريبية' : 'عرض الحسابات المتاحة'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-[#9b2f00] hover:bg-[#c2410c] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>تسجيل الدخول للنظام</span>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e1bfb5]/40 text-center">
            <p className="text-[11px] text-[#747779]">
              نظام محمي بكلمات مرور وصلاحيات مخصصة لكل مستخدم • الإصدار 2.0
            </p>
          </div>
        </div>

        {/* Side Panel: Quick Demo Logins & User Guide */}
        <div
          className={`lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-[#e1bfb5] flex flex-col justify-between ${
            showDemoAccounts ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e1bfb5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9b2f00] text-[22px]">
                  vpn_key
                </span>
                <h2 className="text-sm font-bold text-[#191c1e]">
                  الحسابات التجريبية السريعة
                </h2>
              </div>
              <span className="text-[10px] bg-orange-100 text-[#9b2f00] font-bold px-2 py-0.5 rounded-full">
                دخول بنقرة واحدة
              </span>
            </div>

            <p className="text-[11px] text-[#59413a] my-2.5">
              يمكنك اختيار أي حساب لتسجيل الدخول الفوري وتجربة صلاحياته:
            </p>

            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {availableUsers.map((u) => {
                const isSelected = username === u.username;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${
                      isSelected
                        ? 'border-[#9b2f00] bg-orange-50/80 ring-1 ring-[#9b2f00]'
                        : 'border-[#e1bfb5]/70 bg-white hover:border-[#9b2f00]/50 hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#fea619]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-[#191c1e] group-hover:text-[#9b2f00]">
                            {u.name}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#747779] font-mono">
                          <span>U: <strong className="text-[#191c1e]">{u.username}</strong></span>
                          <span>•</span>
                          <span>P: <strong className="text-[#191c1e]">{u.password}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#59413a] group-hover:bg-[#9b2f00] group-hover:text-white transition-colors"
                      title="تسجيل الدخول بهذا الحساب"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e1bfb5]/50 bg-amber-50/50 p-3 rounded-xl">
            <p className="text-[11px] text-[#855300] font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>يمكن للمدير العام إضافة وتعديل حسابات وكلمات مرور جميع الكادر من داخل شاشة الإعدادات.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
