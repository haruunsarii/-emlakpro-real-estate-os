import React, { useState, useMemo } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { TASK_PRIORITIES, getTodayYMD, getActiveAdvisors } from '../../utils/taskHelpers';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { isNonEmpty } from '../../utils/validation';

/**
 * EmlakPro Task Form Modal
 * Refactored in Phase 3.2 Step 3 to use BaseModal and FormField.
 * Preserves validation rules, toast feedback, and task scheduling data.
 * Dynamic advisor integration: defaults to logged-in user (currentUser) and active advisors.
 */
export default function TaskFormModal({
  isOpen = false,
  onClose,
  onSave,
  initialData = null,
}) {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Dinamik danışman listesi (settings.users aktif kullanıcıları + currentUser)
  const availableAdvisors = useMemo(() => {
    return getActiveAdvisors(currentUser);
  }, [currentUser]);

  const defaultAdvisorName = useMemo(() => {
    return currentUser?.name || availableAdvisors[0]?.name || '';
  }, [currentUser, availableAdvisors]);

  // Düzenleme modunda mevcut görev ataması korunsun (eski danışman pasif olsa bile)
  const selectAdvisorOptions = useMemo(() => {
    const list = [...availableAdvisors];
    const existing = initialData?.assignedTo || initialData?.assignedAdvisorFull || initialData?.assignedAdvisor;
    if (existing && !list.some((u) => u.name === existing)) {
      list.push({
        id: 'existing-task-advisor',
        name: existing,
        title: 'Danışman',
      });
    }
    return list;
  }, [availableAdvisors, initialData]);

  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'normal',
    dueDate: initialData?.dueDate || getTodayYMD(),
    dueTime: initialData?.dueTime || '15:00',
    assignedTo: initialData?.assignedTo || initialData?.assignedAdvisorFull || initialData?.assignedAdvisor || defaultAdvisorName,
    completed: Boolean(initialData?.completed),
  }));

  const [errors, setErrors] = useState({});
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setFormData({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'normal',
      dueDate: initialData?.dueDate || getTodayYMD(),
      dueTime: initialData?.dueTime || '15:00',
      assignedTo: initialData?.assignedTo || initialData?.assignedAdvisorFull || initialData?.assignedAdvisor || defaultAdvisorName,
      completed: Boolean(initialData?.completed),
    });
    setErrors({});
  }

  const validate = () => {
    const newErrors = {};
    if (!isNonEmpty(formData.title, 3)) {
      newErrors.title = 'Görev tanımı en az 3 karakter olmalıdır.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen görev tanımını eksiksiz doldurun.');
      return;
    }

    onSave({
      ...initialData,
      ...formData,
      assignedTo: formData.assignedTo || defaultAdvisorName || 'Atanmadı',
      id: initialData?.id || `TASK-${Date.now().toString().slice(-4)}`,
    });
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg font-medium transition-colors cursor-pointer"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="task-modal-form"
        className="px-5 py-2 text-sm bg-primary hover:bg-primary-container text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">check</span>
        <span>{initialData ? 'Görevi Güncelle' : 'Görevi Kaydet'}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon="add_task"
      title={initialData ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
      subtitle="Ekip üyeleri veya kendiniz için ajanda takip görevi oluşturun."
      footer={modalFooter}
    >
      <form
        id="task-modal-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Görev Tanımı */}
        <FormField
          id="task-form-title"
          label="Görev Tanımı"
          required
          error={errors.title}
        >
          <input
            id="task-form-title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="Örn: PORT-7902 portal fiyat güncellemesi"
            className={`h-10 px-3 w-full text-sm rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'border-rose-500' : 'border-surface-container'
            }`}
          />
        </FormField>

        {/* Açıklama / Detaylar */}
        <FormField
          id="task-form-desc"
          label="Açıklama / Detaylar"
        >
          <textarea
            id="task-form-desc"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Sahibinden, Hepsiemlak fiyatı güncellenecek vb."
            className="w-full p-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </FormField>

        {/* Öncelik & Danışman */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="task-form-priority"
            label="Öncelik Derecesi"
          >
            <select
              id="task-form-priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {Object.entries(TASK_PRIORITIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="task-form-assigned-to"
            label="Atanan Danışman"
          >
            <select
              id="task-form-assigned-to"
              value={formData.assignedTo || defaultAdvisorName}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {selectAdvisorOptions.map((adv) => {
                const isSelf = currentUser?.name && adv.name === currentUser.name;
                const labelSuffix = adv.title ? ` - ${adv.title}` : '';
                return (
                  <option key={adv.id || adv.name} value={adv.name}>
                    {adv.name} {isSelf ? '(Siz)' : ''}{labelSuffix}
                  </option>
                );
              })}
              {selectAdvisorOptions.length === 0 && (
                <option value={defaultAdvisorName || ''}>
                  {defaultAdvisorName ? `${defaultAdvisorName} (Siz)` : 'Atanmadı'}
                </option>
              )}
            </select>
          </FormField>
        </div>

        {/* Tarih & Saat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="task-form-due-date"
            label="Son Tarih"
          >
            <input
              id="task-form-due-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            id="task-form-due-time"
            label="Hedef Saat"
          >
            <input
              id="task-form-due-time"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>

        {/* Tamamlandı Durumu Checkbox */}
        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-surface-container cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.completed}
            onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-medium text-primary">
            Bu görev tamamlandı olarak işaretlensin
          </span>
        </label>
      </form>
    </BaseModal>
  );
}
