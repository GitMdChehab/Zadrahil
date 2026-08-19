import React from 'react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'تبرع جديد بحاجة للمراجعة',
      desc: 'تم تسجيل تبرع بقيمة 5,000 ر.س من فاعل خير لحساب كفالة الحلقات',
      time: 'منذ 15 دقيقة',
      type: 'donation',
      tab: 'donations',
      unread: true,
    },
    {
      id: 'n2',
      title: 'تنبيه غياب متكرر',
      desc: 'سجل الطالب "عمر خالد صالح" تأخيراً لليوم الثالث على التوالي في حلقة الإمام مالك',
      time: 'منذ ساعتين',
      type: 'warning',
      tab: 'persons',
      unread: true,
    },
    {
      id: 'n3',
      title: 'اكتمال مقاعد الفعالية',
      desc: 'وصلت دورة تجويد القرآن المستوى الأول إلى 90% من طاقتها الاستيعابية',
      time: 'منذ 5 ساعات',
      type: 'info',
      tab: 'activities',
      unread: true,
    },
    {
      id: 'n4',
      title: 'اعتماد التقرير المالي الأسبوعي',
      desc: 'تم بنجاح مطابقة إيرادات ومصروفات الأسبوع الماضي مع الصندوق النقدي',
      time: 'أمس',
      type: 'financial',
      tab: 'financials',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-r border-[#e1bfb5] transition-transform"
        dir="rtl"
      >
        <div className="p-4 border-b border-[#e1bfb5] flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9b2f00]">notifications</span>
            <h3 className="font-bold text-[#191c1e] text-base">مركز التنبيهات</h3>
            <span className="bg-[#ba1a1a] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              3 جديدة
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#747779] hover:bg-[#e0e3e5]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#e1bfb5]/30">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onNavigateToTab(n.tab);
                onClose();
              }}
              className={`p-4 hover:bg-[#f2f4f6] cursor-pointer transition-colors ${
                n.unread ? 'bg-[#fff8e1]/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5">
                  {n.unread && <span className="w-2 h-2 rounded-full bg-[#fea619]"></span>}
                  {n.title}
                </h4>
                <span className="text-[10px] text-[#747779] whitespace-nowrap">{n.time}</span>
              </div>
              <p className="text-xs text-[#59413a] line-clamp-2">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#f7f9fb] border-t border-[#e1bfb5] text-center">
          <button
            onClick={() => {
              alert('تم تعليم جميع الإشعارات كمقروءة');
              onClose();
            }}
            className="text-xs text-[#9b2f00] font-bold hover:underline"
          >
            تعليم الكل كمقروء
          </button>
        </div>
      </div>
    </div>
  );
};
