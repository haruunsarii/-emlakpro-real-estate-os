import React from 'react';
import { getTaskPriorityConfig } from '../../utils/taskHelpers';

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  if (!task) return null;

  const priorityConfig = getTaskPriorityConfig(task.priority);

  return (
    <div
      className={`group p-space-xs rounded-lg transition-all flex items-start gap-space-xs border border-transparent hover:border-surface-container ${task.completed
          ? 'bg-surface/50 opacity-60'
          : 'hover:bg-surface-container-low/60'
        }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete && onToggleComplete(task.id)}
        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
        title={task.completed ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
      />

      {/* Görev İçeriği */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`font-label-sm text-label-sm truncate ${task.completed
                ? 'font-medium text-on-surface-variant line-through'
                : 'font-semibold text-primary'
              }`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {task.completed ? (
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-caption text-[10px] font-bold">
                TAMAM
              </span>
            ) : (
              <span className={`px-1.5 py-0.2 rounded font-caption text-[10px] font-bold ${priorityConfig.badgeBg}`}>
                {priorityConfig.label.toUpperCase()}
              </span>
            )}

            {/* Hover Aksiyonları */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="w-5 h-5 flex items-center justify-center text-outline hover:text-primary rounded cursor-pointer"
                  title="Düzenle"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="w-5 h-5 flex items-center justify-center text-outline hover:text-rose-600 rounded cursor-pointer"
                  title="Sil"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {task.description && (
          <p
            className={`font-caption text-[11px] line-clamp-1 mt-0.5 ${task.completed ? 'text-outline' : 'text-on-surface-variant'
              }`}
          >
            {task.description}
          </p>
        )}

        {/* Alt Bilgi Çubuğu */}
        <div className="flex items-center gap-2 mt-1 font-caption text-[10px] text-outline">
          {task.completed ? (
            <span className="text-emerald-700 font-medium">
              Tamamlandı • {task.assignedTo || task.assignedAdvisorFull || task.assignedAdvisor || 'Atanmadı'}
            </span>
          ) : (
            <>
              {task.dueTime && (
                <span className="flex items-center gap-0.5 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {task.dueTime}
                </span>
              )}
              <span>•</span>
              <span>Atanan: {task.assignedTo || task.assignedAdvisorFull || task.assignedAdvisor || 'Atanmadı'}</span>
              <span className="text-on-surface-variant">• Bekliyor</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

