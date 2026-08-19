import React from 'react';
import { NavTab, UserAccount, AdminUser } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewRegistration: () => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentUser?: UserAccount | AdminUser | null;
}

export const CENTER_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC19vT3cGUuqwcb8p6zdr1xGLGxH491Ms4nQAZBiGymwJq8ccJ5xcmoLqrhTyD4Kd4KpNgHJxgCOeC6yj6SHjuSxDf_grsBSQ9XhXIlxPQc9jwpB0r4JLygrl4PuG7FnglE9JS8y1QezyFqNLVruf-5tsUMOG2G_iQirMHVEwYpVblSBJHwFf1WJZaI99urse7rPPQ4xnGswjk4EOQAFIYYckDnTRhdxNPNP6LlZeg85XZOCXnmMDwj98vcLvmjF4dG8T8';

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewRegistration,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  currentUser,
}) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: 'dashboard' },
    { id: 'persons', label: 'الطلاب والمعلمون', icon: 'group' },
    { id: 'academic', label: 'الشؤون التعليمية', icon: 'school' },
    { id: 'schedule', label: 'جدول الحصص', icon: 'calendar_month' },
    { id: 'activities', label: 'الأنشطة والبرامج', icon: 'event' },
    { id: 'donations', label: 'التبرعات والكفالات', icon: 'volunteer_activism' },
    { id: 'financials', label: 'الشؤون المالية', icon: 'payments' },
    { id: 'reference_tables', label: 'الجداول المرجعية', icon: 'table_chart' },
    { id: 'announcements', label: 'التعاميم والأخبار', icon: 'campaign' },
    { id: 'settings', label: 'إدارة النظام والمستخدمين', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed right-0 top-0 h-screen w-[280px] bg-white border-l border-[#e1bfb5] shadow-sm flex flex-col py-6 z-40 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="px-6 mb-6 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <img
                src={CENTER_LOGO}
                alt="Zad Al-Raheel Logo"
                className="w-20 h-20 rounded-full object-cover border-4 border-[#eceef0] shadow-sm cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setActiveTab('dashboard');
                  onCloseMobile?.();
                }}
              />
            </div>
            <h1 className="text-[20px] font-bold text-[#855300] tracking-tight">زاد الرحيل</h1>
            <p className="text-[13px] text-[#59413a]">مركز تعليم وتدريب القرآن الكريم</p>
          </div>

          {/* CTA Button */}
          <div className="px-4 mb-4">
            <button
              onClick={onOpenNewRegistration}
              className="w-full bg-[#9b2f00] hover:bg-[#c2410c] text-white h-12 rounded-lg font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>تسجيل طالب جديد</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-right rounded-l-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#fea619] text-[#684000] border-r-4 border-[#9b2f00] font-bold translate-x-1 shadow-sm'
                      : 'text-[#59413a] hover:bg-[#f2f4f6] font-medium'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive ? 'fill' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logged in User Card & Footer with Logout */}
          <div className="px-3 mt-auto pt-3 border-t border-[#e1bfb5]/40 space-y-2">
            {currentUser && (
              <div
                onClick={() => {
                  setActiveTab('profile');
                  onCloseMobile?.();
                }}
                className="p-2.5 rounded-xl bg-orange-50/60 border border-[#e1bfb5]/60 flex items-center gap-2.5 cursor-pointer hover:bg-orange-100/60 transition-colors"
                title="عرض الملف الشخصي"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#fea619]"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs font-bold text-[#191c1e] truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#855300] font-medium truncate">{currentUser.role}</p>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[#59413a] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors rounded-xl font-medium text-[13px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-red-600">logout</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
