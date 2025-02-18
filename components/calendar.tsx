'use client';

import * as React from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { AddTaskDialog } from './add-task-dialog';

interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  status: string;
}

interface CalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ className, onDateSelect }: CalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [openPopoverDate, setOpenPopoverDate] = React.useState<Date | null>(null);
  const [isAddingTask, setIsAddingTask] = React.useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === dateStr;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (getTasksForDate(date).length === 0) {
      handleAddTask(date);
    } else {
      setOpenPopoverDate(date);
    }
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setOpenPopoverDate(null);
    setIsAddingTask(true);
  };

  const renderTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const tasksForDate = getTasksForDate(date);
    const isOpen = openPopoverDate && 
      openPopoverDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];

    return (
      <>
        {tasksForDate.length > 0 ? (
          <Popover open={isOpen} onOpenChange={(open) => {
            if (open) {
              setOpenPopoverDate(date);
            } else {
              setOpenPopoverDate(null);
            }
          }}>
            <PopoverTrigger asChild>
              <div 
                className="absolute bottom-1 left-0 right-0 flex justify-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPopoverDate(isOpen ? null : date);
                }}
              >
                {tasksForDate.map((task) => (
                  <div
                    key={task.id}
                    className={`w-2 h-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                ))}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">
                  Tasks for {format(date, 'MMM d, yyyy')}
                </h4>
                <Button
                  size="sm"
                  onClick={() => handleAddTask(date)}
                >
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {tasksForDate.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg border bg-card text-card-foreground"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className="absolute bottom-1 left-0 right-0 flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-2 h-2 rounded-full bg-transparent border border-gray-300" />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={className}>
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
          cursor: pointer;
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
        .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white;
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
          font-size: 0.875rem;
          color: #374151;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__navigation button[disabled] {
          background-color: #f9fafb;
        }
      `}</style>
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
      <AddTaskDialog
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        defaultDate={selectedDate || new Date()}
      />
    </div>
  );
}
