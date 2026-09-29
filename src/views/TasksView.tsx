import React, { useState } from 'react';
import { CheckSquare2, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Task, User } from '../types';
import { api } from '../api';

interface TasksViewProps {
  tasks: Task[];
  currentUser: User;
  onRefresh: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, currentUser, onRefresh }) => {
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [assigneeUsername, setAssigneeUsername] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createTask({
        title,
        description,
        priority,
        assignedToUsername: assigneeUsername || undefined,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      setAssigneeUsername('');
      setDueDate('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Structured Tasks</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize personal to-dos, team deliverables, and operational milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filters */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
            {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === st ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.status === 'DONE'
                  ? 'border-zinc-200 opacity-60 bg-zinc-50/50'
                  : 'border-zinc-200 hover:border-zinc-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.status === 'DONE'}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.checked ? 'DONE' : 'TODO')
                  }
                  className="w-4 h-4 mt-1 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold text-zinc-900 ${
                        task.status === 'DONE' ? 'line-through text-zinc-400' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        task.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      by {task.createdByName}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    {task.assignedToName && (
                      <span>Assigned to: <strong>@{task.assignedToName}</strong></span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Selector & Delete */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                  className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-hidden"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 mb-1">Add New Task</h3>
            <p className="text-xs text-zinc-500 mb-4">Assign work or log personal milestones.</p>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task summary"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and context"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Assign to (Username)
                </label>
                <input
                  type="text"
                  value={assigneeUsername}
                  onChange={(e) => setAssigneeUsername(e.target.value)}
                  placeholder="e.g. sarah_lead (optional)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
