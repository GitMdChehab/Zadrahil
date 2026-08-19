import React, { useState, useEffect } from 'react';
import { NavTab, NotificationItem } from '../../types';
import { pushNotifications, playNotificationSound } from '../../services/pushNotifications';
import { api } from '../../services/api';
import { SendPushModal } from './SendPushModal';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavTab) => void;
  notifications?: NotificationItem[];
  currentUser?: { name: string; role: string } | null;
  onShowToast?: (msg: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  notifications = [],
  currentUser,
  onShowToast = (_msg: string) => {},
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSendPushOpen, setIsSendPushOpen] = useState(false);

  useEffect(() => {
    setPermission(pushNotifications.getPermission());
    const prefs = pushNotifications.getPreferences();
    setSoundEnabled(prefs.soundEnabled);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await pushNotifications.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      onShowToast('تم تفعيل إشعارات المتصفح الفورية بنجاح! 🔔');
      await pushNotifications.showPush('مركز زاد الرحيل', 'تم تفعيل الإشعارات الفورية بنجاح على هذا المتصفح.');
    } else if (res === 'denied') {
      onShowToast('تم رفض إذن الإشعارات من إعدادات المتصفح');
    }
  };

  const handleToggleSound = () => {
    const updated = !soundEnabled;
    setSoundEnabled(updated);
    pushNotifications.savePreferences({ soundEnabled: updated });
    if (updated) {
      playNotificationSound();
      onShowToast('تم تفعيل نغمة التنبيهات الصوتية 🔊');
    } else {
      onShowToast('تم كتم التنبيهات الصوتية 🔇');
    }
  };

  const handleTestPush = async () => {
    await pushNotifications.showPush('اختبار إشعار فوري 🔔', 'هذا إشعار تجريبي من نظام مركز زاد الرحيل للتأكد من وصول الإشعارات.');
    onShowToast('تم إرسال إشعار تجريبي للمتصفح');
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsAsRead(notifications);
    onShowToast('تم تعليم جميع الإشعارات كمقروءة');
  };

  const handleClearAll = async () => {
    if (confirm('هل أنت متأكد من مسح كافة الإشعارات في السجل؟')) {
      await api.clearAllNotifications(notifications);
      onShowToast('تم مسح سجل الإشعارات بنجاح');
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (notif.unread) {
      await api.markNotificationAsRead(notif.id);
    }
    if (notif.targetTab) {
      onNavigateToTab(notif.targetTab);
      onClose();
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await api.deleteNotification(id);
    onShowToast('تم حذف الإشعار');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return n.unread;
    return n.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-r border-[#e1bfb5] transition-transform animate-in slide-in-from-left duration-200"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e1bfb5] bg-gradient-to-l from-orange-50/80 to-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#9b2f00] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>
            <div>
              <h3 className="font-bold text-[#191c1e] text-base leading-tight">مركز الإشعارات الفورية</h3>
              <p className="text-[11px] text-[#59413a]">
                {unreadCount > 0 ? `${unreadCount} تنبيهات غير مقروءة` : 'لا توجد تنبيهات جديدة'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-100/80 text-[#855300] border-amber-300'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#747779] hover:bg-[#e0e3e5] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Permission Status Banner */}
        <div className="p-3 bg-[#f7f9fb] border-b border-[#e1bfb5]/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                permission === 'granted'
                  ? 'bg-emerald-500 animate-pulse'
                  : permission === 'denied'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
              }`}
            ></span>
            <span className="text-[11px] font-bold text-[#191c1e]">
              {permission === 'granted'
                ? 'إشعارات المتصفح الفورية مفعلة'
                : permission === 'denied'
                ? 'الإشعارات محظورة بالمتصفح'
                : 'إشعارات المتصفح معطلة'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 bg-[#9b2f00] text-white text-[11px] font-bold rounded-lg hover:bg-[#c2410c] cursor-pointer shadow-2xs"
              >
                تفعيل الإشعارات
              </button>
            ) : (
              <button
                onClick={handleTestPush}
                title="إرسال إشعار تجريبي"
                className="px-2 py-0.5 bg-white border border-[#e1bfb5] text-[#59413a] text-[10px] font-bold rounded-md hover:bg-orange-50 cursor-pointer"
              >
                تجربة إشعار
              </button>
            )}
          </div>
        </div>

        {/* Quick Broadcast Action Button */}
        <div className="px-4 py-2.5 bg-orange-50/40 border-b border-[#e1bfb5]/40 flex items-center justify-between">
          <button
            onClick={() => setIsSendPushOpen(true)}
            className="w-full py-2 bg-gradient-to-r from-[#9b2f00] to-[#c2410c] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>بث إشعار فوري جديد (Push Notification)</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-[#f7f9fb] border-b border-[#e1bfb5]/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'unread', label: 'غير المقروء' },
            { id: 'donation', label: 'التبرعات' },
            { id: 'student', label: 'الطلاب' },
            { id: 'announcement', label: 'التعاميم' },
            { id: 'financial', label: 'المالية' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#9b2f00] text-white shadow-2xs'
                  : 'bg-white text-[#59413a] border border-[#e1bfb5]/60 hover:bg-orange-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e1bfb5]/30">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-[#747779]">
              <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2">
                notifications_off
              </span>
              <p className="text-xs font-bold text-[#191c1e]">لا توجد إشعارات في هذا التصنيف</p>
              <p className="text-[11px] text-[#8e9193] mt-1">
                ستظهر التنبيهات الفورية والتلقائية هنا عند حدوث عمليات في المركز.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const getTypeIcon = () => {
                switch (n.type) {
                  case 'donation':
                    return { icon: 'volunteer_activism', color: 'text-amber-600 bg-amber-50' };
                  case 'student':
                    return { icon: 'school', color: 'text-blue-600 bg-blue-50' };
                  case 'announcement':
                    return { icon: 'campaign', color: 'text-orange-600 bg-orange-50' };
                  case 'financial':
                    return { icon: 'account_balance_wallet', color: 'text-emerald-600 bg-emerald-50' };
                  case 'activity':
                    return { icon: 'event', color: 'text-purple-600 bg-purple-50' };
                  default:
                    return { icon: 'info', color: 'text-gray-600 bg-gray-50' };
                }
              };

              const iconInfo = getTypeIcon();

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-[#f2f4f6] cursor-pointer transition-colors group relative ${
                    n.unread ? 'bg-[#fff8e1]/40 border-r-4 border-r-[#fea619]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconInfo.color}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {iconInfo.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5 truncate">
                          {n.title}
                          {n.isUrgent && (
                            <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              عاجل
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-[#747779] shrink-0">{n.date}</span>
                      </div>

                      <p className="text-xs text-[#59413a] leading-relaxed line-clamp-2">{n.body}</p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#e1bfb5]/20 text-[10px] text-[#747779]">
                        <span>
                          {n.senderName ? `بواسطة: ${n.senderName}` : 'النظام الآلي'}
                        </span>
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                          {n.targetTab && (
                            <span className="text-[#9b2f00] font-bold flex items-center gap-0.5 hover:underline">
                              الانتقال للصفحة
                              <span className="material-symbols-outlined text-[12px]">
                                arrow_back
                              </span>
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteItem(e, n.id)}
                            title="حذف الإشعار"
                            className="text-gray-400 hover:text-red-600 p-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#f7f9fb] border-t border-[#e1bfb5] flex items-center justify-between">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs text-[#9b2f00] font-bold hover:underline disabled:opacity-40 cursor-pointer"
          >
            تعليم الكل كمقروء
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="text-xs text-gray-500 hover:text-red-600 font-bold transition-colors disabled:opacity-40 cursor-pointer"
          >
            مسح السجل
          </button>
        </div>
      </div>

      {/* Broadcast Composer Modal */}
      <SendPushModal
        isOpen={isSendPushOpen}
        onClose={() => setIsSendPushOpen(false)}
        onShowToast={onShowToast}
        currentUser={currentUser}
      />
    </div>
  );
};
