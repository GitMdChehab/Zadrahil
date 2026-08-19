import React, { useState } from 'react';
import { Activity } from '../../types';

interface ActivitiesViewProps {
  activities: Activity[];
  onOpenAddActivity: () => void;
  onShowToast: (msg: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  onOpenAddActivity,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const filteredActivities = activities.filter((a) => {
    if (filter === 'paid') return a.type === 'مدفوع';
    if (filter === 'free') return a.type === 'مجاني';
    return true;
  });

  const totalParticipants = activities.reduce((acc, a) => acc + a.registeredCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1bfb5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
            الفعاليات والدورات التربوية
          </h1>
          <p className="text-xs text-[#59413a] mt-0.5">
            إدارة الأنشطة والملتقيات والدورات الصيفية والربيعية والرحلات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#f2f4f6] p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-[#9b2f00] shadow-xs' : 'text-[#59413a]'
              }`}
            >
              الكل ({activities.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'paid' ? 'bg-white text-[#9b2f00] shadow-xs' : 'text-[#59413a]'
              }`}
            >
              الدورات المدفوعة
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'free' ? 'bg-white text-[#9b2f00] shadow-xs' : 'text-[#59413a]'
              }`}
            >
              الفعاليات العامة
            </button>
          </div>

          <button
            onClick={onOpenAddActivity}
            className="px-4 py-2.5 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>إضافة فعالية</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#9b2f00] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">event_available</span>
          </div>
          <div>
            <p className="text-xs text-[#747779]">الفعاليات النشطة والمجدولة</p>
            <p className="text-xl font-black text-[#191c1e]">{activities.length} برامج</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#855300] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
          <div>
            <p className="text-xs text-[#747779]">إجمالي المشاركين والمسجلين</p>
            <p className="text-xl font-black text-[#191c1e]">{totalParticipants} مستفيد</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e1bfb5] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <p className="text-xs text-[#747779]">متوسط التقييم ورضا المشاركين</p>
            <p className="text-xl font-black text-emerald-800">4.9 / 5.0 ★</p>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => {
          const isCapacityNumeric = typeof activity.capacity === 'number';
          const fillRate = isCapacityNumeric
            ? Math.round((activity.registeredCount / (activity.capacity as number)) * 100)
            : 100;

          return (
            <div
              key={activity.id}
              className="bg-white rounded-2xl border border-[#e1bfb5] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#9b2f00] transition-colors"
            >
              <div>
                {/* Image header */}
                <div className="relative h-44 w-full bg-[#f2f4f6] overflow-hidden">
                  {activity.imageUrl ? (
                    <img
                      src={activity.imageUrl}
                      alt={activity.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#9b2f00]/20 to-[#fea619]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-[#855300]">event</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <span
                    className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-xs ${
                      activity.type === 'مدفوع'
                        ? 'bg-[#9b2f00] text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activity.type === 'مدفوع' ? `مدفوع (${activity.price} ر.س)` : 'مجاني للجميع'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#191c1e] mb-1.5 leading-snug">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-[#59413a] line-clamp-2 leading-relaxed mb-4">
                    {activity.description}
                  </p>

                  <div className="space-y-2 text-xs text-[#747779] bg-[#f7f9fb] p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#9b2f00]">date_range</span>
                      <span>{activity.dateRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#9b2f00]">schedule</span>
                      <span>{activity.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#9b2f00]">location_on</span>
                      <span>{activity.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="p-5 pt-0">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#59413a]">المقاعد المحجوزة:</span>
                    <span className="font-bold text-[#191c1e]">
                      {activity.registeredCount}{' '}
                      {isCapacityNumeric ? `/ ${activity.capacity} مشترك` : 'مشترك (مفتوح)'}
                    </span>
                  </div>
                  {isCapacityNumeric && (
                    <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#fea619] rounded-full"
                        style={{ width: `${Math.min(fillRate, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#e1bfb5]/40">
                  <button
                    onClick={() => {
                      onShowToast(`تم تسجيل طالب جديد في "${activity.title}"`);
                    }}
                    className="flex-1 py-2 bg-[#9b2f00] hover:bg-[#c2410c] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                    <span>تسجيل طالب</span>
                  </button>
                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="px-3 py-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#59413a] rounded-xl text-xs font-semibold transition-colors"
                  >
                    التفاصيل
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#e1bfb5] overflow-hidden p-6" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1bfb5] mb-4">
              <h3 className="text-lg font-bold text-[#191c1e]">{selectedActivity.title}</h3>
              <button onClick={() => setSelectedActivity(null)} className="text-[#747779]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#59413a] mb-4 leading-relaxed">{selectedActivity.description}</p>
            <div className="space-y-2 text-xs bg-[#f7f9fb] p-4 rounded-xl mb-4">
              <p><strong>التاريخ:</strong> {selectedActivity.dateRange}</p>
              <p><strong>التوقيت:</strong> {selectedActivity.timeSlot}</p>
              <p><strong>المكان:</strong> {selectedActivity.location}</p>
              <p><strong>الرسوم:</strong> {selectedActivity.type === 'مدفوع' ? `${selectedActivity.price} ر.س` : 'مجاني'}</p>
            </div>
            <button
              onClick={() => setSelectedActivity(null)}
              className="w-full py-2.5 bg-[#9b2f00] text-white rounded-xl font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
