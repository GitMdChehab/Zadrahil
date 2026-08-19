import React, { useState } from 'react';
import { Donation, SupportedCurrency } from '../../types';

interface AddDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate?: number;
  onAddDonation: (donation: Omit<Donation, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const AddDonationModal: React.FC<AddDonationModalProps> = ({
  isOpen,
  onClose,
  exchangeRate = 89500,
  onAddDonation,
  onShowToast,
}) => {
  const [donorName, setDonorName] = useState('فاعل خير');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amountInput, setAmountInput] = useState<number>(100);
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [category, setCategory] = useState<Donation['category']>('كفالة حلقة');
  const [paymentMethod, setPaymentMethod] = useState('نقداً بالدولار ($)');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const quickAmountsUSD = [20, 50, 100, 150, 300, 500];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || amountInput <= 0) {
      alert('يرجى تحديد مبلغ التبرع');
      return;
    }

    const amountUSD = currency === 'USD' ? Number(amountInput) : Number(amountInput) / exchangeRate;
    const amountLBP = currency === 'LBP' ? Number(amountInput) : Number(amountInput) * exchangeRate;

    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddDonation({
      donorName: isAnonymous ? 'فاعل خير (مجهول)' : donorName || 'فاعل خير',
      amountUSD: Math.round(amountUSD * 100) / 100,
      amountLBP: Math.round(amountLBP),
      currency,
      category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'مكتمل',
      receiptNumber: receiptNum,
      notes,
    });

    onShowToast(`تم تسجيل التبرع بمبلغ ${amountInput} ${currency === 'USD' ? '$' : 'ل.ل.'} وتوليد سند قبض رقم ${receiptNum}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        <div className="bg-[#f7f9fb] px-6 py-4 border-b border-[#e1bfb5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">volunteer_activism</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">تسجيل تبرع / كفالة جديدة</h2>
              <p className="text-xs text-[#747779]">إصدار سند قبض وتوثيق في الصندوق ($ وليرة لبنانية)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#747779] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#e0e3e5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="flex items-center justify-between bg-[#f2f4f6] p-3 rounded-xl">
            <span className="text-sm font-medium text-[#191c1e]">متبرع مجهول (فاعل خير)</span>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                if (e.target.checked) setDonorName('فاعل خير');
              }}
              className="w-4 h-4 text-[#9b2f00] rounded focus:ring-0 accent-[#9b2f00]"
            />
          </div>

          {!isAnonymous && (
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">اسم المتبرع الكريم *</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="مثال: الحاج عبدالرحمن الصالح"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">مبلغ التبرع والعملة *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(Number(e.target.value))}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-lg font-bold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="w-32 px-3 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-bold text-[#191c1e] outline-none"
              >
                <option value="USD">USD ($ - دولار)</option>
                <option value="LBP">LBP (ل.ل. - ليرة)</option>
              </select>
            </div>

            {/* Quick amounts in USD */}
            {currency === 'USD' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmountsUSD.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmountInput(q)}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer ${
                      amountInput === q
                        ? 'bg-[#fea619] text-[#684000] border-[#fea619]'
                        : 'bg-[#f2f4f6] text-[#59413a] border-transparent hover:bg-[#e0e3e5]'
                    }`}
                  >
                    ${q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">مصرف / وجه التبرع</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="كفالة حلقة">كفالة حلقة قرآنية ($150)</option>
                <option value="كفالة طالب">كفالة طالب قرآن ($20)</option>
                <option value="صندوق المعلمين">صندوق إكرام المعلمين</option>
                <option value="وقف قرآني">وقف طباعة المصاحف</option>
                <option value="تبرع عام">تبرع عام للصندوق</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">طريقة الدفع</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="نقداً بالدولار ($)">نقداً بالدولار ($)</option>
                <option value="نقداً بالليرة اللبنانية">نقداً بالليرة اللبنانية</option>
                <option value="تحويل نقدي مباشر (OMT / Wish)">تحويل نقدي مباشر (OMT / Wish)</option>
                <option value="شيك مصرفي">شيك مصرفي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">ملاحظات أو تخصيص المتبرع</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: كفالة لحلقة معينة، أو إهداء لروح متوفى..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e1bfb5]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#59413a] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#9b2f00] hover:bg-[#c2410c] text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>حفظ وتوليد السند</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
