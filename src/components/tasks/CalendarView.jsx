import React, { useState } from 'react';
import AppointmentCard from './AppointmentCard';
import EmptyState from '../ui/EmptyState';
import { getWeekDays } from '../../utils/taskHelpers';

export default function CalendarView({
  viewMode = 'haftalik',
  appointments = [],
  selectedAppointment,
  onSelectAppointment,
  onEditAppointment,
  onDeleteAppointment,
  currentDate: propCurrentDate,
  selectedDate: propSelectedDate,
  onSelectDate,
}) {
  const [defaultNow] = useState(() => new Date());
  const currentDate = propCurrentDate || defaultNow;
  const selectedDate = propSelectedDate || defaultNow.toISOString().slice(0, 10);
  const weekDays = getWeekDays(currentDate);

  const currentHour = defaultNow.getHours();
  const currentMinute = defaultNow.getMinutes();
  const currentTimeLabel = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  // Mesai saatleri (09:00 - 18:30) içinde mi kontrolü
  const isWithinWorkHours = currentHour >= 9 && (currentHour < 18 || (currentHour === 18 && currentMinute <= 30));
  // 09:00 başlangıç noktasına göre piksel konumu (her saat dilimi 96px)
  const topPixels = isWithinWorkHours ? ((currentHour - 9) * 96) + ((currentMinute / 60) * 96) : null;

  const hours = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // Randevuları tarihe göre filtreleme fonksiyonu
  const getAppointmentsForDate = (dateStr) => {
    return appointments.filter((appt) => appt.date === dateStr);
  };

  // Belirli bir gün ve saatteki randevuları bulma
  const getAppointmentsForSlot = (dateStr, hourStr) => {
    const slotHour = parseInt(hourStr.split(':')[0], 10);
    return appointments.filter((appt) => {
      if (appt.date !== dateStr) return false;
      const apptHour = parseInt(appt.startTime.split(':')[0], 10);
      return apptHour === slotHour;
    });
  };

  // AJANDA GÖRÜNÜMÜ
  if (viewMode === 'ajanda') {
    const grouped = {};
    appointments.forEach((appt) => {
      if (!grouped[appt.date]) grouped[appt.date] = [];
      grouped[appt.date].push(appt);
    });

    const sortedDates = Object.keys(grouped).sort();

    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">view_agenda</span>
            <h3 className="font-label-md text-sm font-bold text-primary">
              Ajanda Listesi ({appointments.length} Randevu)
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-caption">
            Kronolojik Sıralama
          </span>
        </div>

        {sortedDates.length === 0 ? (
          <EmptyState
            type="filter"
            icon="event_busy"
            title="Seçilen Kriterlere Uygun Randevu Bulunamadı"
            description="Filtreleme kriterlerinize veya arama sorgunuza uyan randevu kaydı bulunamadı."
          />
        ) : (
          <div className="flex flex-col gap-space-md">
            {sortedDates.map((dateStr) => {
              const dayAppts = grouped[dateStr].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              );
              const isToday = dateStr === '2024-03-20';
              const isSelected = dateStr === selectedDate;
              return (
                <div key={dateStr} className="flex flex-col gap-2">
                  <div
                    onClick={() => onSelectDate && onSelectDate(dateStr)}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <span
                      className={`font-label-sm text-xs font-bold px-2 py-0.5 rounded transition-all ${
                        isSelected
                          ? 'bg-secondary text-white ring-2 ring-secondary/30'
                          : isToday
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-primary group-hover:bg-surface-container-high'
                      }`}
                    >
                      {dateStr}
                    </span>
                    {isToday && (
                      <span className="font-caption text-[11px] font-bold text-secondary">
                        BUGÜN
                      </span>
                    )}
                    <span className="h-[1px] flex-1 bg-surface-container" />
                    <span className="font-caption text-xs text-on-surface-variant">
                      {dayAppts.length} Randevu
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 pl-2 border-l-2 border-surface-container">
                    {dayAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        variant="agenda"
                        isSelected={selectedAppointment?.id === appt.id}
                        onClick={onSelectAppointment}
                        onEdit={onEditAppointment}
                        onDelete={onDeleteAppointment}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // GÜNLÜK GÖRÜNÜM
  if (viewMode === 'gunluk') {
    const activeDateStr = selectedDate || '2024-03-20';
    const dayAppts = getAppointmentsForDate(activeDateStr);
    const dateObj = new Date(activeDateStr);
    const dayNamesTr = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthsTr = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayName = isNaN(dateObj) ? 'Çarşamba' : dayNamesTr[dateObj.getDay()];
    const dayNum = isNaN(dateObj) ? 20 : dateObj.getDate();
    const monthName = isNaN(dateObj) ? 'Mart' : monthsTr[dateObj.getMonth()];
    const year = isNaN(dateObj) ? 2024 : dateObj.getFullYear();

    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
        {/* Başlık */}
        <div className="p-space-md bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex flex-col items-center justify-center font-bold">
              <span className="text-[10px] uppercase tracking-wider">{dayName.slice(0, 3)}</span>
              <span className="text-base leading-none">{dayNum}</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                {dayNum} {monthName} {year}, {dayName}
              </h3>
              <span className="font-caption text-caption text-on-surface-variant">
                Kadıköy Şube Günlük Operasyon Ajandası • {dayAppts.length} Randevu
              </span>
            </div>
          </div>
          {activeDateStr === '2024-03-20' && (
            <span className="bg-secondary-container text-white font-caption text-xs px-2.5 py-1 rounded-full font-bold">
              Bugün
            </span>
          )}
        </div>

        {/* Günlük Saat Çizelgesi */}
        <div className="p-space-md flex flex-col divide-y divide-surface-container">
          {hours.map((hourStr) => {
            const slotAppts = getAppointmentsForSlot(activeDateStr, hourStr);
            const isCurrentSlot = hourStr === '10:00' && activeDateStr === '2024-03-20';
            return (
              <div
                key={hourStr}
                className={`py-3 flex items-start gap-4 transition-colors ${
                  isCurrentSlot ? 'bg-amber-50/40 -mx-space-md px-space-md rounded-lg' : ''
                }`}
              >
                <div className="w-16 shrink-0 text-right font-caption text-xs font-bold text-on-surface-variant pt-1">
                  {hourStr}
                </div>
                <div className="flex-1 min-h-[48px] flex flex-col gap-2">
                  {slotAppts.length === 0 ? (
                    <div className="h-full flex items-center text-xs text-outline italic">
                      {hourStr === '12:00' || hourStr === '13:00'
                        ? 'Danışman Ofis Çalışması / Öğle Arası'
                        : 'Müsait zaman aralığı'}
                    </div>
                  ) : (
                    slotAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        variant="agenda"
                        isSelected={selectedAppointment?.id === appt.id}
                        onClick={onSelectAppointment}
                        onEdit={onEditAppointment}
                        onDelete={onDeleteAppointment}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // AYLIK GÖRÜNÜM
  if (viewMode === 'aylik') {
    const monthDays = [];
    for (let i = 1; i <= 31; i++) {
      const dStr = i < 10 ? `0${i}` : `${i}`;
      const fullDate = `2024-03-${dStr}`;
      monthDays.push({
        dayNum: i,
        fullDate,
        isToday: i === 20,
        isSelected: fullDate === selectedDate,
      });
    }

    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-[680px] flex flex-col">
            {/* Gün Başlıkları */}
            <div className="grid grid-cols-7 bg-surface-container-low text-center border-b border-surface-container">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((name) => (
                <div key={name} className="py-2 font-caption text-caption font-bold text-on-surface-variant uppercase">
                  {name}
                </div>
              ))}
            </div>

            {/* Ay Günleri Izgarası */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-surface-container bg-surface-container-lowest">
              <div className="min-h-[90px] p-1 bg-surface-container-low/30 opacity-40 text-xs text-outline">26 Şub</div>
              <div className="min-h-[90px] p-1 bg-surface-container-low/30 opacity-40 text-xs text-outline">27 Şub</div>
              <div className="min-h-[90px] p-1 bg-surface-container-low/30 opacity-40 text-xs text-outline">28 Şub</div>
              <div className="min-h-[90px] p-1 bg-surface-container-low/30 opacity-40 text-xs text-outline">29 Şub</div>

              {monthDays.map((d) => {
                const dayAppts = getAppointmentsForDate(d.fullDate);
                return (
                  <div
                    key={d.dayNum}
                    onClick={() => onSelectDate && onSelectDate(d.fullDate)}
                    className={`min-h-[90px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer hover:bg-surface-container-low/60 ${
                      d.isSelected
                        ? 'bg-secondary/10 ring-2 ring-inset ring-secondary'
                        : d.isToday
                        ? 'bg-primary/5 ring-1 ring-inset ring-primary'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          d.isSelected
                            ? 'bg-secondary text-white shadow-xs'
                            : d.isToday
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-on-surface'
                        }`}
                      >
                        {d.dayNum}
                      </span>
                      {dayAppts.length > 0 && (
                        <span className="text-[10px] font-bold text-secondary">
                          {dayAppts.length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayAppts.slice(0, 2).map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appointment={appt}
                          variant="compact"
                          isSelected={selectedAppointment?.id === appt.id}
                          onClick={onSelectAppointment}
                        />
                      ))}
                      {dayAppts.length > 2 && (
                        <span className="text-[9px] text-on-surface-variant font-medium pl-1">
                          +{dayAppts.length - 2} daha...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VARSAYILAN: HAFTALIK MATRİS GÖRÜNÜMÜ (~70% Grid, Stitch Screen 6 ile birebir uyumlu)
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
      {/* 1. Kategori Renkleri Açıklama Çubuğu (Legend Strip) */}
      <div className="px-space-md py-space-xs bg-surface-container flex flex-wrap items-center gap-space-md border-b border-surface-container">
        <span className="font-caption text-caption font-semibold text-on-surface-variant">
          KATEGORİ RENKLERİ:
        </span>
        <div className="flex items-center gap-1 font-caption text-caption text-on-surface">
          <span className="w-2.5 h-2.5 rounded bg-blue-600" />
          <span>Yer Gösterimi</span>
        </div>
        <div className="flex items-center gap-1 font-caption text-caption text-on-surface">
          <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
          <span>Müşteri Takip Araması</span>
        </div>
        <div className="flex items-center gap-1 font-caption text-caption text-on-surface">
          <span className="w-2.5 h-2.5 rounded bg-purple-600" />
          <span>Sözleşme &amp; Tapu Devri</span>
        </div>
        <div className="flex items-center gap-1 font-caption text-caption text-on-surface">
          <span className="w-2.5 h-2.5 rounded bg-amber-600" />
          <span>Fotoğraf &amp; Drone Çekimi</span>
        </div>
        <div className="flex items-center gap-1 font-caption text-caption text-on-surface">
          <span className="w-2.5 h-2.5 rounded bg-slate-600" />
          <span>Değerleme &amp; Ekspertiz</span>
        </div>
      </div>

      {/* 2. Yatay Kaydırılabilir Haftalık Çizelge (Başlıklar ve Zaman Izgarası Senkronize) */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[760px] flex flex-col">
          {/* Gün Başlıkları (Days of the Week) */}
          <div className="grid grid-cols-8 bg-surface-container-low text-center border-b border-surface-container">
            {/* Saat Köşesi */}
            <div className="p-space-sm flex flex-col items-center justify-center bg-surface-container-low border-r border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-semibold tracking-wider">
                SAAT
              </span>
              <span className="font-caption text-[10px] text-outline">GMT+3</span>
            </div>

            {/* 7 Gün Sütun Başlığı */}
            {weekDays.map((day) => {
              const dayAppts = getAppointmentsForDate(day.fullDate);
              const isSelected = day.fullDate === selectedDate;

              if (day.isToday) {
                return (
                  <div
                    key={day.key}
                    onClick={() => onSelectDate && onSelectDate(day.fullDate)}
                    className={`p-space-sm flex flex-col items-center justify-center gap-0.5 bg-primary-container text-white border-r border-surface-container cursor-pointer transition-all hover:brightness-110 ${
                      isSelected ? 'ring-2 ring-inset ring-secondary-fixed' : ''
                    }`}
                    title="Günü seç ve detayları gör"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-caption text-caption uppercase font-semibold text-secondary-fixed">
                        {day.dayName}
                      </span>
                      <span className="bg-secondary-container text-white font-caption text-[10px] px-1.5 rounded-full font-bold">
                        Bugün
                      </span>
                    </div>
                    <span className="font-headline-sm text-headline-sm font-extrabold text-white">
                      {day.dayNum}
                    </span>
                    <span className="font-caption text-[10px] text-surface-container font-medium">
                      {dayAppts.length} Randevu
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={day.key}
                  onClick={() => onSelectDate && onSelectDate(day.fullDate)}
                  className={`p-space-sm flex flex-col items-center justify-center gap-0.5 border-r border-surface-container cursor-pointer transition-all hover:bg-surface-container-high ${
                    day.isWeekend ? 'bg-surface-container/50' : ''
                  } ${isSelected ? 'bg-secondary/10 ring-2 ring-inset ring-secondary' : ''}`}
                  title="Günü seç ve detayları gör"
                >
                  <span
                    className={`font-caption text-caption font-semibold uppercase ${
                      day.isWeekend ? 'text-secondary' : 'text-on-surface-variant'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`font-headline-sm text-headline-sm font-bold ${
                      day.key === 'paz'
                        ? 'text-outline'
                        : day.isWeekend
                        ? 'text-primary'
                        : 'text-on-surface'
                    }`}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className={`font-caption text-[10px] ${
                      day.key === 'paz' ? 'text-outline' : 'text-on-surface-variant'
                    }`}
                  >
                    {day.key === 'paz' ? 'Tatil' : `${dayAppts.length} Randevu`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Haftalık Zaman Izgarası (Saatler 09:00 - 18:00) */}
          <div className="grid grid-cols-8 relative bg-surface-container-low/40 divide-x divide-surface-container">
          {/* Sol Saat Kolonu */}
          <div className="flex flex-col bg-surface-container-low text-on-surface-variant font-caption text-caption select-none divide-y divide-surface-container">
            {hours.map((h) => (
              <div key={h} className="h-24 p-2 flex items-start justify-end font-semibold">
                {h}
              </div>
            ))}
          </div>

          {/* 7 Gün Sütunu */}
          {weekDays.map((day) => {
            const isToday = day.isToday;

            return (
              <div
                key={day.key}
                className={`relative flex flex-col divide-y divide-surface-container ${
                  day.key === 'paz'
                    ? 'bg-surface-container/30'
                    : isToday
                    ? 'bg-primary/[0.02]'
                    : 'bg-surface-container-lowest'
                }`}
              >
                {/* Bugün için Kırmızı Mevcut Saat Çizgisi Göstergesi (Yalnızca 09:00 - 18:30 mesai saatleri içindeyse) */}
                {isToday && isWithinWorkHours && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${topPixels}px` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600 -ml-1.5 shadow-sm" />
                    <div className="h-[2px] bg-rose-500 w-full shadow-xs" />
                    <span className="bg-rose-600 text-white font-caption text-[9px] px-1 rounded-sm font-bold absolute right-1">
                      {currentTimeLabel}
                    </span>
                  </div>
                )}

                {/* Pazar günü için özel 'Ofis Kapalı' kutusu */}
                {day.key === 'paz' ? (
                  <div className="h-full flex items-center justify-center p-space-md text-center py-24">
                    <div className="flex flex-col items-center gap-1 text-on-surface-variant opacity-60">
                      <span className="material-symbols-outlined text-[28px]">weekend</span>
                      <span className="font-caption text-caption font-semibold">Ofis Kapalı</span>
                      <span className="font-caption text-[10px]">Özel randevu bulunmuyor</span>
                    </div>
                  </div>
                ) : (
                  hours.map((h) => {
                    const slotAppts = getAppointmentsForSlot(day.fullDate, h);

                    // Özel öğle arası kutucuğu (Çarşamba 13:00)
                    if (day.key === 'car' && h === '13:00' && slotAppts.length === 0) {
                      return (
                        <div key={h} className="h-24 p-1">
                          <div className="h-full bg-surface-container/60 rounded-lg p-1.5 flex flex-col justify-center items-center text-center opacity-70">
                            <span className="font-caption text-[11px] text-on-surface-variant font-medium">
                              Ofis Çalışması
                            </span>
                            <span className="font-caption text-[10px] text-outline">
                              Sözleşme Hazırlıkları
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={h} className="h-24 p-1">
                        {slotAppts.length > 0 && (
                          <div className="h-full flex flex-col gap-1">
                            {slotAppts.map((appt) => (
                              <AppointmentCard
                                key={appt.id}
                                appointment={appt}
                                variant="calendar"
                                isSelected={selectedAppointment?.id === appt.id}
                                onClick={onSelectAppointment}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
