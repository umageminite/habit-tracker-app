'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import HabitCard from '@/components/HabitCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getTodayString } from '@/utils/dateHelpers';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
  });

  // Loading states for actions
  const [savingHabit, setSavingHabit] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Delete confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.data.user);
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch habits from API
  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/habits');
      const result = await response.json();

      if (result.success) {
        setHabits(result.data.habits);
      } else {
        if (result.error.code === 'UNAUTHORIZED') {
          router.push('/login');
        } else {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError('Failed to load habits');
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load habits after auth is confirmed
  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  // Toggle habit completion
  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const response = await fetch(`/api/habits/${id}/toggle`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        // Update local state with the updated habit
        setHabits(habits.map(habit =>
          habit.id === id ? result.data : habit
        ));

        // Show success toast
        const wasCompleted = habits.find(h => h.id === id)?.completedToday;
        if (wasCompleted) {
          toast.success('Habit unmarked!');
        } else {
          toast.success('Great job! Keep the streak going! 🔥');
        }
      } else {
        toast.error(result.error.message || 'Failed to toggle habit');
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  // Show delete confirmation
  const handleDeleteClick = (habit) => {
    setConfirmDelete(habit);
  };

  // Delete habit after confirmation
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    const id = confirmDelete.id;
    setDeletingId(id);

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setHabits(habits.filter(habit => habit.id !== id));
        toast.success(`"${confirmDelete.name}" deleted successfully`);
        setConfirmDelete(null);
      } else {
        toast.error(result.error.message || 'Failed to delete habit');
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
      toast.error('Failed to delete habit. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Add new habit
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    setSavingHabit(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabit.name,
          description: newHabit.description,
          frequency: newHabit.frequency,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setHabits([...habits, result.data]);
        setNewHabit({ name: '', description: '', frequency: 'daily' });
        setShowAddForm(false);
        toast.success('Habit created successfully! 🎉');
      } else {
        toast.error(result.error.message || 'Failed to create habit');
      }
    } catch (err) {
      console.error('Error creating habit:', err);
      toast.error('Failed to create habit. Please try again.');
    } finally {
      setSavingHabit(false);
    }
  };

  // Set habit for editing
  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setNewHabit({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
    });
    setShowAddForm(false);
  };

  // Update habit
  const handleUpdateHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.name.trim() || !editingHabit) return;

    setSavingHabit(true);
    try {
      const response = await fetch(`/api/habits/${editingHabit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabit.name,
          description: newHabit.description,
          frequency: newHabit.frequency,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setHabits(habits.map(habit =>
          habit.id === editingHabit.id ? result.data : habit
        ));
        setNewHabit({ name: '', description: '', frequency: 'daily' });
        setEditingHabit(null);
        toast.success('Habit updated successfully! ✅');
      } else {
        toast.error(result.error.message || 'Failed to update habit');
      }
    } catch (err) {
      console.error('Error updating habit:', err);
      toast.error('Failed to update habit. Please try again.');
    } finally {
      setSavingHabit(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingHabit(null);
    setNewHabit({ name: '', description: '', frequency: 'daily' });
  };

  // Daily reset mechanism - call API to reset all habits
  const resetDailyHabits = async () => {
    try {
      const response = await fetch('/api/habits/reset', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        // Refresh habits list
        fetchHabits();
      }
    } catch (err) {
      console.error('Error resetting habits:', err);
    }
  };

  // Run daily reset on component mount and when day changes
  useEffect(() => {
    const lastResetDate = localStorage.getItem('lastResetDate');
    const today = getTodayString();

    if (lastResetDate !== today) {
      resetDailyHabits();
      localStorage.setItem('lastResetDate', today);
    }

    // Check for day change every minute
    const interval = setInterval(() => {
      const currentDate = getTodayString();
      const storedDate = localStorage.getItem('lastResetDate');

      if (storedDate !== currentDate) {
        resetDailyHabits();
        localStorage.setItem('lastResetDate', currentDate);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Message */}
        {user && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Track your daily habits and build a better you
            </p>
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-200"
            role="region"
            aria-label="Total habits statistic"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-600">Total Habits</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900" aria-live="polite">{habits.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-200"
            role="region"
            aria-label="Completed today statistic"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-600">Completed Today</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900" aria-live="polite">{completedCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-200"
            role="region"
            aria-label="Total streak statistic"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-600">Total Streak</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900" aria-live="polite">{totalStreak}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-xl sm:text-2xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Habits</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            aria-expanded={showAddForm}
            aria-controls="add-habit-form"
            className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Habit
          </button>
        </div>

        {/* Add/Edit Habit Form */}
        {(showAddForm || editingHabit) && (
          <div
            id="habit-form"
            className="mb-5 sm:mb-6 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200"
            role="form"
            aria-label={editingHabit ? "Edit habit form" : "Add new habit form"}
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h3>
            <form onSubmit={editingHabit ? handleUpdateHabit : handleAddHabit} className="space-y-4">
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Habit Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="habit-name"
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  placeholder="e.g., Morning Exercise"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  id="habit-description"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Optional description"
                  rows="2"
                  aria-describedby="description-hint"
                />
                <p id="description-hint" className="mt-1 text-xs text-gray-500">
                  Optional: Add details about your habit
                </p>
              </div>

              <div>
                <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Frequency
                </label>
                <select
                  id="habit-frequency"
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingHabit}
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingHabit && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {savingHabit ? 'Saving...' : (editingHabit ? 'Update Habit' : 'Add Habit')}
                </button>
                <button
                  type="button"
                  onClick={editingHabit ? handleCancelEdit : () => setShowAddForm(false)}
                  disabled={savingHabit}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 sm:py-16 lg:py-20" role="status" aria-live="polite">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading habits...</p>
            </div>
          </div>
        ) : habits.length === 0 ? (
          <div
            className="text-center py-12 sm:py-16 lg:py-20"
            role="status"
            aria-live="polite"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No habits yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
                Start building better habits today. Click the "Add Habit" button above to create your first habit.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onDelete={handleDeleteClick}
                onEdit={handleEditHabit}
                isToggling={togglingId === habit.id}
                isDeleting={deletingId === habit.id}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Habit"
          message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
        />
      </main>
    </div>
  );
}
