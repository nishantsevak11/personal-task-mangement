'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { AddTaskDialog } from './add-task-dialog';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

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
        .react-day-picker {
          width: 100%;
          border: none;
          font-family: inherit;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          border-radius: 0.5rem;
        }
        .react-day-picker__month {
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
        .react-day-picker__day {
          color: #374151;
        }
        .react-day-picker__day--weekend {
          color: #ef4444;
        }
        .react-day-picker__day--neighboringMonth {
          color: #9ca3af;
        }
        .react-day-picker__day:enabled:hover,
        .react-day-picker__day:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-day-picker__day--selected {
          background-color: #3b82f6 !important;
          color: white;
        }
        .react-day-picker__day--today {
          background-color: #f3f4f6;
        }
        .react-day-picker__navigation {
          margin-bottom: 0;
        }
        .react-day-picker__navigation button {
          min-width: 44px;
          background: none;
          font-size: 0.875rem;
          color: #374151;
        }
        .react-day-picker__navigation button:enabled:hover,
        .react-day-picker__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-day-picker__navigation button[disabled] {
          background-color: #f9fafb;
        }
      `}</style>
      <DayPicker
        showOutsideDays={true}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium dark:text-gray-200",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent dark:text-gray-300",
            "bg-blue-50"
          ),
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-white"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground dark:bg-primary dark:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground dark:bg-gray-700 dark:text-white",
          day_outside:
            "day-outside text-muted-foreground opacity-50 dark:text-gray-500",
          day_disabled: "text-muted-foreground opacity-50 dark:text-gray-600",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-200",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 dark:text-gray-400" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 dark:text-gray-400" />,
          NavButton: ({ ...props }) => <Button {...props} />,
        }}
        tileContent={renderTileContent}
      />
      <AddTaskDialog
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        defaultDate={selectedDate || new Date()}
      />
    </div>
  );
}
