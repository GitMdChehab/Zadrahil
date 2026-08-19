import React, { useState } from 'react';
import { AdminUser, NavTab, UserAccount } from '../types';

interface TopAppBarProps {
  adminUser?: AdminUser;
  currentUser?: UserAccount | AdminUser | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onOpenPrintModal: () => void;
  onLogout?: () => void;
  unreadCount?: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  adminUser,
  currentUser,
  setActiveTab,
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenHelp,
  onOpenPrintModal,
  onLogout,
  unreadCount = 3,
  searchQuery,
  setSearchQuery,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeUser = currentUser || adminUser || {
    name: 'أحمد عبدالله',
    role: 'مدير عام',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#e1bfb5] px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Right side (RTL Start): Mobile Menu, Search, and Firebase Live indicator */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-[#59413a] hover:bg-[#f2f4f6] active:scale-95 transition-transform"
          aria-label="القائمة"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full max-w-md">
          <div
            className={`flex items-center w-full bg-[#f2f4f6] rounded-full px-3.5 py-1.5 border transition-all duration-200 ${
              isSearchFocused ? 'border-[#9b2f00] bg-white ring-2 ring-[#fea619]/20' : 'border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[#747779] text-[20px] ml-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="البحث السريع (الطلاب، الحلقات، التبرعات، الإعلانات)..."
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#191c1e] w-full placeholder:text-[#8e9193]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#8e9193] hover:text-[#191c1e] p-0.5"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Firebase badge */}
        <div
          title="قاعدة بيانات Firebase متصلة ومزامنة في الوقت الفعلي"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold shrink-0 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Firebase متصل</span>
        </div>
      </div>

      {/* Left side (RTL End): Actions & Profile */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Quick Print Center Button */}
        <button
          onClick={onOpenPrintModal}
          title="طباعة التقارير والسندات الرسمية"
          className="p-2 rounded-full text-[#9b2f00] hover:bg-orange-50 transition-colors relative cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[22px]">print</span>
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          title="دليل النظام والمساعدة"
          className="p-2 rounded-full text-[#59413a] hover:bg-[#f2f4f6] transition-colors relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          title="الإشعارات والتنبيهات"
          className="p-2 rounded-full text-[#59413a] hover:bg-[#f2f4f6] transition-colors relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 left-1.5 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-[#e1bfb5]/60 hidden sm:block"></div>

        {/* Profile Pill */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-orange-50/70 cursor-pointer transition-colors border border-transparent hover:border-[#e1bfb5]"
          title="عرض الحساب والملف الشخصي"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#191c1e] leading-tight">{activeUser.name}</p>
            <p className="text-[10px] text-[#9b2f00] font-bold">{activeUser.role}</p>
          </div>
          <div className="relative">
            <img
              src={activeUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={activeUser.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#fea619]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
        </div>

        {/* Quick Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-full text-[#747779] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
