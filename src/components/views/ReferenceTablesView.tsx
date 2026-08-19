import React, { useState, useMemo } from 'react';
import {
  BranchRef,
  GradeRef,
  CurriculumTrackRef,
  DonationCategoryRef,
  ExpenseItemRef,
  Teacher,
  AcademicCircle,
  ExchangeRateConfig,
  DatabaseSchema,
} from '../../types';
import { FULL_INITIAL_DATABASE } from '../../data/dbData';
import { EditReferenceModal, ReferenceItemType } from '../modals/EditReferenceModal';

interface ReferenceTablesViewProps {
  db?: DatabaseSchema;
  database?: DatabaseSchema;
  onUpdateDb?: (updater: (prev: DatabaseSchema) => DatabaseSchema) => void;
  onUpdateDatabase?: (updater: (prev: DatabaseSchema) => DatabaseSchema) => void;
  onShowToast: (msg: string) => void;
  onOpenPrintModal: (docType: string, customData?: any) => void;
}

type RefTab =
  | 'branches'
  | 'teachers'
  | 'circles'
  | 'grades'
  | 'curriculum'
  | 'donations'
  | 'expenses'
  | 'currencies';

export const ReferenceTablesView: React.FC<ReferenceTablesViewProps> = ({
  db,
  database,
  onUpdateDb,
  onUpdateDatabase,
  onShowToast,
  onOpenPrintModal,
}) => {
  const safeDb: DatabaseSchema = db || database || FULL_INITIAL_DATABASE;
  const updateDbHandler = onUpdateDb || onUpdateDatabase || (() => {});

  const [activeSubTab, setActiveSubTab] = useState<RefTab>('branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Modal State for Add/Edit Reference Item
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ReferenceItemType;
    item: any | null;
  }>({
    isOpen: false,
    type: 'branch',
    item: null,
  });

  // Exchange rate live update state
  const [rateInput, setRateInput] = useState<number>(safeDb?.exchangeRate?.usdToLbp || 89500);

  const subTabs: { id: RefTab; label: string; icon: string; count?: number }[] = [
    { id: 'branches', label: 'دليل الفروع', icon: 'account_tree', count: safeDb.branchesRef?.length || 4 },
    { id: 'teachers', label: 'كادر المعلمين', icon: 'badge', count: safeDb.teachers?.length || 30 },
    { id: 'circles', label: 'الحلقات القرآنية', icon: 'school', count: safeDb.circles?.length || 32 },
    { id: 'grades', label: 'المراحل والصفوف', icon: 'auto_stories', count: safeDb.gradesRef?.length || 10 },
    { id: 'curriculum', label: 'المسارات والمناهج', icon: 'menu_book', count: safeDb.curriculumTracksRef?.length || 4 },
    { id: 'donations', label: 'فئات التبرعات', icon: 'volunteer_activism', count: safeDb.donationCategoriesRef?.length || 5 },
    { id: 'expenses', label: 'بنود المصروفات', icon: 'receipt_long', count: safeDb.expenseItemsRef?.length || 5 },
    { id: 'currencies', label: 'العملات والصرف', icon: 'currency_exchange', count: 2 },
  ];

  // Open Modal for Creating New Item
  const handleAddNew = (type: ReferenceItemType) => {
    setModalState({
      isOpen: true,
      type,
      item: null,
    });
  };

  // Open Modal for Editing Item
  const handleEditItem = (type: ReferenceItemType, item: any) => {
    setModalState({
      isOpen: true,
      type,
      item,
    });
  };

  // Handle Save from Modal
  const handleSaveItem = (type: ReferenceItemType, savedItem: any, isNew: boolean) => {
    updateDbHandler((prev) => {
      const updated = { ...prev };

      switch (type) {
        case 'branch': {
          const currentBranches = [...(updated.branchesRef || [])];
          if (isNew) {
            updated.branchesRef = [savedItem, ...currentBranches];
          } else {
            updated.branchesRef = currentBranches.map((b) => (b.id === savedItem.id ? savedItem : b));
          }
          // Sync branches string list
          const branchNames = (updated.branchesRef || []).map((b) => b.name);
          updated.branches = Array.from(new Set(branchNames));
          break;
        }
        case 'teacher': {
          const currentTeachers = [...(updated.teachers || [])];
          if (isNew) {
            updated.teachers = [savedItem, ...currentTeachers];
          } else {
            updated.teachers = currentTeachers.map((t) => (t.id === savedItem.id ? savedItem : t));
          }
          break;
        }
        case 'circle': {
          const currentCircles = [...(updated.circles || [])];
          if (isNew) {
            updated.circles = [savedItem, ...currentCircles];
          } else {
            updated.circles = currentCircles.map((c) => (c.id === savedItem.id ? savedItem : c));
          }
          break;
        }
        case 'grade': {
          const currentGrades = [...(updated.gradesRef || [])];
          if (isNew) {
            updated.gradesRef = [savedItem, ...currentGrades];
          } else {
            updated.gradesRef = currentGrades.map((g) => (g.id === savedItem.id ? savedItem : g));
          }
          // Sync grades string list
          updated.grades = Array.from(new Set((updated.gradesRef || []).map((g) => g.name)));
          break;
        }
        case 'curriculum': {
          const currentCur = [...(updated.curriculumTracksRef || [])];
          if (isNew) {
            updated.curriculumTracksRef = [savedItem, ...currentCur];
          } else {
            updated.curriculumTracksRef = currentCur.map((c) => (c.id === savedItem.id ? savedItem : c));
          }
          break;
        }
        case 'donation': {
          const currentCats = [...(updated.donationCategoriesRef || [])];
          if (isNew) {
            updated.donationCategoriesRef = [savedItem, ...currentCats];
          } else {
            updated.donationCategoriesRef = currentCats.map((c) => (c.id === savedItem.id ? savedItem : c));
          }
          break;
        }
        case 'expense': {
          const currentExp = [...(updated.expenseItemsRef || [])];
          if (isNew) {
            updated.expenseItemsRef = [savedItem, ...currentExp];
          } else {
            updated.expenseItemsRef = currentExp.map((e) => (e.id === savedItem.id ? savedItem : e));
          }
          break;
        }
      }

      return updated;
    });

    onShowToast(isNew ? 'تمت إضافة العنصر المرجعي بنجاح وحفظه' : 'تم حفظ التعديلات وتحديث قاعدة البيانات');
  };

  // Handle Delete Item
  const handleDeleteItem = (type: ReferenceItemType, itemId: string, itemName: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف "${itemName}" من الجدول المرجعي؟`)) {
      return;
    }

    updateDbHandler((prev) => {
      const updated = { ...prev };

      switch (type) {
        case 'branch':
          updated.branchesRef = (updated.branchesRef || []).filter((b) => b.id !== itemId);
          updated.branches = Array.from(new Set((updated.branchesRef || []).map((b) => b.name)));
          break;
        case 'teacher':
          updated.teachers = (updated.teachers || []).filter((t) => t.id !== itemId);
          break;
        case 'circle':
          updated.circles = (updated.circles || []).filter((c) => c.id !== itemId);
          break;
        case 'grade':
          updated.gradesRef = (updated.gradesRef || []).filter((g) => g.id !== itemId);
          updated.grades = Array.from(new Set((updated.gradesRef || []).map((g) => g.name)));
          break;
        case 'curriculum':
          updated.curriculumTracksRef = (updated.curriculumTracksRef || []).filter((c) => c.id !== itemId);
          break;
        case 'donation':
          updated.donationCategoriesRef = (updated.donationCategoriesRef || []).filter((c) => c.id !== itemId);
          break;
        case 'expense':
          updated.expenseItemsRef = (updated.expenseItemsRef || []).filter((e) => e.id !== itemId);
          break;
      }

      return updated;
    });

    onShowToast(`تم حذف "${itemName}" من السجلات المرجعية`);
  };

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return (safeDb.teachers || []).filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery);
      const matchBranch = selectedBranchFilter === 'all' || t.branch === selectedBranchFilter;
      return matchSearch && matchBranch;
    });
  }, [safeDb.teachers, searchQuery, selectedBranchFilter]);

  // Filtered circles
  const filteredCircles = useMemo(() => {
    return (safeDb.circles || []).filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.number.toString().includes(searchQuery);
      const matchBranch = selectedBranchFilter === 'all' || c.branch === selectedBranchFilter;
      return matchSearch && matchBranch;
    });
  }, [safeDb.circles, searchQuery, selectedBranchFilter]);

  const handleUpdateExchangeRate = () => {
    if (!rateInput || rateInput <= 0) {
      onShowToast('يرجى إدخال سعر صرف صالح');
      return;
    }
    updateDbHandler((prev) => ({
      ...prev,
      exchangeRate: {
        usdToLbp: rateInput,
        lastUpdated: new Date().toLocaleDateString('ar-EG'),
        source: 'سعر الصرف المعتمد والمحدث يدوياً من إدارة المركز',
      },
    }));
    onShowToast(`تم تحديث سعر صرف الدولار مقابل الليرة: ${rateInput.toLocaleString()} ل.ل.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#fea619]/20 text-[#855300] font-bold text-xs">
              Reference Tables
            </span>
            <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
              جداول البيانات المرجعية وإدارتها
            </h1>
          </div>
          <p className="text-xs text-[#59413a] mt-1">
            إضافة وتعديل وحذف السجلات المرجعية: الفروع، المعلمين، الحلقات، الصفوف، المناهج، الكفالات، النفقات، والعملات المعتمدة ($ وليرة لبنانية)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenPrintModal('reference_table', { tab: activeSubTab })}
            className="px-3.5 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>طباعة الجدول الحالي</span>
          </button>

          <button
            onClick={() => {
              const dataStr = JSON.stringify(safeDb, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `zad_alraheel_reference_data_${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              onShowToast('تم تصدير ملف البيانات المرجعية بنجاح');
            }}
            className="px-3.5 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>تصدير JSON</span>
          </button>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="bg-white p-2 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#fea619] text-[#684000] shadow-xs'
                  : 'text-[#59413a] hover:bg-[#f2f4f6]'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'fill' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-[#9b2f00] text-white' : 'bg-[#e1bfb5]/50 text-[#59413a]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. BRANCHES REFERENCE TABLE */}
      {activeSubTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e1bfb5]">
            <div>
              <h2 className="font-bold text-base text-[#191c1e]">دليل الفروع المعتمدة ومقراتها</h2>
              <p className="text-xs text-[#747779]">عدد الفروع: {safeDb.branchesRef?.length || 0} فروع</p>
            </div>
            <button
              onClick={() => handleAddNew('branch')}
              className="px-4 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(safeDb.branchesRef || []).map((br) => (
              <div
                key={br.id}
                className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs hover:border-[#fea619] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#9b2f00] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[22px]">location_on</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#191c1e]">{br.name}</h3>
                        <p className="text-xs text-[#747779]">{br.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditItem('branch', br)}
                        title="تعديل بيانات الفرع"
                        className="w-8 h-8 rounded-lg bg-[#f2f4f6] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem('branch', br.id, br.name)}
                        title="حذف الفرع"
                        className="w-8 h-8 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                      <span className="px-2.5 py-1 bg-amber-50 text-[#855300] rounded-full text-xs font-bold border border-amber-200">
                        طاقة: {br.capacity} طالب
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f9fb] p-3 rounded-xl mb-3 border border-[#e1bfb5]/40">
                    <div>
                      <span className="text-[#747779] block text-[11px]">المشرف العام:</span>
                      <span className="font-bold text-[#191c1e]">{br.supervisor}</span>
                    </div>
                    <div>
                      <span className="text-[#747779] block text-[11px]">هاتف التواصل:</span>
                      <span className="font-mono text-[#59413a]">{br.phone}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#747779] block text-[11px]">عدد الحلقات:</span>
                      <span className="font-black text-[#9b2f00]">{br.circlesCount} حلقة</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#747779] block text-[11px]">الطلاب المسجلون:</span>
                      <span className="font-black text-emerald-800">{br.studentsCount} طالب</span>
                    </div>
                  </div>

                  {br.notes && (
                    <p className="text-xs text-[#59413a] leading-relaxed mb-4">{br.notes}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#e1bfb5]/40 flex items-center justify-between">
                  <button
                    onClick={() => onOpenPrintModal('branch_students', { branchName: br.name })}
                    className="text-xs font-bold text-[#9b2f00] hover:text-[#c2410c] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>طباعة كشف طلاب الفرع</span>
                  </button>
                  <span className="text-[11px] text-[#747779]">معتمد رسمياً</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TEACHERS & FACULTY REFERENCE TABLE */}
      {activeSubTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e1bfb5] flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم المعلم، التخصص، أو رقم الهاتف..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#f2f4f6] text-xs text-[#191c1e] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[18px]">
                  search
                </span>
              </div>

              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none"
              >
                <option value="all">جميع الفروع ({safeDb.teachers?.length || 0} معلماً)</option>
                {safeDb.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAddNew('teacher')}
                className="px-3.5 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>إضافة معلم جديد</span>
              </button>
              <div className="text-xs text-[#747779]">
                إجمالي الكادر: <span className="font-bold text-[#191c1e]">{filteredTeachers.length}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">اسم المعلم / المعلمة</th>
                  <th className="py-3.5 px-4">الفرع المسند</th>
                  <th className="py-3.5 px-4">التخصص والمسار</th>
                  <th className="py-3.5 px-4">رقم التواصل</th>
                  <th className="py-3.5 px-4">الحلقات</th>
                  <th className="py-3.5 px-4">المكافأة ($)</th>
                  <th className="py-3.5 px-4">المكافأة (ل.ل.)</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
                {filteredTeachers.map((t, index) => (
                  <tr key={t.id} className="hover:bg-[#f2f4f6]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#747779]">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#fea619]/20 text-[#855300] flex items-center justify-center font-bold text-[10px]">
                        {t.name.charAt(0)}
                      </span>
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#59413a]">{t.branch}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[#f2f4f6] text-[#59413a] px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {t.specialization}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#747779]">{t.phone}</td>
                    <td className="py-3 px-4 font-bold text-[#9b2f00]">{t.circlesCount} حلقة</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      ${t.salaryUSD || 140}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#59413a]">
                      {((t.salaryUSD || 140) * (safeDb.exchangeRate?.usdToLbp || 89500)).toLocaleString()} ل.ل.
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditItem('teacher', t)}
                          title="تعديل بيانات المعلم"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem('teacher', t.id, t.name)}
                          title="حذف المعلم"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CIRCLES REFERENCE TABLE */}
      {activeSubTab === 'circles' && (
        <div className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e1bfb5] flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم أو اسم الحلقة أو المعلم..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#f2f4f6] text-xs text-[#191c1e] focus:bg-white focus:border-[#9b2f00] outline-none"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#747779] text-[18px]">
                  search
                </span>
              </div>

              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-xs font-semibold text-[#191c1e] border-none outline-none"
              >
                <option value="all">جميع الفروع ({safeDb.circles?.length || 0} حلقة)</option>
                {safeDb.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddNew('circle')}
                className="px-3.5 py-1.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة حلقة</span>
              </button>
              <button
                onClick={() => onOpenPrintModal('circles_roster')}
                className="px-3 py-1.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>طباعة الكشف</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                  <th className="py-3.5 px-4">رقم الحلقة</th>
                  <th className="py-3.5 px-4">اسم الحلقة</th>
                  <th className="py-3.5 px-4">الفرع</th>
                  <th className="py-3.5 px-4">المعلم / المحفظ</th>
                  <th className="py-3.5 px-4">المواعيد والأيام</th>
                  <th className="py-3.5 px-4">القاعة</th>
                  <th className="py-3.5 px-4">الطلاب المسجلون</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
                {filteredCircles.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f2f4f6]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#9b2f00]">حلقة {c.number}</td>
                    <td className="py-3 px-4 font-bold text-[#191c1e]">{c.name}</td>
                    <td className="py-3 px-4 text-[#59413a]">{c.branch}</td>
                    <td className="py-3 px-4 font-semibold text-[#191c1e]">{c.teacherName}</td>
                    <td className="py-3 px-4 text-[#59413a]">{c.timeSlot || c.time || 'عصراً'}</td>
                    <td className="py-3 px-4 text-[#747779]">{c.room}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {c.studentsCount} طالب
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditItem('circle', c)}
                          title="تعديل بيانات الحلقة"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem('circle', c.id, c.name)}
                          title="حذف الحلقة"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GRADES & ACADEMIC STAGES REFERENCE TABLE */}
      {activeSubTab === 'grades' && (
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">المراحل والصفوف الدراسية المعتمدة</h2>
              <p className="text-xs text-[#747779]">توزيع الفئات العمرية والمراحل الدراسية لطلاب المركز</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddNew('grade')}
                className="px-3.5 py-1.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة صف / مرحلة</span>
              </button>
              <button
                onClick={() => onOpenPrintModal('grades_table')}
                className="px-3 py-1.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>طباعة الكشف</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(safeDb.gradesRef || []).map((gr) => (
              <div
                key={gr.id}
                className="p-4 rounded-xl border border-[#e1bfb5]/70 bg-[#f7f9fb] flex items-center justify-between hover:border-[#fea619] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-[#855300] rounded-md font-bold text-[10px]">
                      {gr.stage}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#191c1e] mt-1">{gr.name}</h3>
                  <p className="text-xs text-[#747779]">العمر: {gr.targetAge}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-left">
                    <span className="text-xl font-black text-[#9b2f00]">{gr.studentsCount}</span>
                    <span className="text-[10px] text-[#747779] block">طالب مسجل</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditItem('grade', gr)}
                      title="تعديل الصف"
                      className="w-6 h-6 rounded bg-white border border-[#e1bfb5] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem('grade', gr.id, gr.name)}
                      title="حذف الصف"
                      className="w-6 h-6 rounded bg-white border border-[#e1bfb5] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CURRICULUM & TRACKS REFERENCE TABLE */}
      {activeSubTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e1bfb5]">
            <div>
              <h2 className="font-bold text-base text-[#191c1e]">المسارات والمناهج التعليمية</h2>
              <p className="text-xs text-[#747779]">المسارات المعتمدة للتحفيظ والتجويد والتأسيس</p>
            </div>
            <button
              onClick={() => handleAddNew('curriculum')}
              className="px-4 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>إضافة مسار تعليمي جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(safeDb.curriculumTracksRef || []).map((cur) => (
              <div
                key={cur.id}
                className="bg-white p-5 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col justify-between hover:border-[#fea619] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      {cur.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditItem('curriculum', cur)}
                        title="تعديل المسار"
                        className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem('curriculum', cur.id, cur.title)}
                        title="حذف المسار"
                        className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                      <span className="text-xs text-[#747779] font-mono mr-1">{cur.levelsCount} مستويات</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#191c1e] mb-2">{cur.title}</h3>
                  <p className="text-xs text-[#59413a] leading-relaxed mb-4">{cur.description}</p>
                </div>

                <div className="bg-[#f7f9fb] p-3.5 rounded-xl border border-[#e1bfb5]/40 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#747779]">الأجزاء المطلوبة:</span>
                    <span className="font-bold text-[#191c1e]">{cur.partsRequired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#747779]">الشهادة الممنوحة:</span>
                    <span className="font-bold text-[#9b2f00]">{cur.certificate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DONATIONS CATEGORIES REFERENCE TABLE */}
      {activeSubTab === 'donations' && (
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">أوجه الصرف وفئات التبرعات والكفالات</h2>
              <p className="text-xs text-[#747779]">تسعير الكفالات بالدولار الأمريكي ($) والليرة اللبنانية (ل.ل.)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddNew('donation')}
                className="px-3.5 py-1.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة فئة كفالة</span>
              </button>
              <button
                onClick={() => onOpenPrintModal('donation_catalog')}
                className="px-3 py-1.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>طباعة دليل الكفالات</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(safeDb.donationCategoriesRef || []).map((cat) => (
              <div
                key={cat.id}
                className="bg-[#f7f9fb] p-4 rounded-xl border border-[#e1bfb5]/60 flex flex-col justify-between hover:border-[#fea619] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isRecurring ? 'bg-amber-100 text-[#855300]' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cat.isRecurring ? 'كفالة دورية' : 'مساهمة مفتوحة'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditItem('donation', cat)}
                        title="تعديل فئة الكفالة"
                        className="w-6 h-6 rounded bg-white border border-[#e1bfb5] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem('donation', cat.id, cat.name)}
                        title="حذف فئة الكفالة"
                        className="w-6 h-6 rounded bg-white border border-[#e1bfb5] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-[#191c1e] mb-1">{cat.name}</h3>
                  <p className="text-xs text-[#59413a] leading-relaxed mb-3">{cat.description}</p>
                </div>

                <div className="pt-2 border-t border-[#e1bfb5]/40 flex items-baseline justify-between">
                  <span className="text-lg font-black text-emerald-800">${cat.targetUSD}</span>
                  <span className="text-xs font-mono text-[#59413a]">
                    {cat.targetLBP.toLocaleString()} ل.ل.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. EXPENSE ITEMS REFERENCE TABLE */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#191c1e]">بنود المصروفات التشغيلية المعتمدة</h2>
              <p className="text-xs text-[#747779]">تقديرات النفقات الشهرية بالفروع الأربعة بالدولار والليرة اللبنانية</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddNew('expense')}
                className="px-3.5 py-1.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة بند مصروف</span>
              </button>
              <button
                onClick={() => onOpenPrintModal('expense_budget')}
                className="px-3 py-1.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>طباعة الميزانية</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f7f9fb] text-[11px] font-bold text-[#747779] border-b border-[#e1bfb5]">
                  <th className="py-3 px-4">بند المصروف</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">المقدر شهرياً ($)</th>
                  <th className="py-3 px-4">المقدر شهرياً (ل.ل.)</th>
                  <th className="py-3 px-4">ملاحظات التشغيل</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1bfb5]/40 text-xs">
                {(safeDb.expenseItemsRef || []).map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#f2f4f6]/50">
                    <td className="py-3.5 px-4 font-bold text-[#191c1e]">{exp.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#f2f4f6] text-[#59413a] px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#ba1a1a]">${exp.estMonthlyUSD}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#59413a]">
                      {exp.estMonthlyLBP.toLocaleString()} ل.ل.
                    </td>
                    <td className="py-3.5 px-4 text-[#747779]">{exp.notes}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditItem('expense', exp)}
                          title="تعديل بند المصروف"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-[#fea619]/20 text-[#855300] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem('expense', exp.id, exp.name)}
                          title="حذف بند المصروف"
                          className="w-7 h-7 rounded-lg bg-[#f2f4f6] hover:bg-red-100 text-[#ba1a1a] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. CURRENCIES & EXCHANGE RATES REFERENCE TABLE */}
      {activeSubTab === 'currencies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">attach_money</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#191c1e]">العملات المعتمدة حصراً</h2>
                <p className="text-xs text-[#747779]">النظام يعتمد حصراً الدولار الأمريكي ($) والليرة اللبنانية (ل.ل.)</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block text-sm">الدولار الأمريكي (USD - $)</span>
                  <span className="text-xs text-emerald-700">العملة القياسية للميزانية والمكافآت والكفالات</span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-mono font-bold text-xs">
                  العملة الرئيسية
                </span>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#855300] block text-sm">الليرة اللبنانية (LBP - ل.ل.)</span>
                  <span className="text-xs text-[#855300]/80">عملة التداول المحلي وسندات القبض النقدية</span>
                </div>
                <span className="px-3 py-1 bg-[#fea619] text-[#684000] rounded-lg font-mono font-bold text-xs">
                  العملة المحلية
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Rate Setting Form */}
          <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#9b2f00] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">trending_up</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#191c1e]">سعر الصرف المعتمد</h2>
                <p className="text-xs text-[#747779]">تحديث سعر الدولار مقابل الليرة اللبنانية لجميع الحسابات</p>
              </div>
            </div>

            <div className="bg-[#f7f9fb] p-4 rounded-xl border border-[#e1bfb5]/40 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#59413a] mb-1.5">
                  سعر الصرف: 1 دولار أمريكي ($) =
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-[#e1bfb5] font-black text-lg text-[#9b2f00] outline-none focus:border-[#9b2f00]"
                  />
                  <span className="font-bold text-xs text-[#59413a]">ليرة لبنانية (LBP)</span>
                </div>
              </div>

              <div className="text-xs text-[#747779] space-y-1 pt-1">
                <p>• تاريخ آخر تعديل: <span className="font-bold text-[#191c1e]">{safeDb.exchangeRate?.lastUpdated || 'اليوم'}</span></p>
                <p>• المصدر: <span className="font-medium text-[#191c1e]">{safeDb.exchangeRate?.source}</span></p>
              </div>

              <button
                onClick={handleUpdateExchangeRate}
                className="w-full py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>حفظ وتحديث سعر الصرف لجميع الشاشات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Reference Item Modal */}
      <EditReferenceModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        item={modalState.item}
        db={safeDb}
        onSave={handleSaveItem}
        onShowToast={onShowToast}
      />
    </div>
  );
};

