// TaskCard Component
// This component displays a single task card - used in the task list

'use client';

import { useState } from 'react';

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Set colors based on priority
  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  // Status ke hisaab se styles
  const isCompleted = task.status === 'completed';

  // Format due date and check if overdue
  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today && !isCompleted;

    const formatted = dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return { formatted, isOverdue };
  };

  const dueInfo = formatDueDate(task.due_date);

  return (
    <div
      className={`group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all ${isCompleted ? 'opacity-70' : ''
        }`}
    >
      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-sm font-semibold mb-3">Are you sure you want to delete this?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowConfirm(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card header - priority badge aur actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border w-fit ${priorityColors[task.priority] || priorityColors.medium
              }`}
          >
            {task.priority} Priority
          </span>
          <h3 className={`text-lg font-semibold leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Status toggle button */}
          <button
            onClick={() => onToggleStatus(task.id, isCompleted ? 'pending' : 'completed')}
            className={`flex size-8 items-center justify-center rounded-full transition-colors ${isCompleted
              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-primary/10 hover:text-primary'
              }`}
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            <span className="material-symbols-outlined text-lg">
              {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </button>
          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          {/* Delete button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>

      {/* Task description */}
      {task.description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
          {task.description}
        </p>
      )}

      {/* Card footer - due date aur status */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
        {dueInfo ? (
          <div className={`flex items-center gap-2 ${dueInfo.isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span className="text-xs font-medium">
              {dueInfo.isOverdue ? 'Overdue: ' : 'Due: '}
              {dueInfo.formatted}
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">No due date</div>
        )}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${isCompleted
            ? 'bg-green-500/10 text-green-500'
            : 'bg-amber-500/10 text-amber-500'
            }`}
        >
          {isCompleted ? 'Done' : 'In Progress'}
        </span>
      </div>
    </div>
  );
}
