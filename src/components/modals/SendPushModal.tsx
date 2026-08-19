import React, { useState } from 'react';
import { NavTab, NotificationItem } from '../../types';
import { pushNotifications } from '../../services/pushNotifications';

interface SendPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  currentUser?: { name: string; role: string } | null;
}

export const SendPushModal: React.FC<SendPushModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('announcement');
  const [targetTab, setTargetTab] = useState<NavTab>('dashboard');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('يرجى ملء عنوان ونص الإشعار');
      return;
    }

    setIsSending(true);
    try {
      await pushNotifications.sendNotification({
        title: title.trim(),
        body: body.trim(),
        type,
        targetTab,
        isUrgent,
        senderName: currentUser?.name || 'الإدارة العامة',
        senderRole: currentUser?.role || 'مسؤول النظام',
      });

      onShowToast('تم إرسال وبث الإشعار الفوري بنجاح إلى Firebase والمتصفح 🔔');
      onClose();
      setTitle('');
      setBody('');
      setIsUrgent(false);
    } catch (error) {
      console.error('Error sending push notification:', error);
      onShowToast('حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#e1bfb5] overflow-hidden animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-l from-orange-50 to-amber-50/50 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">cell_tower</span>
            </div>
            <div>
              <h3 className="font-bold text-[#191c1e] text-base">بث إشعار فوري (Push Notification)</h3>
              <p className="text-[11px] text-[#59413a]">إرسال إشعار فوري يظهر على المتصفح وأجهزة الكادر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#747779] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
              عنوان الإشعار <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تعميم طارئ بخصوص مواعيد الحلقات..."
              className="w-full px-3.5 py-2.5 bg-[#f7f9fb] border border-[#e1bfb5] rounded-xl text-sm outline-none focus:border-[#9b2f00] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
              نص الإشعار والتفاصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب رسالة الإشعار بوضوح..."
              className="w-full px-3.5 py-2.5 bg-[#f7f9fb] border border-[#e1bfb5] rounded-xl text-sm outline-none focus:border-[#9b2f00] focus:bg-white transition-colors resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-1.5">تصنيف الإشعار</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationItem['type'])}
                className="w-full px-3 py-2 bg-[#f7f9fb] border border-[#e1bfb5] rounded-xl text-xs font-medium outline-none focus:border-[#9b2f00]"
              >
                <option value="announcement">📢 تعميم وإعلان</option>
                <option value="student">🎓 شؤون الطلاب والحلقات</option>
                <option value="donation">💰 التبرعات والمالية</option>
                <option value="financial">📊 العمليات المحاسبية</option>
                <option value="activity">🎯 فعالية أو نشاط</option>
                <option value="system">⚙️ تنبيه إداري ونظام</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-1.5">التبويب المستهدف عند النقر</label>
              <select
                value={targetTab}
                onChange={(e) => setTargetTab(e.target.value as NavTab)}
                className="w-full px-3 py-2 bg-[#f7f9fb] border border-[#e1bfb5] rounded-xl text-xs font-medium outline-none focus:border-[#9b2f00]"
              >
                <option value="dashboard">لوحة التحكم</option>
                <option value="announcements">الإعلانات والتعاميم</option>
                <option value="persons">الطلاب والحلقات</option>
                <option value="donations">سندات التبرعات</option>
                <option value="financials">الإدارة المالية</option>
                <option value="activities">الأنشطة والفعاليات</option>
                <option value="schedule">جدول الحصص</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[20px]">emergency_home</span>
              <div>
                <p className="text-xs font-bold text-[#191c1e]">تنبيه عاجل وهام</p>
                <p className="text-[10px] text-[#59413a]">يثبّت الإشعار ويصدر نغمة تنبيه قوية للمستلمين</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9b2f00]"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e1bfb5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#59413a] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isSending ? 'جارِ البث...' : 'بث الإشعار الآن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
