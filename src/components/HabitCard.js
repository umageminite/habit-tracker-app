'use client';

export default function HabitCard({ habit, onToggle, onDelete, onEdit, isToggling, isDeleting }) {
  return (
    <article
      className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-lg shadow-lg hover:shadow-xl focus-within:shadow-xl transition-all duration-200 p-4 sm:p-6 border border-purple-600 hover:border-purple-400"
      aria-label={`Habit: ${habit.name}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(habit.id)}
            disabled={isToggling || isDeleting}
            aria-label={habit.completedToday ? `Mark "${habit.name}" as incomplete` : `Mark "${habit.name}" as complete`}
            aria-pressed={habit.completedToday}
            className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-800 disabled:opacity-50 disabled:cursor-not-allowed ${
              habit.completedToday
                ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                : 'border-purple-300 hover:border-green-400 hover:bg-green-500/20'
            }`}
          >
            {isToggling ? (
              <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : habit.completedToday ? (
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : null}
          </button>
          <h3 className={`text-base sm:text-lg font-semibold truncate ${
            habit.completedToday
              ? 'text-purple-200 line-through'
              : 'text-white'
          }`}>
            {habit.name}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(habit)}
            disabled={isToggling || isDeleting}
            aria-label={`Edit habit "${habit.name}"`}
            className="flex-shrink-0 text-purple-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-800 rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(habit)}
            disabled={isToggling || isDeleting}
            aria-label={`Delete habit "${habit.name}"`}
            className="flex-shrink-0 text-purple-200 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-800 rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-sm sm:text-base text-purple-100 mb-3 pl-8 sm:pl-10">
          {habit.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-10">
        <span
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
            habit.frequency === 'daily'
              ? 'bg-purple-200 text-purple-900'
              : 'bg-pink-200 text-pink-900'
          }`}
          aria-label={`Frequency: ${habit.frequency}`}
        >
          {habit.frequency}
        </span>
        {habit.streak > 0 && (
          <span
            className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-900"
            aria-label={`${habit.streak} day streak`}
          >
            🔥 {habit.streak} day{habit.streak > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </article>
  );
}
