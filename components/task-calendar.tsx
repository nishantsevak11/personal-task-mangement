'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from './calendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from './ui/button';
import { AddTaskDialog } from './add-task-dialog';
import { TaskActions } from './task-actions';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  projectId: number | null;
}

async function fetchTasks(startDate: Date, endDate: Date) {
  const response = await fetch(
    `/api/tasks?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export function TaskCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', format(selectedDate, 'yyyy-MM')],
    queryFn: () =>
      fetchTasks(startOfMonth(selectedDate), endOfMonth(selectedDate)),
  });

  const tasksByDate = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    if (task.dueDate) {
      const date = format(new Date(task.dueDate), 'yyyy-MM-dd');
      acc[date] = acc[date] || [];
      acc[date].push(task);
    }
    return acc;
  }, {});

  function getDayContent(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateStr] || [];
    return dayTasks.length > 0 ? (
      <div className="relative w-full h-full">
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-indigo-400 rounded-full" />
          {dayTasks.length > 1 && (
            <span className="absolute -top-4 right-0 text-xs font-medium text-indigo-600">
              {dayTasks.length}
            </span>
          )}
        </div>
      </div>
    ) : null;
  }

  const selectedDateTasks = selectedDate
    ? tasksByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border shadow"
          components={{
            DayContent: ({ date }) => getDayContent(date),
          }}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : selectedDateTasks.length > 0 ? (
          <div className="space-y-3">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-medium truncate">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.status}
                  </span>
                  <TaskActions task={task} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No tasks scheduled for this day
          </div>
        )}
      </div>

      {isAddingTask && (
        <AddTaskDialog
          selectedDate={selectedDate}
          onClose={() => setIsAddingTask(false)}
        />
      )}
    </div>
  );
}
