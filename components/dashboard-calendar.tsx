'use client';

import * as React from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { AddTaskDialog } from './add-task-dialog';
import { enUS } from 'date-fns/locale';

interface Task {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string | null;
}

interface DashboardCalendarProps {
  tasks: Task[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
}

export function DashboardCalendar({ 
  tasks, 
  selectedDate, 
  setSelectedDate
}: DashboardCalendarProps) {
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return format(taskDate, 'yyyy-MM-dd') === dateStr;
    });
  };

  const renderTileContent = ({ date }: { date: Date }) => {
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length === 0) return null;

    const priorityCount = {
      high: tasksForDate.filter(t => t.priority === 'high').length,
      medium: tasksForDate.filter(t => t.priority === 'medium').length,
      low: tasksForDate.filter(t => t.priority === 'low').length,
    };

    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {priorityCount.high > 0 && (
          <div className="w-2 h-2 rounded-full bg-red-500" />
        )}
        {priorityCount.medium > 0 && (
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
        )}
        {priorityCount.low > 0 && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
      </div>
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <div className="md:col-span-3">
        <ReactCalendar
          value={selectedDate}
          onChange={handleDateClick}
          tileContent={renderTileContent}
          className="rounded-lg shadow-sm"
          locale="en-US"
          formatDay={(locale, date) => format(date, 'd')}
          formatMonthYear={(locale, date) => format(date, 'MMMM yyyy', { locale: enUS })}
          tileClassName={({ date }) => {
            const isSelected = selectedDate && 
              date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
            return isSelected ? 'bg-blue-50' : '';
          }}
        />
      </div>

      <div className="md:col-span-2">
        {selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-gray-200">
                Tasks for {format(selectedDate, 'MMMM d, yyyy', { locale: enUS })}
              </h2>
              <AddTaskDialog defaultDate={selectedDate}>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <Plus className="h-4 w-4" /> Add Task
                </Button>
              </AddTaskDialog>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="mb-4">No tasks scheduled for this day</p>
                <AddTaskDialog defaultDate={selectedDate}>
                  <Button variant="outline" size="sm" className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
                    <Plus className="h-4 w-4 mr-1" /> Create Task
                  </Button>
                </AddTaskDialog>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((task) => (
                  <Card key={task.id} className={cn(
                    "dark:bg-gray-800/50 dark:border-gray-700 transition-all duration-200 hover:shadow-md dark:hover:shadow-black/20",
                    task.priority === 'high' && "border-l-4 border-l-red-500",
                    task.priority === 'medium' && "border-l-4 border-l-yellow-500",
                    task.priority === 'low' && "border-l-4 border-l-blue-500",
                    task.status === 'completed' && "opacity-75"
                  )}>
                    <CardHeader className="p-4">
                      <CardTitle className={cn(
                        "text-base font-medium dark:text-gray-200",
                        task.status === 'completed' && "line-through"
                      )}>
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="capitalize flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            task.priority === 'high' && "bg-red-500",
                            task.priority === 'medium' && "bg-yellow-500",
                            task.priority === 'low' && "bg-blue-500"
                          )} />
                          {task.priority} Priority
                        </span>
                        <span className={cn(
                          "capitalize px-2 py-1 rounded text-xs",
                          task.status === 'todo' && "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                          task.status === 'in-progress' && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
                          task.status === 'completed' && "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        )}>
                          {task.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

<style jsx global>{`
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    border-radius: 0.5rem;
  }

  :global(.dark) .react-calendar {
    background: rgb(31 41 55);
    color: rgb(229 231 235);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .react-calendar__tile {
    position: relative;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 8px;
    font-size: 0.875rem;
  }

  :global(.dark) .react-calendar__tile:enabled:hover,
  :global(.dark) .react-calendar__tile:enabled:focus,
  :global(.dark) .react-calendar__tile--now {
    background-color: rgb(55 65 81);
    color: rgb(229 231 235);
  }

  :global(.dark) .react-calendar__tile--active {
    background-color: rgb(37 99 235) !important;
    color: white !important;
  }

  :global(.dark) .react-calendar__tile--active:enabled:hover,
  :global(.dark) .react-calendar__tile--active:enabled:focus {
    background-color: rgb(29 78 216) !important;
  }

  .react-calendar__month-view__days__day {
    color: #374151;
  }

  :global(.dark) .react-calendar__month-view__days__day {
    color: rgb(229 231 235);
  }

  .react-calendar__month-view__days__day--weekend {
    color: #ef4444;
  }

  :global(.dark) .react-calendar__month-view__days__day--weekend {
    color: rgb(248 113 113);
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: #9ca3af;
  }

  :global(.dark) .react-calendar__month-view__days__day--neighboringMonth {
    color: rgb(156 163 175);
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f3f4f6;
  }

  .react-calendar__tile--now {
    background-color: #f3f4f6;
  }

  .react-calendar__navigation {
    margin-bottom: 0;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
    color: inherit;
  }

  :global(.dark) .react-calendar__navigation button:disabled {
    background-color: rgb(55 65 81);
    color: rgb(156 163 175);
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f3f4f6;
  }

  :global(.dark) .react-calendar__navigation button:enabled:hover,
  :global(.dark) .react-calendar__navigation button:enabled:focus {
    background-color: rgb(55 65 81);
  }

  .react-calendar__navigation button[disabled] {
    background-color: #f3f4f6;
  }

  :global(.dark) .react-calendar__month-view__weekdays {
    color: rgb(156 163 175);
  }

  :global(.dark) .react-calendar__month-view__weekdays__weekday {
    color: rgb(156 163 175);
  }

  :global(.dark) .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }
`}</style>
