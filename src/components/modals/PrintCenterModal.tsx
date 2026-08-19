import React, { useState } from 'react';
import { DatabaseSchema, Student, AcademicCircle, Teacher, Donation } from '../../types';
import { CENTER_LOGO } from '../Sidebar';

interface PrintCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseSchema;
  defaultDocType?: string;
  customData?: any;
}

export const PrintCenterModal: React.FC<PrintCenterModalProps> = ({
  isOpen,
  onClose,
  db,
  defaultDocType = 'student_roster',
  customData,
}) => {
  const [docType, setDocType] = useState<string>(defaultDocType);
  const [selectedBranch, setSelectedBranch] = useState<string>(
    customData?.branchName || 'all'
  );
  const [selectedCircleId, setSelectedCircleId] = useState<string>('all');
  const [selectedDonationId, setSelectedDonationId] = useState<string>(
    customData?.donationId || db.donations?.[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentExchangeRate = db?.exchangeRate?.usdToLbp || 89500;

  // Filter students based on branch / circle
  const filteredStudents: Student[] = (db.students || []).filter((s) => {
    const matchBranch = selectedBranch === 'all' || s.branch === selectedBranch;
    const matchCircle = selectedCircleId === 'all' || s.circleId === selectedCircleId;
    return matchBranch && matchCircle;
  });

  const selectedCircle: AcademicCircle | undefined = (db.circles || []).find(
    (c) => c.id === selectedCircleId
  );

  const selectedDonation: Donation | undefined = (db.donations || []).find(
    (d) => d.id === selectedDonationId
  );

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#e1bfb5] overflow-hidden"
        dir="rtl"
      >
        {/* Header (Hidden during actual print) */}
        <div className="p-4 sm:p-5 border-b border-[#e1bfb5] bg-[#f7f9fb] flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9b2f00] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">print</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">
                مركز الطباعة والكشوفات المعتمدة
              </h2>
              <p className="text-xs text-[#747779]">
                طباعة التقارير، السندات المالية (بالدولار والليرة اللبنانية)، وكشوفات الطلاب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>تنفيذ الطباعة الفورية</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#747779] hover:bg-[#e0e3e5] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Hidden during print) */}
        <div className="p-3 sm:px-6 bg-white border-b border-[#e1bfb5]/60 flex flex-wrap items-center gap-3 no-print text-xs">
          <div>
            <label className="font-bold text-[#59413a] ml-1.5">نوع المستند:</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] font-semibold text-[#191c1e] outline-none"
            >
              <option value="student_roster">كشف الطلاب العام</option>
              <option value="circle_attendance">كشف وسجل متابعة الحلقة</option>
              <option value="donation_receipt">سند قبض وتبرع رسمي ($ ول.ل.)</option>
              <option value="salary_sheet">كشف مكافآت ورواتب المعلمين</option>
              <option value="financial_statement">التقرير المالي والميزانية</option>
              <option value="branches_catalog">دليل الفروع والحلقات</option>
            </select>
          </div>

          {(docType === 'student_roster' || docType === 'circle_attendance') && (
            <div>
              <label className="font-bold text-[#59413a] ml-1.5">الفرع:</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedCircleId('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] font-semibold text-[#191c1e] outline-none"
              >
                <option value="all">جميع الفروع</option>
                {db.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {docType === 'circle_attendance' && (
            <div>
              <label className="font-bold text-[#59413a] ml-1.5">الحلقة:</label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] font-semibold text-[#191c1e] outline-none"
              >
                <option value="all">كل الحلقات</option>
                {(db.circles || [])
                  .filter((c) => selectedBranch === 'all' || c.branch === selectedBranch)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      حلقة {c.number}: {c.name} ({c.teacherName})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {docType === 'donation_receipt' && (
            <div>
              <label className="font-bold text-[#59413a] ml-1.5">اختر التبرع:</label>
              <select
                value={selectedDonationId}
                onChange={(e) => setSelectedDonationId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] font-semibold text-[#191c1e] outline-none"
              >
                {(db.donations || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.receiptNumber} - {d.donorName} (${d.amountUSD})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Printable Paper Area (Shown on screen and printed exactly) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#8e9193]/10 flex justify-center">
          <div className="printable-document bg-white w-full max-w-3xl p-8 rounded-xl shadow-md text-[#191c1e] border border-[#e1bfb5]/60 min-h-[700px] flex flex-col justify-between">
            {/* 1. Official Header */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#855300] pb-4 mb-6">
                <div className="text-right">
                  <h1 className="text-xl font-bold text-[#855300] tracking-tight leading-tight">
                    مركز زاد الرحيل لتعليم القرآن الكريم
                  </h1>
                  <p className="text-xs font-semibold text-[#59413a]">
                    الجمهورية اللبنانية - الفروع المعتمدة
                  </p>
                  <p className="text-[11px] text-[#747779] mt-0.5">
                    هاتف: +961 70 123 456 | البريد: info@zadarraheel.edu
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={CENTER_LOGO}
                    alt="شعار المركز"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#855300] shadow-xs mx-auto mb-1"
                  />
                  <span className="text-[10px] font-bold text-[#855300] block">وثيقة رسمية</span>
                </div>

                <div className="text-left text-xs font-mono text-[#59413a]">
                  <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>الرقم الإشاري: ZR-{Math.floor(1000 + Math.random() * 9000)}</p>
                  <p className="text-[10px] text-[#747779]">
                    1 USD = {currentExchangeRate.toLocaleString()} LBP
                  </p>
                </div>
              </div>

              {/* 2. Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-[#191c1e] bg-[#f7f9fb] inline-block px-6 py-1.5 rounded-full border border-[#e1bfb5]">
                  {docType === 'student_roster' && 'كشف الطلاب المسجلين المعتمد'}
                  {docType === 'circle_attendance' &&
                    `سجل متابعة وحضور: ${selectedCircle?.name || 'جميع الحلقات'}`}
                  {docType === 'donation_receipt' && 'سند قبض وتبرع مالي رسمي'}
                  {docType === 'salary_sheet' && 'كشف صرف مكافآت الهيئة التعليمية'}
                  {docType === 'financial_statement' && 'التقرير المالي والميزانية الختامية'}
                  {docType === 'branches_catalog' && 'دليل الفروع والبيانات المرجعية'}
                </h2>
                {selectedBranch !== 'all' && (
                  <p className="text-xs text-[#747779] mt-1 font-semibold">
                    الفرع: {selectedBranch}
                  </p>
                )}
              </div>

              {/* 3. Document Content Switching */}

              {/* A. STUDENT ROSTER */}
              {docType === 'student_roster' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-[#59413a] mb-2">
                    <span>إجمالي الطلاب في الكشف: {filteredStudents.length} طالباً</span>
                    <span>الفروع: {selectedBranch === 'all' ? 'كافة الفروع' : selectedBranch}</span>
                  </div>
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f6] text-[#191c1e] border-y border-[#333]">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-3">اسم الطالب / الطالبة</th>
                        <th className="py-2 px-2">العمر</th>
                        <th className="py-2 px-2">الصف</th>
                        <th className="py-2 px-3">الفرع</th>
                        <th className="py-2 px-3">الحلقة المسندة</th>
                        <th className="py-2 px-2">الفئة</th>
                        <th className="py-2 px-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc]">
                      {filteredStudents.map((s, idx) => (
                        <tr key={s.id}>
                          <td className="py-2 px-2 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold">{s.name}</td>
                          <td className="py-2 px-2 font-mono">{s.age || '-'}</td>
                          <td className="py-2 px-2">{s.grade || '-'}</td>
                          <td className="py-2 px-3">{s.branch}</td>
                          <td className="py-2 px-3">{s.circleName}</td>
                          <td className="py-2 px-2">{s.gender}</td>
                          <td className="py-2 px-2 font-semibold">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* B. CIRCLE ATTENDANCE SHEET */}
              {docType === 'circle_attendance' && (
                <div className="space-y-4">
                  {selectedCircle && (
                    <div className="grid grid-cols-3 gap-2 bg-[#f7f9fb] p-3 rounded-lg border border-[#ccc] text-xs font-semibold mb-3">
                      <div>المعلم: {selectedCircle.teacherName}</div>
                      <div>المواعيد: {selectedCircle.days} ({selectedCircle.timeSlot})</div>
                      <div>القاعة: {selectedCircle.room}</div>
                    </div>
                  )}
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f6] text-[#191c1e] border-y border-[#333]">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-4">اسم الطالب</th>
                        <th className="py-2 px-2">الصف</th>
                        <th className="py-2 px-2 text-center">السبت</th>
                        <th className="py-2 px-2 text-center">الأحد</th>
                        <th className="py-2 px-2 text-center">الإثنين</th>
                        <th className="py-2 px-2 text-center">الثلاثاء</th>
                        <th className="py-2 px-2 text-center">الأربعاء</th>
                        <th className="py-2 px-2 text-center">الخميس</th>
                        <th className="py-2 px-4">ملاحظات الحفظ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc]">
                      {filteredStudents.map((s, idx) => (
                        <tr key={s.id}>
                          <td className="py-2 px-2 font-mono">{idx + 1}</td>
                          <td className="py-2 px-4 font-bold">{s.name}</td>
                          <td className="py-2 px-2">{s.grade || '-'}</td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-2 text-center border-x border-[#eee]"></td>
                          <td className="py-2 px-4 border-l border-[#eee]"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* C. DONATION RECEIPT */}
              {docType === 'donation_receipt' && selectedDonation && (
                <div className="p-6 border-2 border-[#855300] rounded-2xl bg-[#fffdfa] space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e1bfb5]">
                    <div>
                      <span className="text-xs text-[#747779] block">رقم سند القبض:</span>
                      <span className="text-base font-black font-mono text-[#9b2f00]">
                        {selectedDonation.receiptNumber}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-[#747779] block">التاريخ:</span>
                      <span className="text-xs font-bold text-[#191c1e]">
                        {selectedDonation.date}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#747779] block">وصلنا من الأخ / الأخت:</span>
                      <span className="text-sm font-bold text-[#191c1e] mt-0.5 block">
                        {selectedDonation.donorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#747779] block">مصرف التبرع / الكفالة:</span>
                      <span className="text-sm font-bold text-[#855300] mt-0.5 block">
                        {selectedDonation.category}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#f2f4f6] p-4 rounded-xl border border-[#e1bfb5] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#747779] block">المبلغ بالدولار الأمريكي ($):</span>
                      <span className="text-2xl font-black text-emerald-800">
                        ${selectedDonation.amountUSD.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-[#747779] block">المقابل بالليرة اللبنانية:</span>
                      <span className="text-lg font-black font-mono text-[#9b2f00]">
                        {(
                          selectedDonation.amountLBP ||
                          selectedDonation.amountUSD * currentExchangeRate
                        ).toLocaleString()}{' '}
                        ل.ل.
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#59413a] space-y-1">
                    <p>• طريقة الدفع: <span className="font-bold">{selectedDonation.paymentMethod}</span></p>
                    {selectedDonation.notes && (
                      <p>• البيان والملاحظات: <span className="font-medium">{selectedDonation.notes}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* D. SALARY & REWARDS SHEET */}
              {docType === 'salary_sheet' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-[#59413a]">
                    <span>عدد المعلمين: {(db.teachers || []).length}</span>
                    <span>سعر الصرف المعتمد: {currentExchangeRate.toLocaleString()} ل.ل./$</span>
                  </div>
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f6] text-[#191c1e] border-y border-[#333]">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-4">اسم المعلم / المعلمة</th>
                        <th className="py-2 px-3">الفرع</th>
                        <th className="py-2 px-3">التخصص</th>
                        <th className="py-2 px-2 text-center">الحلقات</th>
                        <th className="py-2 px-3">المكافأة ($)</th>
                        <th className="py-2 px-3">المكافأة (ل.ل.)</th>
                        <th className="py-2 px-4 text-center">التوقيع بالاستلام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc]">
                      {(db.teachers || []).map((t, idx) => (
                        <tr key={t.id}>
                          <td className="py-2 px-2 font-mono">{idx + 1}</td>
                          <td className="py-2 px-4 font-bold">{t.name}</td>
                          <td className="py-2 px-3">{t.branch}</td>
                          <td className="py-2 px-3">{t.specialization}</td>
                          <td className="py-2 px-2 text-center font-bold">{t.circlesCount}</td>
                          <td className="py-2 px-3 font-bold text-emerald-800">${t.salaryUSD || 140}</td>
                          <td className="py-2 px-3 font-mono">
                            {((t.salaryUSD || 140) * currentExchangeRate).toLocaleString()} ل.ل.
                          </td>
                          <td className="py-2 px-4 text-center border-l border-[#eee]"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* E. FINANCIAL STATEMENT */}
              {docType === 'financial_statement' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs bg-[#f7f9fb] p-4 rounded-xl border border-[#e1bfb5]">
                    <div>
                      <span className="text-[#747779] block">إجمالي الوارد والتبرعات ($):</span>
                      <span className="text-lg font-black text-emerald-800">
                        $
                        {(db.transactions || [])
                          .filter((t) => t.amountUSD > 0)
                          .reduce((a, b) => a + b.amountUSD, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#747779] block">إجمالي المصروفات والتشغيل ($):</span>
                      <span className="text-lg font-black text-[#ba1a1a]">
                        $
                        {Math.abs(
                          (db.transactions || [])
                            .filter((t) => t.amountUSD < 0)
                            .reduce((a, b) => a + b.amountUSD, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f6] text-[#191c1e] border-y border-[#333]">
                        <th className="py-2 px-3">التاريخ</th>
                        <th className="py-2 px-4">البيان</th>
                        <th className="py-2 px-3">التصنيف</th>
                        <th className="py-2 px-3">المبلغ ($)</th>
                        <th className="py-2 px-3">المبلغ (ل.ل.)</th>
                        <th className="py-2 px-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ccc]">
                      {(db.transactions || []).map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-3 font-mono">{tx.date}</td>
                          <td className="py-2 px-4 font-bold">{tx.description}</td>
                          <td className="py-2 px-3">{tx.category}</td>
                          <td
                            className={`py-2 px-3 font-black ${
                              tx.amountUSD > 0 ? 'text-emerald-800' : 'text-red-700'
                            }`}
                          >
                            {tx.amountUSD > 0 ? `+$${tx.amountUSD}` : `-$${Math.abs(tx.amountUSD)}`}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {tx.amountUSD > 0 ? '+' : '-'}
                            {(Math.abs(tx.amountUSD) * currentExchangeRate).toLocaleString()} ل.ل.
                          </td>
                          <td className="py-2 px-2">{tx.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Official Signatures and Stamp */}
            <div className="pt-8 border-t-2 border-[#855300] mt-8">
              <div className="grid grid-cols-3 text-center text-xs">
                <div>
                  <p className="font-bold text-[#59413a] mb-8">أمين الصندوق والمحاسب</p>
                  <p className="font-semibold text-[#191c1e]">الأستاذ رامي النجار</p>
                  <p className="text-[10px] text-[#747779]">التوقيع: .....................</p>
                </div>

                <div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#855300] mx-auto flex items-center justify-center p-1 text-[10px] font-bold text-[#855300] print-stamp">
                    ختم المركز المعتمد
                  </div>
                </div>

                <div>
                  <p className="font-bold text-[#59413a] mb-8">مدير عام المركز</p>
                  <p className="font-semibold text-[#191c1e]">الشيخ أحمد عبدالله</p>
                  <p className="text-[10px] text-[#747779]">التوقيع: .....................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
