import React, { useState } from 'react';
import { FinancialTransaction, SupportedCurrency } from '../../types';

interface FinancialsViewProps {
  transactions: FinancialTransaction[];
  exchangeRate?: number;
  onOpenAddTransaction: () => void;
  onOpenPrintModal: (docType?: string) => void;
  onShowToast: (msg: string) => void;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  transactions,
  exchangeRate = 89500,
  onOpenAddTransaction,
  onOpenPrintModal,
  onShowToast,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currencyMode, setCurrencyMode] = useState<SupportedCurrency>('USD');

  // Currency Converter State (Strictly USD & LBP)
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>('USD');
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>('LBP');

  const convertCurrency = (amt: number, from: SupportedCurrency, to: SupportedCurrency) => {
    if (from === to) return amt.toLocaleString();
    if (from === 'USD' && to === 'LBP') {
      return (amt * exchangeRate).toLocaleString();
    }
    if (from === 'LBP' && to === 'USD') {
      return (amt / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return amt.toLocaleString();
  };

  const totalIncomeUSD = transactions
    .filter((t) => t.amountUSD > 0)
    .reduce((a, b) => a + b.amountUSD, 0);

  const totalExpenseUSD = transactions
    .filter((t) => t.amountUSD < 0)
    .reduce((a, b) => a + Math.abs(b.amountUSD), 0);

  const netBalanceUSD = totalIncomeUSD - totalExpenseUSD;

  const totalIncomeLBP = totalIncomeUSD * exchangeRate;
  const totalExpenseLBP = totalExpenseUSD * exchangeRate;
  const netBalanceLBP = netBalanceUSD * exchangeRate;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'income') return t.amountUSD > 0;
    if (filterType === 'expense') return t.amountUSD < 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              العملات: USD ($) & LBP (ل.ل.)
            </span>
            <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
              الإدارة المالية والمحاسبية
            </h1>
          </div>
          <p className="text-xs text-[#59413a] mt-1">
            سجل التدفقات النقدية بالدولار والليرة اللبنانية، مكافآت المعلمين، والميزانية الختامية
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency Display Toggle */}
          <div className="flex bg-[#f2f4f6] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'USD' ? 'bg-[#9b2f00] text-white shadow-xs' : 'text-[#59413a]'
              }`}
            >
              عرض بالدولار ($)
            </button>
            <button
              onClick={() => setCurrencyMode('LBP')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'LBP' ? 'bg-[#9b2f00] text-white shadow-xs' : 'text-[#59413a]'
              }`}
            >
              عرض بالليرة (ل.ل.)
            </button>
          </div>

          <button
            onClick={() => onOpenPrintModal('financial_statement')}
            className="px-3.5 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>طباعة التقرير المالي</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="px-4 py-2.5 bg-[#fea619] hover:bg-[#e09214] text-[#684000] rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>تسجيل سند جديد</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#747779]">إجمالي الإيرادات</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-800">
            {currencyMode === 'USD' ? (
              <>+${totalIncomeUSD.toLocaleString()}</>
            ) : (
              <>{totalIncomeLBP.toLocaleString()} <span className="text-xs font-normal">ل.ل.</span></>
            )}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {currencyMode === 'USD'
              ? `ما يعادل ${(totalIncomeUSD * exchangeRate).toLocaleString()} ل.ل.`
              : `ما يعادل $${totalIncomeUSD.toLocaleString()}`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#747779]">المصروفات والتشغيل</span>
            <span className="w-8 h-8 rounded-lg bg-red-50 text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </span>
          </div>
          <p className="text-2xl font-black text-[#ba1a1a]">
            {currencyMode === 'USD' ? (
              <>-${totalExpenseUSD.toLocaleString()}</>
            ) : (
              <>-{totalExpenseLBP.toLocaleString()} <span className="text-xs font-normal">ل.ل.</span></>
            )}
          </p>
          <p className="text-[11px] text-[#ba1a1a] mt-1 font-semibold">
            {currencyMode === 'USD'
              ? `ما يعادل ${(totalExpenseUSD * exchangeRate).toLocaleString()} ل.ل.`
              : `ما يعادل $${totalExpenseUSD.toLocaleString()}`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#747779]">صافي الفائض المالي</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-[#855300] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
          </div>
          <p className={`text-2xl font-black ${netBalanceUSD >= 0 ? 'text-[#855300]' : 'text-red-700'}`}>
            {currencyMode === 'USD' ? (
              <>{netBalanceUSD >= 0 ? '+' : '-'}${Math.abs(netBalanceUSD).toLocaleString()}</>
            ) : (
              <>{netBalanceUSD >= 0 ? '+' : '-'}{Math.abs(netBalanceLBP).toLocaleString()} <span className="text-xs font-normal">ل.ل.</span></>
            )}
          </p>
          <p className="text-[11px] text-[#59413a] mt-1">رصيد الصندوق المتاح بالفروع</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#747779]">سعر الصرف المعتمد</span>
            <span className="w-8 h-8 rounded-lg bg-orange-50 text-[#9b2f00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            </span>
          </div>
          <p className="text-2xl font-black text-[#191c1e]">
            {exchangeRate.toLocaleString()} <span className="text-xs font-normal">ل.ل. / $</span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">تحديث لحظي لجميع الحسابات</p>
        </div>
      </div>

      {/* Main Grid: Currency Exchange Calculator & Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Converter Card (USD <-> LBP only) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#191c1e]">حاسبة الدولار / الليرة اللبنانية</h2>
              <p className="text-[11px] text-[#747779]">التحويل الفوري المعتمد لصندوق المركز</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">المبلغ المطلوب تحويله</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f2f4f6] text-sm font-bold text-[#191c1e] border-none outline-none"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as SupportedCurrency)}
                  className="w-28 px-2 py-2 rounded-xl bg-[#f2f4f6] text-xs font-bold text-[#191c1e] border-none outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="LBP">LBP (ل.ل.)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center my-1">
              <button
                type="button"
                onClick={() => {
                  const temp = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(temp);
                }}
                className="w-8 h-8 rounded-full bg-[#f2f4f6] text-[#9b2f00] flex items-center justify-center hover:bg-[#e0e3e5] transition-colors cursor-pointer"
                title="عكس العملات"
              >
                <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">العملة المقابلة</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
                className="w-full px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-bold text-[#191c1e] border-none outline-none"
              >
                <option value="LBP">LBP (ليرة لبنانية)</option>
                <option value="USD">USD (دولار أمريكي)</option>
              </select>
            </div>

            <div className="bg-[#fff8e1] p-3.5 rounded-xl border border-[#ffe082] mt-4 text-center">
              <span className="text-xs text-[#684000] block mb-1">النتيجة المقابلة:</span>
              <p className="text-xl font-black text-[#9b2f00]">
                {convertCurrency(calcAmount, fromCurrency, toCurrency)} {toCurrency === 'USD' ? '$' : 'ل.ل.'}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#e1bfb5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#191c1e]">سجل الحركات المالية المعتمد</h2>
                <p className="text-xs text-[#747779]">سندات الصرف والقبض والمكافآت (بالدولار والليرة)</p>
              </div>

              <div className="flex bg-[#f2f4f6] p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-white text-[#9b2f00] shadow-xs' : 'text-[#59413a]'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === 'income' ? 'bg-white text-emerald-800 shadow-xs' : 'text-[#59413a]'
                  }`}
                >
                  الوارد (+)
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === 'expense' ? 'bg-white text-red-800 shadow-xs' : 'text-[#59413a]'
                  }`}
                >
                  المنصرف (-)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">البيان</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">المبلغ ($)</th>
                    <th className="py-3 px-4">المبلغ (ل.ل.)</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#f2f4f6]/50">
                      <td className="py-3 px-4 text-[#747779] whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-4 font-semibold text-[#191c1e]">{tx.description}</td>
                      <td className="py-3 px-4">
                        <span className="bg-[#f2f4f6] text-[#59413a] px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 font-black text-sm whitespace-nowrap ${
                          tx.amountUSD > 0 ? 'text-emerald-700' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {tx.amountUSD > 0 ? `+$${tx.amountUSD}` : `-$${Math.abs(tx.amountUSD)}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#59413a] whitespace-nowrap">
                        {tx.amountUSD > 0 ? '+' : '-'}
                        {(Math.abs(tx.amountUSD) * exchangeRate).toLocaleString()} ل.ل.
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
