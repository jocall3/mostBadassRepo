import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Clock,
  AlertCircle,
  Search,
  Sun,
  Moon,
  Check,
  X,
  Tag as TagIcon,
  Calendar,
  User,
  ArrowRight,
  BarChart2,
  TrendingUp,
  Activity,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Share2,
  CheckCircle2
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type ColumnId = 'todo' | 'in-progress' | 'review' | 'done';

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: Priority;
  dueDate: string;
  assignee: {
    name: string;
    avatarColor: string;
  };
  tags: string[];
  subTasks: SubTask[];
  createdAt: string;
}

interface Column {
  id: ColumnId;
  title: string;
  color: string;
}

interface ActivityLog {
  id: string;
  taskId: string;
  taskTitle: string;
  action: string;
  timestamp: string;
}

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800/50 border-t-4 border-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50/50 dark:bg-blue-950/10 border-t-4 border-blue-500' },
  { id: 'review', title: 'In Review', color: 'bg-amber-50/50 dark:bg-amber-950/10 border-t-4 border-amber-500' },
  { id: 'done', title: 'Completed', color: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-t-4 border-emerald-500' }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design System Architecture',
    description: 'Create a scalable design system token structure and component guidelines for the core product suite.',
    columnId: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    assignee: { name: 'Sarah Connor', avatarColor: 'bg-indigo-500' },
    tags: ['Design', 'Core'],
    subTasks: [
      { id: 'sub-1', title: 'Define color tokens', isCompleted: true },
      { id: 'sub-2', title: 'Build typography scale', isCompleted: false },
      { id: 'sub-3', title: 'Create button components', isCompleted: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task-2',
    title: 'Refactor State Management',
    description: 'Migrate legacy context providers to optimized Zustand stores to prevent unnecessary re-renders.',
    columnId: 'in-progress',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    assignee: { name: 'Alex Mercer', avatarColor: 'bg-emerald-500' },
    tags: ['Engineering', 'Performance'],
    subTasks: [
      { id: 'sub-4', title: 'Audit current context usage', isCompleted: true },
      { id: 'sub-5', title: 'Implement Zustand store', isCompleted: true },
      { id: 'sub-6', title: 'Write unit tests for store actions', isCompleted: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'task-3',
    title: 'API Integration & Testing',
    description: 'Connect the frontend dashboard widgets to the newly deployed GraphQL analytics endpoints.',
    columnId: 'review',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    assignee: { name: 'Elena Rostova', avatarColor: 'bg-amber-500' },
    tags: ['Backend', 'API'],
    subTasks: [
      { id: 'sub-7', title: 'Map GraphQL queries', isCompleted: true },
      { id: 'sub-8', title: 'Setup MSW mock handlers', isCompleted: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'task-4',
    title: 'User Onboarding Flow',
    description: 'Design and implement an interactive multi-step onboarding tour for first-time enterprise users.',
    columnId: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    assignee: { name: 'Marcus Aurelius', avatarColor: 'bg-rose-500' },
    tags: ['Product', 'UX'],
    subTasks: [
      { id: 'sub-9', title: 'Draft onboarding copy', isCompleted: true },
      { id: 'sub-10', title: 'Implement Shepherd.js tour', isCompleted: true },
      { id: 'sub-11', title: 'Track completion analytics', isCompleted: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/50',
  high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/50',
  urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100 dark:border-rose-900/50'
};

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
  'bg-sky-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-teal-500'
];

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  // State Management
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('taskflow_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-1',
        taskId: 'task-4',
        taskTitle: 'User Onboarding Flow',
        action: 'moved to Completed',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'log-2',
        taskId: 'task-2',
        taskTitle: 'Refactor State Management',
        action: 'updated subtask progress',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];
  });

  const [currentView, setCurrentView] = useState<'board' | 'dashboard'>('board');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_dark');
    return saved ? JSON.parse(saved) : false;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('taskflow_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Helper to trigger toast notifications
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Log Activity Helper
  const logActivity = (taskId: string, taskTitle: string, action: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      taskId,
      taskTitle,
      action,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Task Actions
  const handleCreateOrUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Update
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
      logActivity(taskData.id, taskData.title, 'updated task details');
      showToast('Task updated successfully');
    } else {
      // Create
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
      logActivity(newTask.id, newTask.title, 'created task');
      showToast('Task created successfully');
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      logActivity(taskId, taskToDelete.title, 'deleted task');
      showToast('Task deleted', 'error');
    }
  };

  const handleMoveTask = (taskId: string, targetColumnId: ColumnId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.columnId !== targetColumnId) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: targetColumnId } : t));
      const targetColName = COLUMNS.find(c => c.id === targetColumnId)?.title || targetColumnId;
      logActivity(taskId, task.title, `moved to ${targetColName}`);
      showToast(`Moved to ${targetColName}`);
    }
  };

  const handleToggleSubtask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subTasks.map(st => 
          st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        logActivity(taskId, t.title, 'updated subtask progress');
        return { ...t, subTasks: updatedSubtasks };
      }
      return t;
    }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleMoveTask(taskId, targetColumnId);
    }
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchesTag = selectedTag === 'all' || task.tags.includes(selectedTag);
      return matchesSearch && matchesPriority && matchesTag;
    });
  }, [tasks, searchQuery, selectedPriority, selectedTag]);

  // Extract all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet);
  }, [tasks]);

  // Export / Import Data
  const handleExportData = () => {
    const dataStr = JSON.stringify({ tasks, activityLogs }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'taskflow-backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('Data exported successfully');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.tasks && Array.isArray(parsed.tasks)) {
            setTasks(parsed.tasks);
            if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
            showToast('Data imported successfully');
          } else {
            showToast('Invalid file format', 'error');
          }
        } catch (err) {
          showToast('Failed to parse JSON file', 'error');
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border animate-bounce bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
          }`} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              TaskFlow Pro
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Elite Workspace Management</p>
          </div>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / NAVIGATION */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setCurrentView('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'board'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KanbanSquare className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Backup Actions */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={handleExportData}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Export Backup"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Import Backup"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 overflow-x-auto">
        {currentView === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start min-w-[1000px] xl:min-w-0">
            {COLUMNS.map(column => {
              const columnTasks = filteredTasks.filter(t => t.columnId === column.id);
              return (
                <div
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`rounded-2xl p-4 flex flex-col max-h-[calc(100vh-240px)] min-h-[500px] ${column.color} transition-all duration-200`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-wide uppercase text-slate-700 dark:text-slate-300">
                        {column.title}
                      </h3>
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {columnTasks.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-4 text-center">
                        <p className="text-xs font-medium">Drop tasks here</p>
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const completedSubtasks = task.subTasks.filter(st => st.isCompleted).length;
                        const totalSubtasks = task.subTasks.length;
                        const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing group"
                          >
                            {/* Priority & Actions */}
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingTask(task);
                                    setIsTaskModalOpen(true);
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Title & Description */}
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                              {task.description}
                            </p>

                            {/* Tags */}
                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Subtasks Progress */}
                            {totalSubtasks > 0 && (
                              <div className="mb-3.5">
                                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  <span className="flex items-center gap-1">
                                    <CheckSquare className="w-3 h-3" />
                                    Subtasks
                                  </span>
                                  <span>{completedSubtasks}/{totalSubtasks} ({progressPercentage}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                {/* Quick Subtask Toggle List */}
                                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto pr-1">
                                  {task.subTasks.map(st => (
                                    <button
                                      key={st.id}
                                      onClick={() => handleToggleSubtask(task.id, st.id)}
                                      className="flex items-center gap-1.5 w-full text-left text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                    >
                                      <span className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                                        st.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                      }`}>
                                        {st.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                      </span>
                                      <span className={st.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                                        {st.title}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Footer: Assignee & Due Date */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 rounded-full ${task.assignee.avatarColor} text-white flex items-center justify-center font-bold text-[9px]`}>
                                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="font-medium truncate max-w-[80px]">{task.assignee.name}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className={new Date(task.dueDate) < new Date() && task.columnId !== 'done' ? 'text-rose-500 font-semibold' : ''}>
                                  {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ANALYTICS DASHBOARD VIEW */
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tasks</p>
                  <h3 className="text-2xl font-bold mt-1">{tasks.length}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <BarChart2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Tasks</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {tasks.filter(t => t.columnId === 'done').length}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion Rate</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.columnId === 'done').length / tasks.length) * 100) : 0}%
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgent Tasks</p>
                  <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                    {tasks.filter(t => t.priority === 'urgent' && t.columnId !== 'done').length}
                  </h3>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Charts & Activity Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Distribution Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-500" />
                  Task Distribution by Column
                </h3>
                <div className="h-64 flex items-end justify-around gap-4 pt-6">
                  {COLUMNS.map(col => {
                    const count = tasks.filter(t => t.columnId === col.id).length;
                    const maxCount = Math.max(...COLUMNS.map(c => tasks.filter(t => t.columnId === c.id).length), 1);
                    const heightPercent = (count / maxCount) * 100;

                    return (
                      <div key={col.id} className="flex flex-col items-center w-full group">
                        <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-t-xl h-48 flex items-end overflow-hidden relative">
                          <div 
                            className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-400"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {count}
                          </span>
                        </div>
                        <span className="text-xs font-semibold mt-2 text-slate-600 dark:text-slate-400">{col.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Logs */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Activity Log
                </h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No recent activity</p>
                  ) : (
                    activityLogs.map(log => (
                      <div key={log.id} className="flex gap-3 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-none">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-slate-800 dark:text-slate-200">
                            <span className="font-semibold">{log.taskTitle}</span> {log.action}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TASK CREATION / EDIT MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TaskForm 
              task={editingTask} 
              onSubmit={handleCreateOrUpdateTask} 
              onCancel={() => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TASK FORM COMPONENT
// ==========================================

interface TaskFormProps {
  task: Task | null;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [columnId, setColumnId] = useState<ColumnId>(task?.columnId || 'todo');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || new Date().toISOString().split('T')[0]);
  const [assigneeName, setAssigneeName] = useState(task?.assignee.name || '');
  
  // Subtasks State
  const [subTasks, setSubTasks] = useState<SubTask[]>(task?.subTasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Tags State
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubTasks(prev => [...prev, { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), isCompleted: false }]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubTasks(prev => prev.filter(st => st.id !== id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const avatarColor = task?.assignee.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    onSubmit({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      dueDate,
      assignee: {
        name: assigneeName.trim() || 'Unassigned',
        avatarColor
      },
      tags,
      subTasks
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
      {/* Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Task Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Implement OAuth2 Authentication"
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a detailed description of the task..."
          rows={3}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
      </div>

      {/* Column, Priority & Due Date Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Status
          </label>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value as ColumnId)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {COLUMNS.map(col => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Assignee Name
        </label>
        <input
          type="text"
          value={assigneeName}
          onChange={(e) => setAssigneeName(e.target.value)}
          placeholder="e.g., Sarah Connor"
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Tags Section */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag (e.g., Frontend)"
            className="flex-1 px-3.5 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-800 dark:hover:text-indigo-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Subtasks Section */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Subtasks
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1 px-3.5 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
          {subTasks.map(st => (
            <div key={st.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60">
              <span className="text-xs text-slate-700 dark:text-slate-300">{st.title}</span>
              <button
                type="button"
                onClick={() => handleRemoveSubtask(st.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          {task ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}