'use client';

import { Task } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface TaskCalendarProps {
  tasks: Task[];
  selectedDate: Date | null;
  onSelect: (date: Date | null) => void;
}

export function TaskCalendar({ tasks, selectedDate, onSelect }: TaskCalendarProps) {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate).toDateString() === date.toDateString()
    );
  };

  const renderTileContent = (date: Date) => {
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length === 0) return null;

    const priorityCounts = {
      high: tasksForDate.filter((task) => task.priority === 'high').length,
      medium: tasksForDate.filter((task) => task.priority === 'medium').length,
      low: tasksForDate.filter((task) => task.priority === 'low').length,
    };

    return (
      <div className="flex flex-col items-center mt-1">
        {priorityCounts.high > 0 && (
          <div className="w-2 h-2 rounded-full bg-red-500 mb-0.5" />
        )}
        {priorityCounts.medium > 0 && (
          <div className="w-2 h-2 rounded-full bg-yellow-500 mb-0.5" />
        )}
        {priorityCounts.low > 0 && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
      </div>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate || undefined}
      onSelect={onSelect}
      className="rounded-md border shadow-sm"
      components={{
        DayContent: ({ date }) => (
          <div className="relative w-full h-full">
            <div>{date.getDate()}</div>
            {renderTileContent(date)}
          </div>
        ),
      }}
    />
  );
}
