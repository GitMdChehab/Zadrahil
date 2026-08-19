import React, { useState } from 'react';
import { Activity } from '../../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onShowToast: (msg: string) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'مدفوع' | 'مجاني'>('مدفوع');
  const [price, setPrice] = useState(100);
  const [dateRange, setDateRange] = useState('15 - 30 شعبان 1445');
  const [timeSlot, setTimeSlot] = useState('عصراً (4:00 - 6:00)');
  const [location, setLocation] = useState('القاعة الكبرى');
  const [capacity, setCapacity] = useState<string>('40');
  const [status, setStatus] = useState<Activity['status']>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة عنوان النشاط أو الدورة');
      return;
    }

    onAddActivity({
      title,
      description,
      type,
      price: type === 'مدفوع' ? Number(price) : undefined,
      dateRange,
      timeSlot,
      location,
      registeredCount: 0,
      capacity: capacity === 'مفتوح' ? 'مفتوح' : Number(capacity) || 30,
      paymentCollectedPercent: type === 'مدفوع' ? 0 : undefined,
      status,
      imageUrl:
        type === 'مدفوع'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC990q7KVSoZOh76WdhO7nFJCTzXaPBheJPnxS-cHqE06-KbWDhzHTtHqcaFKPhVP8nfg9XF87uy5w0iZcGt1eX2BK4kIkB73uEEkaaO8rVjeq2ePaJ6U8fGjHlilEsvjq3RJFZ5rxrLAm9v_UbRP7Wcyxd7pxM20gsHktuvOj5-4ts_HbMAhMxmuzA9ggmUNfyldeXQ-AVWzGQH7ooCTovQ4XK4yn70DQgewyC0aMURZ7huMvoHU68cg'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbLhDyWLDVoqzey7od43tTyDUpINvMp07Bmxw05Y6F7WUSpnaIz1EMN7AfPTvq9YMDq6Sj_pAYtnWMcfTWTW3B8PUhBQXcolYkaw1QQqTWLTnEVBu8ElcZS2Vxtb5gZ3dW8qmeNxEoH9vsFrogbIuJgQ_f5ANZtvohTIzxpHF2oY3EtYsw9-26W_a3tK1aYyvA-DZYYRtqQ4vDa4tpwBer3g2QU7EAnZbCzajY1r0ZhjkiMrEEN5hU0w',
    });

    onShowToast(`تم نشر النشاط "${title}" بنجاح`);
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
            <div className="w-10 h-10 rounded-xl bg-[#fea619]/20 text-[#9b2f00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">إضافة فعالية / دورة جديدة</h2>
              <p className="text-xs text-[#747779]">إنشاء نشاط تعليمي أو ترفيهي للطلاب والجمهور</p>
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
          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">عنوان الفعالية / الدورة *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: دورة أسرار الحفظ المتقن، المسابقة القرآنية الرمضانية..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#59413a] mb-1">الوصف والأهداف</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتوى الدورة والفئة المستهدفة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">نوع النشاط</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              >
                <option value="مدفوع">مدفوع (برسوم تسجيل)</option>
                <option value="مجاني">مجاني (عام بدون رسوم)</option>
              </select>
            </div>

            {type === 'مدفوع' ? (
              <div>
                <label className="block text-xs font-bold text-[#59413a] mb-1">رسوم التسجيل (ر.س)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm font-bold text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#59413a] mb-1">حالة القبول</label>
                <input
                  type="text"
                  disabled
                  value="متاح مجاناً للجميع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#e0e3e5] text-sm text-[#747779]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">التاريخ / الفترة</label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="15 - 30 شعبان 1445"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">التوقيت</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="عصراً (4:00 - 6:00)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">الموقع / القاعة</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="القاعة الكبرى - مبنى الفتيان"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59413a] mb-1">الطاقة الاستيعابية</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="40 أو اكتب 'مفتوح'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c9] bg-[#f7f9fb] text-sm text-[#191c1e] focus:border-[#9b2f00] focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e1bfb5]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#59413a] hover:bg-[#f2f4f6] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#9b2f00] hover:bg-[#c2410c] text-white shadow-sm transition-all"
            >
              نشر الفعالية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
