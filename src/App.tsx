import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Award,
  ChevronRight,
  CheckSquare,
  Square,
  RefreshCw,
  Sparkles,
  BookMarked,
  Edit3,
  Filter,
  Flame,
  CheckCheck,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  LogOut,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './Auth';

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // Custom Subjects List with local persistence
  const [customSubjects, setCustomSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem('app_custom_subjects');
      return saved
        ? JSON.parse(saved)
        : ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'];
    } catch (e) {
      return ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'];
    }
  });

  // Academic Goals & Deliverables (Journals, Assignments, Notes)
  const [academicItems, setAcademicItems] = useState(() => {
    try {
      const saved = localStorage.getItem('app_academic_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Daily Tasks & Pending/Completed Work
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('app_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Daily Study Routine
  const [routines, setRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('app_routines');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'r1',
              title: 'Morning Problem Solving',
              time: '08:00',
              duration: '60 mins',
              completedToday: false,
            },
            {
              id: 'r2',
              title: 'Evening Revision & Flashcards',
              time: '19:00',
              duration: '45 mins',
              completedToday: false,
            },
          ];
    } catch (e) {
      return [
        {
          id: 'r1',
          title: 'Morning Problem Solving',
          time: '08:00',
          duration: '60 mins',
          completedToday: false,
        },
        {
          id: 'r2',
          title: 'Evening Revision & Flashcards',
          time: '19:00',
          duration: '45 mins',
          completedToday: false,
        },
      ];
    }
  });

  // Notifications permission state
  const [notifPermission, setNotifPermission] = useState('default');

  // Form Modal States
  const [isAddingAcademic, setIsAddingAcademic] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  // Expanded subject filter state
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Form Input States
  const [academicForm, setAcademicForm] = useState({
    title: '',
    type: 'Assignment',
    subject: '',
    dueDate: '',
    submitted: false,
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Study',
    priority: 'Medium',
  });
  const [routineForm, setRoutineForm] = useState({
    title: '',
    time: '09:00',
    duration: '45 mins',
  });

  // Filter state for tasks
  const [taskFilter, setTaskFilter] = useState('all');

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem('app_custom_subjects', JSON.stringify(customSubjects));
  }, [customSubjects]);

  useEffect(() => {
    localStorage.setItem('app_academic_items', JSON.stringify(academicItems));
  }, [academicItems]);

  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('app_routines', JSON.stringify(routines));
  }, [routines]);

  // Subject Management Handlers
  const handleAddSubject = (e) => {
    e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (trimmed && !customSubjects.includes(trimmed)) {
      setCustomSubjects([...customSubjects, trimmed]);
      setNewSubjectInput('');
    }
  };

  const handleDeleteSubject = (subjToDelete) => {
    setCustomSubjects(customSubjects.filter((s) => s !== subjToDelete));
    if (selectedSubjectFilter === subjToDelete) {
      setSelectedSubjectFilter('All');
    }
  };

  // Check Web Notification permissions on load
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Request Notification Permissions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('Study Companion Enabled!', {
          body: 'You will receive reminders for upcoming deadlines and study routines.',
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        });
      }
    }
  };

  // Trigger test notification
  const sendReminderNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      });
    }
  };

  // --- ACADEMIC HANDLERS ---
  const handleAddAcademic = (e) => {
    e.preventDefault();
    if (!academicForm.title || !academicForm.dueDate) return;
    const newItem = {
      id: Date.now().toString(),
      ...academicForm,
      subject: academicForm.subject.trim() || 'General',
      status: 'pending',
    };
    setAcademicItems([newItem, ...academicItems]);
    setAcademicForm({
      title: '',
      type: 'Assignment',
      subject: '',
      dueDate: '',
      submitted: false,
    });
    setIsAddingAcademic(false);
  };

  const toggleAcademicStatus = (id) => {
    setAcademicItems(
      academicItems.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'pending' ? 'completed' : 'pending';
          if (newStatus === 'completed') {
            sendReminderNotification(
              'Great job!',
              `You marked "${item.title}" as completed.`
            );
          }
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const toggleSubmissionStatus = (id) => {
    setAcademicItems(
      academicItems.map((item) => {
        if (item.id === id) {
          const nextSubmitted = !item.submitted;
          if (nextSubmitted) {
            sendReminderNotification(
              'Assignment Submitted!',
              `"${item.title}" marked as submitted.`
            );
          }
          return { ...item, submitted: nextSubmitted };
        }
        return item;
      })
    );
  };

  const deleteAcademic = (id) => {
    setAcademicItems(academicItems.filter((item) => item.id !== id));
  };

  // --- TASK HANDLERS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    const newTask = {
      id: Date.now().toString(),
      ...taskForm,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setTaskForm({ title: '', category: 'Study', priority: 'Medium' });
    setIsAddingTask(false);
  };

  const toggleTaskStatus = (id) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: task.status === 'pending' ? 'completed' : 'pending',
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // --- ROUTINE HANDLERS ---
  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!routineForm.title) return;
    const newRoutine = {
      id: Date.now().toString(),
      ...routineForm,
      completedToday: false,
    };
    setRoutines([...routines, newRoutine]);
    setRoutineForm({ title: '', time: '09:00', duration: '45 mins' });
    setIsAddingRoutine(false);
  };

  const toggleRoutineToday = (id) => {
    setRoutines(
      routines.map((r) =>
        r.id === id ? { ...r, completedToday: !r.completedToday } : r
      )
    );
  };

  const deleteRoutine = (id) => {
    setRoutines(routines.filter((r) => r.id !== id));
  };

  const resetDailyRoutines = () => {
    setRoutines(routines.map((r) => ({ ...r, completedToday: false })));
  };

  // --- DERIVED LISTS & DATA ---
  const pendingAcademic = useMemo(() => {
    return academicItems
      .filter((item) => item.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [academicItems]);

  const assignmentsList = useMemo(() => {
    return academicItems.filter((item) => item.type === 'Assignment');
  }, [academicItems]);

  const completedAcademicItems = useMemo(() => {
    return academicItems.filter((item) => item.status === 'completed');
  }, [academicItems]);

  const completedTasksList = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed');
  }, [tasks]);

  const subjectsList = useMemo(() => {
    const fromItems = academicItems
      .map((i) => i.subject?.trim())
      .filter(Boolean);
    const combined = Array.from(new Set([...customSubjects, ...fromItems]));
    return combined;
  }, [academicItems, customSubjects]);

  const urgentAcademicCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return pendingAcademic.filter((item) => {
      const due = new Date(item.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).length;
  }, [pendingAcademic]);

  // Helper for due date label styling
  const getDueDateLabel = (dueDateStr) => {
    if (!dueDateStr)
      return {
        label: 'No Due Date',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
      };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        label: `Overdue by ${Math.abs(diffDays)} days`,
        color: 'bg-red-100 text-red-700 border-red-300',
      };
    if (diffDays === 0)
      return {
        label: 'Due Today!',
        color:
          'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse',
      };
    if (diffDays === 1)
      return {
        label: 'Due Tomorrow',
        color: 'bg-orange-100 text-orange-700 border-orange-300',
      };
    if (diffDays <= 3)
      return {
        label: `Due in ${diffDays} days`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    return {
      label: `Due: ${dueDateStr}`,
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  };

  // If loading authentication status
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
        Loading...
      </div>
    );
  }

  // If user is not logged in, show the Auth screen
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-md shadow-indigo-200 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                SpideyTrack
              </h1>
              <p className="text-xs text-slate-500">
                Academic & Work Companion ({session.user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notification Button */}
            <button
              onClick={requestNotificationPermission}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                notifPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {notifPermission === 'granted' ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alerts On</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Enable Alerts</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        {/* --- DESKTOP NAV TABS --- */}
        <div className="hidden md:flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BookMarked },
            { id: 'assignments', label: 'Assignments Tracker', icon: FileText },
            { id: 'subjects', label: 'By Subject', icon: Layers },
            { id: 'completed', label: 'Completed Works', icon: CheckCheck },
            { id: 'tasks', label: 'Pending & Tasks', icon: CheckSquare },
            { id: 'routine', label: 'Daily Routine', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD (HOME SCREEN)                            */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Work
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-black text-indigo-600">
                    {pendingAcademic.length}
                  </span>
                  <span className="text-xs text-slate-500">Items</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Urgent (≤3 Days)
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span
                    className={`text-2xl font-black ${
                      urgentAcademicCount > 0
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {urgentAcademicCount}
                  </span>
                  <span className="text-xs text-slate-500">Items</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Completed Works
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-black text-emerald-600">
                    {completedAcademicItems.length + completedTasksList.length}
                  </span>
                  <span className="text-xs text-slate-500">Done</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Submitted Assignments
                </span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-black text-blue-600">
                    {assignmentsList.filter((a) => a.submitted).length}/
                    {assignmentsList.length}
                  </span>
                  <span className="text-xs text-slate-500">Sent</span>
                </div>
              </div>
            </div>

            {/* --- HOME SCREEN ACADEMIC GOALS & DUE DATES --- */}
            <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <BookMarked className="w-5 h-5 text-indigo-600" />
                    <span>Pending Journals, Assignments & Notes</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic deliverables due sorted by deadline
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingAcademic(true)}
                  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Item</span>
                </button>
              </div>

              {pendingAcademic.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 text-sm">
                    All caught up!
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    No pending assignments, journals, or notes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAcademic.map((item) => {
                    const dueInfo = getDueDateLabel(item.dueDate);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-start space-x-3 pr-2">
                          <button
                            onClick={() => toggleAcademicStatus(item.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                            title="Mark Completed"
                          >
                            <Square className="w-5 h-5" />
                          </button>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="font-semibold text-slate-900 text-sm">
                                {item.title}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                                  item.type === 'Journal'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : item.type === 'Assignment'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-teal-50 text-teal-700 border-teal-200'
                                }`}
                              >
                                {item.type}
                              </span>
                              {item.subject && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                                  {item.subject}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center space-x-2 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${dueInfo.color}`}
                              >
                                {dueInfo.label}
                              </span>
                              {item.type === 'Assignment' && (
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                                    item.submitted
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {item.submitted
                                    ? '✓ Submitted'
                                    : '⚡ Pending Submission'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteAcademic(item.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Daily Routine Summary Card */}
            <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Today's Routine Checklist</span>
                </h2>
                <button
                  onClick={() => setActiveTab('routine')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
                >
                  Manage Routine <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {routines.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => toggleRoutineToday(r.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      r.completedToday
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {r.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium leading-tight ${
                            r.completedToday
                              ? 'line-through text-slate-400'
                              : ''
                          }`}
                        >
                          {r.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {r.time} ({r.duration})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASSIGNMENTS TAB WITH SUBMISSION CHECKLIST          */}
        {/* ========================================================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Assignments Tracker
                </h2>
                <p className="text-xs text-slate-500">
                  Dedicated checklist to track assignment completion &
                  submission status.
                </p>
              </div>
              <button
                onClick={() => {
                  setAcademicForm({ ...academicForm, type: 'Assignment' });
                  setIsAddingAcademic(true);
                }}
                className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Assignment</span>
              </button>
            </div>

            <div className="space-y-3">
              {assignmentsList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">
                    No assignments added yet.
                  </p>
                </div>
              ) : (
                assignmentsList.map((item) => {
                  const dueInfo = getDueDateLabel(item.dueDate);
                  const isDone = item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isDone
                          ? 'border-slate-200 bg-slate-50/70'
                          : 'border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleAcademicStatus(item.id)}
                          className="mt-1 text-slate-400 hover:text-emerald-600 transition"
                          title="Toggle completed state"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <Square className="w-6 h-6" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3
                              className={`font-semibold text-base ${
                                isDone
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </h3>
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                              {item.subject}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2 text-xs">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${dueInfo.color}`}
                            >
                              {dueInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Checklist: Submission status */}
                      <div className="flex items-center space-x-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-between md:justify-end">
                        <button
                          onClick={() => toggleSubmissionStatus(item.id)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            item.submitted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {item.submitted ? 'Submitted ✓' : 'Not Submitted'}
                          </span>
                        </button>

                        <button
                          onClick={() => deleteAcademic(item.id)}
                          className="text-slate-300 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SUBJECT-WISE ORGANIZER                             */}
        {/* ========================================================= */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Subjects Manager
                </h2>
                <p className="text-xs text-slate-500">
                  Manage your course subjects and filter work by subject.
                </p>
              </div>
            </div>

            {/* Manage Custom Subjects Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>My Subjects List</span>
              </h3>

              <form onSubmit={handleAddSubject} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new subject (e.g. Organic Chemistry)"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Add Subject
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {customSubjects.map((subj) => (
                  <span
                    key={subj}
                    className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl text-xs font-semibold"
                  >
                    <span>{subj}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(subj)}
                      className="text-indigo-400 hover:text-red-500 transition ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedSubjectFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubjectFilter === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Subjects ({academicItems.length})
              </button>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubjectFilter(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedSubjectFilter === subj
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {subj} (
                  {academicItems.filter((i) => i.subject === subj).length})
                </button>
              ))}
            </div>

            {/* Subject Cards */}
            <div className="space-y-4">
              {subjectsList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No subjects added yet. Add your course subjects above!
                </p>
              ) : (
                subjectsList
                  .filter(
                    (s) =>
                      selectedSubjectFilter === 'All' ||
                      selectedSubjectFilter === s
                  )
                  .map((subj) => {
                    const itemsForSubj = academicItems.filter(
                      (i) => i.subject === subj
                    );
                    return (
                      <div
                        key={subj}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-bold text-base text-slate-900">
                              {subj}
                            </h3>
                          </div>
                          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-md">
                            {itemsForSubj.length} deliverables
                          </span>
                        </div>

                        {itemsForSubj.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">
                            No pending items for this subject.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {itemsForSubj.map((item) => {
                              const dueInfo = getDueDateLabel(item.dueDate);
                              return (
                                <div
                                  key={item.id}
                                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                                >
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() =>
                                        toggleAcademicStatus(item.id)
                                      }
                                      className="text-slate-400 hover:text-emerald-600"
                                    >
                                      {item.status === 'completed' ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                      ) : (
                                        <Square className="w-5 h-5" />
                                      )}
                                    </button>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-sm font-semibold ${
                                            item.status === 'completed'
                                              ? 'line-through text-slate-400'
                                              : 'text-slate-800'
                                          }`}
                                        >
                                          {item.title}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                          {item.type}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        Due: {item.dueDate}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${dueInfo.color}`}
                                  >
                                    {dueInfo.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COMPLETED WORKS                                    */}
        {/* ========================================================= */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Completed Works
              </h2>
              <p className="text-xs text-slate-500">
                Archive of finished academic goals and general tasks.
              </p>
            </div>

            <div className="space-y-3">
              {completedAcademicItems.length === 0 &&
              completedTasksList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">
                    No completed items yet. Keep going!
                  </p>
                </div>
              ) : (
                <>
                  {completedAcademicItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/30 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleAcademicStatus(item.id)}
                          className="text-emerald-600"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 line-through">
                            {item.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {item.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              • {item.subject}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAcademic(item.id)}
                        className="text-slate-300 hover:text-red-500 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {completedTasksList.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="text-emerald-600"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 line-through">
                            {task.title}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            Task ({task.category})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DAILY TASKS & PENDING WORKS                        */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Task Center
                </h2>
                <p className="text-xs text-slate-500">
                  Manage daily general works and check off completed tasks.
                </p>
              </div>
              <button
                onClick={() => setIsAddingTask(true)}
                className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit text-xs font-semibold">
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    taskFilter === f
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Task Items List */}
            <div className="space-y-2.5">
              {tasks
                .filter((t) =>
                  taskFilter === 'all' ? true : t.status === taskFilter
                )
                .map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border bg-white flex items-center justify-between transition-all ${
                      task.status === 'completed'
                        ? 'opacity-60 border-slate-200 bg-slate-50'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-emerald-600 transition"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <p
                          className={`text-sm font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                            {task.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              task.priority === 'High'
                                ? 'bg-red-50 text-red-600'
                                : task.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-300 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: DAILY STUDY ROUTINE                                */}
        {/* ========================================================= */}
        {activeTab === 'routine' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Daily Study Routine
                </h2>
                <p className="text-xs text-slate-500">
                  Set recurring timetable blocks and track daily completion.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetDailyRoutines}
                  title="Reset daily progress"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddingRoutine(true)}
                  className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Routine</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {routines.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl border transition-all bg-white shadow-sm flex items-center justify-between ${
                    r.completedToday
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleRoutineToday(r.id)}
                      className="text-slate-400 hover:text-emerald-600 transition"
                    >
                      {r.completedToday ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`font-semibold text-sm ${
                          r.completedToday
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {r.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {r.time}
                        </span>
                        <span>•</span>
                        <span>{r.duration}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteRoutine(r.id)}
                    className="text-slate-300 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-2 py-2">
        <div className="flex justify-around items-center">
          {[
            { id: 'dashboard', label: 'Home', icon: BookMarked },
            { id: 'assignments', label: 'Assignments', icon: FileText },
            { id: 'subjects', label: 'Subjects', icon: Layers },
            { id: 'completed', label: 'Completed', icon: CheckCheck },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'scale-110' : ''
                  } transition-transform`}
                />
                <span className="text-[9px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MODAL: ADD ACADEMIC ITEM                                 */}
      {/* ========================================================= */}
      {isAddingAcademic && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add Academic Goal / Work
            </h3>
            <form onSubmit={handleAddAcademic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chem Lab Journal"
                  value={academicForm.title}
                  onChange={(e) =>
                    setAcademicForm({ ...academicForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={academicForm.type}
                    onChange={(e) =>
                      setAcademicForm({ ...academicForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Journal">Journal</option>
                    <option value="Notes">Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={academicForm.subject}
                    onChange={(e) =>
                      setAcademicForm({
                        ...academicForm,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    {customSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={academicForm.dueDate}
                  onChange={(e) =>
                    setAcademicForm({
                      ...academicForm,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAcademic(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD TASK                                           */}
      {/* ========================================================= */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Review Flashcards"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. General Work"
                    value={taskForm.category}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD ROUTINE                                        */}
      {/* ========================================================= */}
      {isAddingRoutine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add Study Routine Block
            </h3>
            <form onSubmit={handleAddRoutine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Night Coding Session"
                  value={routineForm.title}
                  onChange={(e) =>
                    setRoutineForm({ ...routineForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={routineForm.time}
                    onChange={(e) =>
                      setRoutineForm({ ...routineForm, time: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={routineForm.duration}
                    onChange={(e) =>
                      setRoutineForm({
                        ...routineForm,
                        duration: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRoutine(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Add to Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}