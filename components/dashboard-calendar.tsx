'use client';

import * as React from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  status: string;
}

interface DashboardCalendarProps {
  tasks: Task[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  onAddTask: (date: Date) => void;
}

export function DashboardCalendar({ tasks, selectedDate, setSelectedDate, onAddTask }: DashboardCalendarProps) {
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === dateStr;
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
              <h2 className="text-lg font-semibold">
                Tasks for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <Button onClick={() => onAddTask(selectedDate)} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="text-gray-500 flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg text-center">
                <p className="mb-4">No tasks scheduled for this day</p>
                <Button onClick={() => onAddTask(selectedDate)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Create Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          task.priority === 'high' && 'bg-red-500',
                          task.priority === 'medium' && 'bg-yellow-500',
                          task.priority === 'low' && 'bg-blue-500'
                        )}
                      />
                      <span className={cn(
                        task.status === 'completed' && 'line-through text-gray-400'
                      )}>{task.title}</span>
                    </div>
                    <span className="text-sm text-gray-500 capitalize">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          border-radius: 0.5rem;
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
        .react-calendar__month-view__days__day {
          color: #374151;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #9ca3af;
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
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__navigation button[disabled] {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
