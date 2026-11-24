import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from '../ui/EmptyState';

export default function TaskList({
  tasks = [],
  onToggleComplete,
  onAddNewTask,
  onEditTask,
  onDeleteTask,
}) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-md flex flex-col gap-space-sm">
      {/* Başlık ve Tamamlanma Sayacı */}
      <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span>
          <h3 className="font-label-sm text-sm font-bold text-primary">
            Günün Görevleri &amp; Kontrol Listesi
          </h3>
        </div>
        <span className="font-caption text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-primary">
          {completedCount}/{totalCount} Tamamlandı
        </span>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Görev Maddeleri */}
      <div className="flex flex-col gap-1 divide-y divide-surface-container/60 my-1">
        {tasks.length === 0 ? (
          <EmptyState
            type="empty"
            compact
            icon="checklist"
            title="Aktif Görev Bulunmuyor"
            description="Tüm görevler tamamlandı veya henüz görev eklenmedi."
            actionLabel="Hızlı Görev Ekle"
            onAction={onAddNewTask}
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      {/* Hızlı Görev Ekle Butonu */}
      <button
        type="button"
        onClick={onAddNewTask}
        className="w-full py-2 bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>Hızlı Görev Ekle</span>
      </button>
    </div>
  );
}

