import React, { useState } from 'react';
import { FinancialTransaction, SupportedCurrency } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate?: number;
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  exchangeRate = 89500,
  onAddTransaction,
  onShowToast,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FinancialTransaction['category']>('إيرادات تعليمية');
  const [amountInput, setAmountInput] = useState<number>(50);
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amountInput) {
      alert('يرجى ملء الوصف والمبلغ');
      return;
    }

    const rawUSD = currency === 'USD' ? Number(amountInput) : Number(amountInput) / exchangeRate;
    const finalUSD = type === 'expense' ? -Math.abs(rawUSD) : Math.abs(rawUSD);

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      description,
      category,
      amountUSD: Math.round(finalUSD * 100) / 100,
      currency,
      status: 'مكتمل',
      type,
    });

    onShowToast(`تم تسجيل ${type === 'income' ? 'الإيراد' : 'المصروف'} بمبلغ ${amountInput} ${currency === 'USD' ? '$' : 'ل.ل.'}`);
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
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <span className="material-symbols-outlined">
                {type === 'income' ? 'arrow_downward' : 'arrow_upward'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">
                {type === 'income' ? 'تسجيل سند قبض (إيراد)' : 'تسجيل سند صرف (مصروف)'}
              </h2>
              <p className="text-xs text-[#747779]">توثيق حركة مالية في السجل ($ وليرة لبنانية)</p>
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
          <div className="grid grid-cols-2 gap-2 bg-[#f2f4f6] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('إيرادات تعليمية');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income' ? 'bg-white text-emerald-800 shadow-xs border border-[#e1bfb5]/40' : 'text-[#59413a]'
              }`}
            >
              + سند قبض (وارد / إيراد)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('مصروفات تشغيلية');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense' ? 'bg-white text-red-800 shadow-xs border border-[#e1bfb5]/40' : 'text-[#59413a]'
              }`}
            >
              - سند صرف (صادر / نفقة)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">البيان / الوصف *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'مثال: رسوم اختبارات، اشتراك سنوي...' : 'مثال: صيانة المركز، فواتير كهرباء ومولد، ضيافة...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">المبلغ والعملة *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(Number(e.target.value))}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-lg font-bold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="w-28 px-2 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-bold text-[#191c1e] outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="LBP">LBP (ل.ل.)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">التصنيف المحاسبي</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                {type === 'income' ? (
                  <>
                    <option value="إيرادات تعليمية">إيرادات تعليمية واشتراكات</option>
                    <option value="تبرعات">تبرعات عامة وصناديق</option>
                  </>
                ) : (
                  <>
                    <option value="مصروفات تشغيلية">مصروفات تشغيلية وكهرباء ومولد</option>
                    <option value="رواتب وأجور">مكافآت ورواتب المعلمين</option>
                    <option value="مشتريات">قرطاسية ومصاحف وجوائز</option>
                  </>
                )}
              </select>
            </div>
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
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                type === 'income' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#ba1a1a] hover:bg-red-700'
              }`}
            >
              حفظ السند المالي
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
