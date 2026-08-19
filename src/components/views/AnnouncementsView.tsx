import React, { useState } from 'react';
import { Announcement } from '../../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onAddAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<Announcement['target']>('الكل');
  const [pinned, setPinned] = useState(false);

  const filtered = announcements.filter((a) => {
    if (filter === 'all') return true;
    return a.target === filter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('يرجى كتابة العنوان ومحتوى الإعلان');
      return;
    }

    onAddAnnouncement({
      title,
      content,
      date: 'الآن',
      author: 'أحمد عبدالله (مدير النظام)',
      target,
      pinned,
    });

    onShowToast(`تم نشر الإعلان "${title}" وتوجيهه إلى (${target}) بنجاح`);
    setIsAdding(false);
    setTitle('');
    setContent('');
    setPinned(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            لوحة الإعلانات والتعاميم الرسمية
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            نشر التنبيهات، مواعيد الاختبارات، والرسائل الموجهة لأولياء الأمور والطلاب والمعلمين
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#f2f4f6] p-1 rounded-xl flex text-xs font-bold">
            {['all', 'الكل', 'أولياء الأمور', 'الطلاب', 'المعلمون'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === f ? 'bg-white text-[#9b2f00] shadow-xs' : 'text-[#59413a]'
                }`}
              >
                {f === 'all' ? 'كافة التعاميم' : f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>نشر إعلان جديد</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white p-6 rounded-2xl border shadow-xs transition-all ${
              ann.pinned ? 'border-[#fea619] bg-[#fffdfa]' : 'border-[#e1bfb5]'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {ann.pinned && (
                  <span className="bg-[#fea619] text-[#684000] text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">push_pin</span>
                    <span>مثبت في الأعلى</span>
                  </span>
                )}
                <span className="bg-[#f2f4f6] text-[#59413a] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  الفئة المستهدفة: {ann.target}
                </span>
                <span className="text-[11px] text-[#747779]">• {ann.date}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onShowToast(`تم إرسال إشعار SMS لجميع المستهدفين (${ann.target})`)}
                  title="إرسال رسالة SMS للمستهدفين"
                  className="p-1.5 text-[#59413a] hover:text-[#9b2f00] rounded-lg hover:bg-[#f2f4f6]"
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('حذف هذا الإعلان؟')) {
                      onDeleteAnnouncement(ann.id);
                    }
                  }}
                  title="حذف"
                  className="p-1.5 text-[#747779] hover:text-[#ba1a1a] rounded-lg hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#191c1e] mb-2">{ann.title}</h3>
            <p className="text-sm text-[#59413a] leading-relaxed mb-4">{ann.content}</p>

            <div className="pt-3 border-t border-[#e1bfb5]/40 flex items-center justify-between text-xs text-[#747779]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span>الناشر: {ann.author}</span>
              </span>
              <span className="font-semibold text-emerald-700">تم التسليم لكافة المسجلين ✓</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden p-6" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1bfb5] mb-4">
              <h3 className="text-lg font-bold text-[#191c1e]">نشر إعلان / تعميم جديد</h3>
              <button onClick={() => setIsAdding(false)} className="text-[#747779]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#59413a] mb-1">عنوان التعميم *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: موعد اختبارات حفظ الجزء العاشر..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#59413a] mb-1">الجمهور المستهدف</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-xs font-semibold text-[#191c1e] outline-none"
                  >
                    <option value="الكل">كافة منسوبي المركز</option>
                    <option value="أولياء الأمور">أولياء الأمور فقط</option>
                    <option value="الطلاب">الطلاب فقط</option>
                    <option value="المعلمون">المعلمون والمشرفون</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#191c1e] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9b2f00] accent-[#9b2f00]"
                    />
                    <span>تثبيت في أعلى اللوحة</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#59413a] mb-1">نص التعميم والبيان *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب نص الإعلان بالتفصيل..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e1bfb5]/40">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#59413a]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  نشر الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
