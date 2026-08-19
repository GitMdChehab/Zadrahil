import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        <div className="bg-[#f7f9fb] px-6 py-4 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">help_outline</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">دليل استخدام مركز زاد الرحيل</h2>
              <p className="text-xs text-[#747779]">إرشادات سريعة لإدارة المركز بكفاءة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747779] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#e0e3e5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-[#59413a]">
          <div className="p-3.5 bg-[#f2f4f6] rounded-xl">
            <h3 className="font-bold text-[#191c1e] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#9b2f00]">person_add</span>
              التسجيل الجديد
            </h3>
            <p className="text-xs text-[#747779]">
              اضغط على زر &quot;New Registration&quot; في الشريط الجانبي لتسجيل طالب قرآن جديد أو معلم أو متبرع أو كادر إداري مباشرة.
            </p>
          </div>

          <div className="p-3.5 bg-[#f2f4f6] rounded-xl">
            <h3 className="font-bold text-[#191c1e] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#9b2f00]">calendar_month</span>
              الجدول وتسجيل الحضور السريع
            </h3>
            <p className="text-xs text-[#747779]">
              من شاشة Schedule، يمكنك متابعة الجدول الأسبوعي للقاعات، ورصد الحضور اللحظي للطلاب بنقرة واحدة (حاضر / غائب / متأخر).
            </p>
          </div>

          <div className="p-3.5 bg-[#f2f4f6] rounded-xl">
            <h3 className="font-bold text-[#191c1e] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#9b2f00]">payments</span>
              الشؤون المالية وتحويل العملات
            </h3>
            <p className="text-xs text-[#747779]">
              شاشة Financials تحتوي على تقارير الإيرادات والمصروفات وحاسبة تحويل العملات اللحظية وسندات الصرف والقبض.
            </p>
          </div>

          <div className="p-3.5 bg-[#f2f4f6] rounded-xl">
            <h3 className="font-bold text-[#191c1e] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#9b2f00]">volunteer_activism</span>
              التبرعات والكفالات
            </h3>
            <p className="text-xs text-[#747779]">
              إدارة حملات كفالة الحلقات ورصد التبرعات مع إمكانية إصدار إيصالات استلام رسمية للمتبرعين.
            </p>
          </div>
        </div>

        <div className="bg-[#f7f9fb] px-6 py-3 border-t border-[#e1bfb5] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-semibold bg-[#9b2f00] text-white hover:bg-[#c2410c] transition-all"
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};
