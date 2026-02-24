// TaskModal Component
// This component is the modal form for creating/editing tasks - bottom sheet style

'use client';

import { useState, useEffect } from 'react';

export default function TaskModal({ isOpen, onClose, onSubmit, task = null }) {
  // Form state - if a task is being edited, pre-fill its values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // When task prop changes, update form data
  useEffect(() => {
    if (task) {
      // Edit mode - fill values of existing task
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date || '',
      });
    } else {
      // Create mode - empty form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title kam se kam 3 characters ka hona chahiye';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData, task?.id);
      onClose();
    } catch (error) {
      console.error('Task submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Do not render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Background overlay - click karne pe modal band ho */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal content - bottom sheet on mobile, centered modal on desktop */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border sm:border-slate-200 animate-slide-up flex flex-col max-h-[90vh]">
        {/* Handle bar - visible only on mobile */}
        <button onClick={onClose} className="flex h-8 w-full items-center justify-center sm:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </button>

        <div className="px-6 pb-8 pt-2 sm:pt-8 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">
              {task ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-primary/60 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-primary/80 ml-1">
                Task Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. Design System Audit"
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 mt-1.5 ml-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-primary/80 ml-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[120px] resize-none transition-all"
                placeholder="What needs to be done?"
              />
            </div>

            {/* Priority & Due Date - side by side on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority select */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-primary/80 ml-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full appearance-none bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-primary/40">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Due Date input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-primary/80 ml-1">
                  Due Date
                </label>
                <input
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Status - sirf edit mode me dikhao */}
            {task && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-primary/80 ml-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full appearance-none bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-primary/40">
                    expand_more
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 px-6 rounded-xl bg-primary text-background-dark font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : task ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
