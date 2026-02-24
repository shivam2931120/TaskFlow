// Tasks Page
// yeh page saare tasks dikhata hai - CRUD, search, filter, pagination ke saath

'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import Loader from '@/components/Loader';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TasksPage() {
  // Tasks data state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 10,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter aur search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Track active filter tab
  const [activeTab, setActiveTab] = useState('all');

  // Fetch tasks - with search, filter, pagination
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      params.append('page', currentPage);
      params.append('limit', 10);

      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error('Tasks fetch error:', error);
      toast.error('Tasks could not be loaded');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, currentPage]);

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounce effect for search - search 500ms after typing stops
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Task create/update handler
  const handleTaskSubmit = async (formData, taskId) => {
    try {
      if (taskId) {
        // Update existing task
        const res = await api.put(`/tasks/${taskId}`, formData);
        if (res.data.success) {
          toast.success('Task updated!');
          fetchTasks();
        }
      } else {
        // Create new task
        const res = await api.post('/tasks', formData);
        if (res.data.success) {
          toast.success('Task created!');
          fetchTasks();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Task could not be saved');
      throw error; // Modal ko batao ki error aaya hai
    }
  };

  // Task delete handler
  const handleDelete = async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        toast.success('Task deleted!');
        fetchTasks();
      }
    } catch (error) {
      toast.error('Task could not be deleted');
    }
  };

  // Task status toggle handler
  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(newStatus === 'completed' ? 'Task marked as completed!' : 'Task marked as pending');
        fetchTasks();
      }
    } catch (error) {
      toast.error('Status could not be changed');
    }
  };

  // Open edit modal
  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Filter tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    switch (tab) {
      case 'all':
        setStatusFilter('all');
        setPriorityFilter('all');
        break;
      case 'pending':
        setStatusFilter('pending');
        setPriorityFilter('all');
        break;
      case 'high':
        setStatusFilter('all');
        setPriorityFilter('high');
        break;
      case 'completed':
        setStatusFilter('completed');
        setPriorityFilter('all');
        break;
    }
  };

  return (
    <ProtectedRoute>
      <div className="px-4 lg:px-8 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="flex w-full items-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 px-4 py-3 border border-transparent focus-within:border-primary/50 transition-all">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-2">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-base placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none"
              placeholder="Search your tasks..."
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-4">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'In Progress' },
            { key: 'high', label: 'High Priority' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === tab.key
                ? 'bg-primary text-background-dark'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks list */}
        {loading ? (
          <Loader text="Loading tasks..." />
        ) : tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center justify-center size-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <span className="text-sm font-medium text-slate-500 px-4">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage >= pagination.totalPages}
                  className="flex items-center justify-center size-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}

            {/* Total count */}
            <p className="text-center text-xs text-slate-400 mt-3">
              {pagination.totalTasks} total tasks
            </p>
          </>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">
              checklist
            </span>
            <h3 className="text-lg font-bold mt-4 text-slate-500">No tasks found</h3>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks found for the current filter'
                : 'Start by adding your first task!'}
            </p>
            <button
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              className="mt-6 px-6 py-3 bg-primary text-background-dark font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
            >
              Add New Task
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button - add new task */}
      <button
        onClick={() => {
          setEditingTask(null);
          setModalOpen(true);
        }}
        className="fixed bottom-24 lg:bottom-8 right-6 size-14 rounded-full bg-primary text-background-dark shadow-2xl shadow-primary/30 flex items-center justify-center z-30 active:scale-90 transition-transform hover:brightness-110"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />
    </ProtectedRoute>
  );
}
