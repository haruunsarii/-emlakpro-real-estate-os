import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TaskHeader from '../../components/tasks/TaskHeader';
import TaskStatsGrid from '../../components/tasks/TaskStatsGrid';
import CalendarToolbar from '../../components/tasks/CalendarToolbar';
import CalendarView from '../../components/tasks/CalendarView';
import TaskList from '../../components/tasks/TaskList';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import ReminderPanel from '../../components/tasks/ReminderPanel';
import AppointmentFormModal from '../../components/tasks/AppointmentFormModal';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDeleteModal from '../../components/tasks/TaskDeleteModal';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';
import {
  isTaskOverdue,
  formatWeekRange,
  getMonday,
  getTodayYMD,
} from '../../utils/taskHelpers';

const LOCAL_STORAGE_TASKS_KEY = 'emlakpro_tasks_v1';
const LOCAL_STORAGE_APPOINTMENTS_KEY = 'emlakpro_appointments_v1';

export default function TasksPage() {
  // 1. Veri State'leri (Merkezi useLocalStorage entegrasyonu ile - Temiz Başlangıç)
  const [tasks, setTasks] = useLocalStorage(LOCAL_STORAGE_TASKS_KEY, []);
  const [appointments, setAppointments] = useLocalStorage(LOCAL_STORAGE_APPOINTMENTS_KEY, []);

  // Tarih ve Seçili Randevu State'leri (Varsayılan olarak canlı new Date())
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => getTodayYMD());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Canlı sistem tarihi takibi ve gece yarısı geçiş kontrolü
  const [todayKey, setTodayKey] = useState(() => getTodayYMD());

  // Centralized Toast Notification
  const { showToast } = useToast();

  useEffect(() => {
    const handleMidnightCheck = () => {
      const realToday = getTodayYMD();
      setTodayKey((prev) => {
        if (prev !== realToday) {
          // Gece yarısı geçildi: bugünü ve takvim odağını otomatik yenile
          setSelectedDate(realToday);
          return realToday;
        }
        return prev;
      });
    };

    const interval = setInterval(handleMidnightCheck, 30000);
    window.addEventListener('focus', handleMidnightCheck);
    document.addEventListener('visibilitychange', handleMidnightCheck);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleMidnightCheck);
      document.removeEventListener('visibilitychange', handleMidnightCheck);
    };
  }, []);

  // 2. Filtre & Görünüm State'leri
  const [viewMode, setViewMode] = useState('haftalik'); // 'aylik' | 'haftalik' | 'gunluk' | 'ajanda'
  const [selectedAdvisor, setSelectedAdvisor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active'); // 'all' | 'active' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState(null);

  // Tarih Etiketleri & Navigasyon Mantığı
  const currentDateRangeLabel = useMemo(() => {
    return formatWeekRange(currentDate);
  }, [currentDate]);

  const currentWeekLabel = useMemo(() => {
    const monday = getMonday(currentDate);
    const monthsTr = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const day = monday.getDate();
    const weekNum = Math.ceil(day / 7);
    return `${monthsTr[monday.getMonth()]} • ${weekNum}. Hafta`;
  }, [currentDate]);

  const handlePrevDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 12, 0, 0);
      if (viewMode === 'aylik') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'gunluk') {
        d.setDate(d.getDate() - 1);
      } else {
        d.setDate(d.getDate() - 7);
      }
      return d;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 12, 0, 0);
      if (viewMode === 'aylik') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'gunluk') {
        d.setDate(d.getDate() + 1);
      } else {
        d.setDate(d.getDate() + 7);
      }
      return d;
    });
  };

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(getTodayYMD());
    showToast(`Bugüne dönüldü: ${now.toLocaleDateString('tr-TR')}`);
  }, [showToast]);

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setCurrentDate(new Date(dateStr));
    const firstOnDay = appointments.find((a) => a.date === dateStr);
    if (firstOnDay) {
      setSelectedAppointmentId(firstOnDay.id);
    }
    showToast(`${dateStr} tarihindeki randevular seçildi.`);
  };

  // 3. Modal & Çekmece State'leri
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Seçili randevu objesi
  const selectedAppointment = useMemo(() => {
    const found = appointments.find((a) => a.id === selectedAppointmentId);
    return found || appointments[0] || null;
  }, [appointments, selectedAppointmentId]);

  // 5. Dinamik İstatistik Hesaplamaları (TaskStatsGrid)
  const stats = useMemo(() => {
    const todayStr = todayKey;

    // Bugünkü görevler
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const todayTasksCount = todayTasks.length;
    const todayTasksUrgent = todayTasks.filter(
      (t) =>
        !t.completed &&
        (t.priority === 'urgent' ||
          t.priority === 'high' ||
          t.priority === 'ACİL' ||
          t.priority === 'YÜKSEK')
    ).length;

    // Yaklaşan randevular (aktif & bekleyen)
    const upcomingAppointmentsCount = appointments.filter(
      (a) => a.status === 'active' || a.status === 'confirmed'
    ).length;

    // Tamamlanan görevler ve tamamlama oranı
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    const totalTasksCount = tasks.length;
    const completedRate =
      totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Geciken görevler
    const overdueCount = tasks.filter((t) => isTaskOverdue(t, todayStr)).length;

    return {
      todayTasksCount,
      todayTasksUrgent,
      upcomingAppointmentsCount,
      completedTasksCount,
      completedRate,
      overdueCount,
    };
  }, [tasks, appointments, todayKey]);

  // KPI Kartına Tıklandığında Filtreleme
  const handleKpiStatClick = (statKey) => {
    if (activeKpiFilter === statKey) {
      setActiveKpiFilter(null);
      setSelectedStatus('all');
    } else {
      setActiveKpiFilter(statKey);
      if (statKey === 'today_tasks') {
        setViewMode('gunluk');
      } else if (statKey === 'upcoming_appointments') {
        setSelectedStatus('active');
        setViewMode('haftalik');
      } else if (statKey === 'completed_tasks') {
        setSelectedStatus('completed');
        setViewMode('ajanda');
      } else if (statKey === 'overdue') {
        setSelectedStatus('all');
        setViewMode('ajanda');
      }
    }
  };

  // 6. Randevuları Filtreleme Mantığı (AND / Birlikte Çalışma)
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // KPI Filtresi
      if (activeKpiFilter === 'today_tasks') {
        if (appt.date !== todayKey) return false;
      }
      if (activeKpiFilter === 'completed_tasks') {
        if (appt.status !== 'completed') return false;
      }
      if (activeKpiFilter === 'upcoming_appointments') {
        if (appt.status !== 'active' && appt.status !== 'confirmed') return false;
      }

      // Danışman Filtresi
      if (selectedAdvisor !== 'all') {
        const advName = appt.advisorName?.toLowerCase() || '';
        const targetAdv = selectedAdvisor.toLowerCase();
        if (!advName.includes(targetAdv) && !targetAdv.includes(advName)) {
          return false;
        }
      }

      // Tür Filtresi
      if (selectedType !== 'all') {
        if (appt.type !== selectedType) return false;
      }

      // Durum Filtresi
      if (selectedStatus === 'active') {
        if (appt.status !== 'active' && appt.status !== 'confirmed') return false;
      } else if (selectedStatus === 'completed') {
        if (appt.status !== 'completed') return false;
      } else if (selectedStatus === 'cancelled') {
        if (appt.status !== 'cancelled') return false;
      }

      // Türkçe Karakter Duyarsız Arama (Search)
      if (searchQuery.trim()) {
        const matches = matchesAnyTurkishField(
          [
            appt.title,
            appt.clientName,
            appt.propertyId,
            appt.location,
            appt.advisorName,
            appt.notes,
          ],
          searchQuery
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [
    appointments,
    activeKpiFilter,
    selectedAdvisor,
    selectedType,
    selectedStatus,
    searchQuery,
    todayKey,
  ]);

  // 7. Görevleri Filtreleme Mantığı
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Danışman filtreleme
      if (selectedAdvisor !== 'all') {
        const assigned = task.assignedTo?.toLowerCase() || '';
        const targetAdv = selectedAdvisor.toLowerCase();
        if (!assigned.includes(targetAdv) && !targetAdv.includes(assigned)) {
          return false;
        }
      }

      // Durum filtreleme
      if (selectedStatus === 'completed' && !task.completed) return false;
      if (selectedStatus === 'active' && task.completed) return false;

      // KPI filtreleri
      if (activeKpiFilter === 'today_tasks') {
        if (task.dueDate !== todayKey) return false;
      }
      if (activeKpiFilter === 'overdue') {
        if (!isTaskOverdue(task, todayKey)) return false;
      }

      // Türkçe Karakter Duyarsız Arama
      if (searchQuery.trim()) {
        const matches = matchesAnyTurkishField(
          [task.title, task.description, task.assignedTo],
          searchQuery
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [tasks, selectedAdvisor, selectedStatus, activeKpiFilter, searchQuery, todayKey]);

  // Filtreleri Sıfırlama
  const handleResetFilters = () => {
    setSelectedAdvisor('all');
    setSelectedType('all');
    setSelectedStatus('active');
    setSearchQuery('');
    setActiveKpiFilter(null);
    showToast('Tüm filtreler sıfırlandı.');
  };

  // 8. CRUD İşlemleri: Görevler
  const handleToggleTaskComplete = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = !t.completed;
          return {
            ...t,
            completed: newStatus,
            completedAt: newStatus ? new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : null,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? taskData : t)));
      showToast(`"${taskData.title}" görevi güncellendi.`);
    } else {
      setTasks((prev) => [taskData, ...prev]);
      showToast(`Yeni görev eklendi: "${taskData.title}"`);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTaskClick = (task) => {
    setItemToDelete({ type: 'task', data: task });
    setIsDeleteModalOpen(true);
  };

  // 9. CRUD İşlemleri: Randevular
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointmentId(appointment.id);
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true);
    }
  };

  const handleSaveAppointment = (appointmentData) => {
    if (editingAppointment) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentData.id ? appointmentData : a))
      );
      showToast(`"${appointmentData.title}" randevusu güncellendi.`);
    } else {
      setAppointments((prev) => [appointmentData, ...prev]);
      setSelectedAppointmentId(appointmentData.id);
      showToast(`Yeni randevu planlandı: "${appointmentData.title}"`);
    }
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointmentClick = (appointment) => {
    setItemToDelete({ type: 'appointment', data: appointment });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'appointment') {
      const removedId = itemToDelete.data.id;
      setAppointments((prev) => prev.filter((a) => a.id !== removedId));
      if (selectedAppointmentId === removedId) {
        const remaining = appointments.filter((a) => a.id !== removedId);
        setSelectedAppointmentId(remaining[0]?.id || null);
      }
      showToast(`"${itemToDelete.data.title}" randevusu silindi.`);
    } else if (itemToDelete.type === 'task') {
      setTasks((prev) => prev.filter((t) => t.id !== itemToDelete.data.id));
      showToast(`"${itemToDelete.data.title}" görevi silindi.`);
    }

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Randevuya Not Ekleme
  const handleAddAppointmentNote = (appointmentId, noteText) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          const updatedNotes = a.notes ? `${a.notes} | ${noteText}` : noteText;
          return { ...a, notes: updatedNotes };
        }
        return a;
      })
    );
    showToast('Randevu notu başarıyla eklendi.');
  };

  // Randevu Konumu WhatsApp Gönderimi
  const handleSendLocationWhatsapp = (appointment) => {
    const phone = appointment.clientPhone?.replace(/[^0-9]/g, '') || '905329842100';
    const loc = appointment.location || 'Kadıköy, İstanbul';
    const msg = encodeURIComponent(
      `Merhaba ${appointment.clientName || 'Sayın Müşterimiz'},\n\n` +
      `Bugünkü "${appointment.title}" randevumuz için buluşma konumu:\n📍 ${loc}\n\n` +
      `Görüşmek üzere, EmlakPro Danışmanınız ${appointment.advisorName || 'Danışman'}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    showToast('WhatsApp konumu müşteriye iletilmek üzere açıldı.');
  };

  // Takvim Senkronizasyonu
  const handleSyncCalendar = () => {
    showToast('Google & Outlook Takvim ile 14 randevu başarıyla senkronize edildi.');
  };

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1600px] mx-auto pb-16">
      {/* 1. Üst Başlık & Eylem Çubuğu */}
      <TaskHeader
        onAddNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onAddNewAppointment={() => {
          setEditingAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
        onSyncCalendar={handleSyncCalendar}
      />

      {/* 2. Bento KPI İstatistik Izgarası */}
      <TaskStatsGrid
        stats={stats}
        onStatClick={handleKpiStatClick}
        activeFilterKey={activeKpiFilter}
      />

      {/* 3. Takvim Kontrol & Filtre Araç Çubuğu */}
      <CalendarToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDateRangeLabel={currentDateRangeLabel}
        currentWeekLabel={currentWeekLabel}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        selectedAdvisor={selectedAdvisor}
        onAdvisorChange={setSelectedAdvisor}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Ana Operasyonel Çalışma Alanı: 70% Takvim / 30% Görev & Çekmece */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* SOL KOLON: Takvim Matrisi / Ajanda (~70% desktop / 8 sütun) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md min-w-0">
          <CalendarView
            viewMode={viewMode}
            appointments={filteredAppointments}
            selectedAppointment={selectedAppointment}
            onSelectAppointment={handleSelectAppointment}
            onEditAppointment={(appt) => {
              setEditingAppointment(appt);
              setIsAppointmentModalOpen(true);
            }}
            onDeleteAppointment={handleDeleteAppointmentClick}
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* SAĞ KOLON: Görev Listesi, Seçili Randevu Çekmecesi & Hatırlatıcılar (~30% / 4 sütun) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md min-w-0">
          {/* BÖLÜM 1: Seçili Randevu Önizleme (Hero Mini Drawer) */}
          <div className="hidden lg:block">
            <TaskDetailDrawer
              appointment={selectedAppointment}
              onEdit={(appt) => {
                setEditingAppointment(appt);
                setIsAppointmentModalOpen(true);
              }}
              onDelete={handleDeleteAppointmentClick}
              onSendLocationWhatsapp={handleSendLocationWhatsapp}
              onAddNote={handleAddAppointmentNote}
            />
          </div>

          {/* BÖLÜM 2: Günün Görevleri & Kontrol Listesi */}
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleTaskComplete}
            onAddNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTaskClick}
          />

          {/* BÖLÜM 3: Yaklaşan Önemli Hatırlatıcılar & Sözleşme Uyarıları */}
          <ReminderPanel
            reminders={[]}
            onActionClick={(action, reminder) => {
              showToast(`${reminder.title}: "${action.label}" işlemi gerçekleştirildi.`);
            }}
          />
        </div>
      </div>

      {/* Mobil ve Tablet için Seçili Randevu Drawer Modal */}
      {isMobileDrawerOpen && (
        <TaskDetailDrawer
          appointment={selectedAppointment}
          isDrawerMode={true}
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          onEdit={(appt) => {
            setIsMobileDrawerOpen(false);
            setEditingAppointment(appt);
            setIsAppointmentModalOpen(true);
          }}
          onDelete={(appt) => {
            setIsMobileDrawerOpen(false);
            handleDeleteAppointmentClick(appt);
          }}
          onSendLocationWhatsapp={handleSendLocationWhatsapp}
          onAddNote={handleAddAppointmentNote}
        />
      )}

      {/* MODALLAR */}
      {/* 1. Yeni / Düzenle Randevu Modalı */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        initialData={editingAppointment}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
      />

      {/* 2. Yeni / Düzenle Görev Modalı */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        initialData={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* 3. Güvenli Silme Onay Modalı */}
      <TaskDeleteModal
        isOpen={isDeleteModalOpen}
        item={itemToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

