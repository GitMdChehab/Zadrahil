import React, { useState, useMemo } from 'react';
import { Donation } from '../../types';

interface DonationsViewProps {
  donations: Donation[];
  exchangeRate?: number;
  onOpenAddDonation: () => void;
  onOpenPrintModal: (docType: string, customData?: any) => void;
  onShowToast: (msg: string) => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({
  donations,
  exchangeRate = 89500,
  onOpenAddDonation,
  onOpenPrintModal,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [receiptToView, setReceiptToView] = useState<Donation | null>(null);

  const totalDonationsUSD = donations.reduce((acc, d) => acc + (d.amountUSD || 0), 0);
  const totalDonationsLBP = totalDonationsUSD * exchangeRate;

  const campaigns = [
    {
      id: 'camp-1',
      title: 'كفالة حلقات تحفيظ القرآن الكريم',
      desc: 'كفالة شهرية وسنوية لتغطية مكافآت المعلمين والجوائز التشجيعية للطلاب بالفروع الأربعة.',
      targetUSD: 1800,
      raisedUSD: 1250,
      donorsCount: 14,
    },
    {
      id: 'camp-2',
      title: 'طباعة المصاحف وكتب التجويد والنورانية',
      desc: 'توفير المصاحف المجودة وكتب المتون وقواعد النورانية لطلاب المركز.',
      targetUSD: 600,
      raisedUSD: 480,
      donorsCount: 9,
    },
    {
      id: 'camp-3',
      title: 'صندوق كفالة المعلمين المتميزين والإجازات',
      desc: 'مكافآت التميز والإجازات بالسند لمعلمي حلقات الإتقان وتكريم المبرزين.',
      targetUSD: 1000,
      raisedUSD: 720,
      donorsCount: 8,
    },
  ];

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchSearch =
        d.donorName.toLowerCase().includes(search.toLowerCase()) ||
        d.receiptNumber.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || d.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [donations, search, selectedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-[#855300] text-[11px] font-bold">
              العملات: USD ($) & LBP (ل.ل.)
            </span>
            <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
              سجل التبرعات والكفالات القرآنية
            </h1>
          </div>
          <p className="text-xs text-[#59413a] mt-1">
            إدارة الصناديق الوقفية، كفالات الحلقات، وتوثيق إيصالات وسندات القبض الرسمية بالدولار والليرة اللبنانية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenPrintModal('donation_catalog')}
            className="px-3.5 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>دليل الكفالات</span>
          </button>

          <button
            onClick={onOpenAddDonation}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
            <span>تسجيل تبرع جديد</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <span className="text-xs font-bold text-[#747779]">إجمالي التبرعات المحصلة</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-emerald-800">
              ${totalDonationsUSD.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#59413a]">
              ({totalDonationsLBP.toLocaleString()} ل.ل.)
            </span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            {donations.length} سندات قبض رسمية معتمدة
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <span className="text-xs font-bold text-[#747779]">الحلقات المكفولة</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-[#855300]">18 حلقة</span>
            <span className="text-xs font-bold text-[#747779]">/ 32 حلقة</span>
          </div>
          <p className="text-xs text-[#59413a] mt-1">تغطية مكافآت المعلمين والجوائز</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <span className="text-xs font-bold text-[#747779]">سعر الصرف المعتمد</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-[#9b2f00]">
              {exchangeRate.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#747779]">ل.ل. / $</span>
          </div>
          <p className="text-xs text-[#59413a] mt-1">سعر التحويل للسندات المقبوضة</p>
        </div>
      </div>

      {/* Campaigns Progress */}
      <div>
        <h2 className="text-base font-bold text-[#191c1e] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#fea619]">campaign</span>
          حملات الدعم والكفالة الجارية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((camp) => {
            const pct = Math.round((camp.raisedUSD / camp.targetUSD) * 100);
            return (
              <div
                key={camp.id}
                className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#191c1e] mb-1">{camp.title}</h3>
                  <p className="text-xs text-[#59413a] leading-relaxed mb-3">{camp.desc}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#9b2f00]">${camp.raisedUSD.toLocaleString()}</span>
                    <span className="text-[#747779]">الهدف: ${camp.targetUSD.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-linear-to-r from-[#fea619] to-[#9b2f00] rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#747779]">
                    <span>تم إنجاز {pct}%</span>
                    <span>{camp.donorsCount} مساهم</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e1bfb5] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث بالاسم أو رقم الإيصال..."
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#f2f4f6] border border-transparent text-xs text-[#191c1e] focus:bg-white focus:border-[#9b2f00] outline-none"
              />
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[18px]">
                search
              </span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none"
            >
              <option value="all">كل أوجه التبرع</option>
              <option value="تبرع عام">تبرع عام</option>
              <option value="كفالة حلقة">كفالة حلقة</option>
              <option value="صندوق المعلمين">صندوق المعلمين</option>
              <option value="وقف قرآني">وقف قرآني</option>
            </select>
          </div>

          <div className="text-xs text-[#747779]">
            عدد السجلات: <span className="font-bold text-[#191c1e]">{filteredDonations.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                <th className="py-3.5 px-6">المتبرع</th>
                <th className="py-3.5 px-4">المبلغ بالدولار ($)</th>
                <th className="py-3.5 px-4">المقابل بالليرة اللبنانية</th>
                <th className="py-3.5 px-4">مصرف التبرع</th>
                <th className="py-3.5 px-4">طريقة الدفع</th>
                <th className="py-3.5 px-4">رقم الإيصال</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-6 text-left">الإيصال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
              {filteredDonations.map((d) => (
                <tr key={d.id} className="hover:bg-[#f2f4f6]/60 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                      {d.donorName.charAt(0)}
                    </span>
                    <span>{d.donorName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-800 text-sm">
                    ${d.amountUSD?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#59413a]">
                    {(d.amountLBP || d.amountUSD * exchangeRate).toLocaleString()} ل.ل.
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#fff8e1] text-[#684000] px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                      {d.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#59413a]">{d.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-mono text-[#747779]">{d.receiptNumber}</td>
                  <td className="py-3.5 px-4 text-[#747779]">{d.date}</td>
                  <td className="py-3.5 px-6 text-left">
                    <button
                      onClick={() => setReceiptToView(d)}
                      className="px-3 py-1 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#9b2f00] rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 inline-flex cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt</span>
                      <span>معاينة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#e1bfb5] overflow-hidden p-6"
            dir="rtl"
          >
            <div className="text-center pb-4 border-b border-[#e1bfb5]/60 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold mb-2">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <h3 className="text-lg font-bold text-[#191c1e]">سند قبض رسمي معتمد</h3>
              <p className="text-xs text-[#747779]">مركز زاد الرحيل لتعليم القرآن الكريم</p>
            </div>

            <div className="space-y-2.5 text-xs bg-[#f7f9fb] p-4 rounded-xl mb-4 border border-[#e1bfb5]/40">
              <div className="flex justify-between">
                <span className="text-[#747779]">رقم السند:</span>
                <span className="font-mono font-bold text-[#191c1e]">{receiptToView.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">اسم المتبرع:</span>
                <span className="font-bold text-[#191c1e]">{receiptToView.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">المبلغ بالدولار ($):</span>
                <span className="font-black text-sm text-emerald-800">
                  ${receiptToView.amountUSD.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">المقابل بالليرة اللبنانية:</span>
                <span className="font-bold font-mono text-[#9b2f00]">
                  {(receiptToView.amountLBP || receiptToView.amountUSD * exchangeRate).toLocaleString()} ل.ل.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">مصرف التبرع:</span>
                <span className="font-semibold text-[#191c1e]">{receiptToView.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">طريقة الدفع:</span>
                <span className="text-[#191c1e]">{receiptToView.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#747779]">التاريخ:</span>
                <span className="text-[#191c1e]">{receiptToView.date}</span>
              </div>
              {receiptToView.notes && (
                <div className="pt-2 border-t border-[#e1bfb5]/40">
                  <span className="text-[#747779] block mb-0.5">ملاحظات:</span>
                  <span className="text-[#59413a]">{receiptToView.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onOpenPrintModal('donation_receipt', { donationId: receiptToView.id });
                  setReceiptToView(null);
                }}
                className="flex-1 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>طباعة سند القبض</span>
              </button>
              <button
                onClick={() => setReceiptToView(null)}
                className="px-4 py-2.5 bg-[#f2f4f6] text-[#59413a] rounded-xl font-semibold text-xs hover:bg-[#e0e3e5] cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
