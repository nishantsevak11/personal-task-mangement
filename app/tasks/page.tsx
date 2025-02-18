'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search, CheckCircle2, Circle, AlertCircle, ArrowUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
}

type SortField = 'dueDate' | 'priority' | 'status' | 'title';
type SortOrder = 'asc' | 'desc';

async function fetchTasks() {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export default function TasksPage() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggleStatus = (task: Task) => {
    updateTaskStatus.mutate({
      id: task.id,
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddTask = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsAddingTask(true);
  };

  const filteredAndSortedTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return order;
          if (!b.dueDate) return -order;
          return order * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return order * (priorityOrder[a.priority as keyof typeof priorityOrder] - 
                         priorityOrder[b.priority as keyof typeof priorityOrder]);
        }
        
        case 'status': {
          const statusOrder = { completed: 2, in_progress: 1, pending: 0 };
          return order * (statusOrder[a.status as keyof typeof statusOrder] - 
                         statusOrder[b.status as keyof typeof statusOrder]);
        }
        
        case 'title':
          return order * a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button 
          onClick={() => handleAddTask()} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1"
                    >
                      Title
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center gap-1"
                    >
                      Priority
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center gap-1"
                    >
                      Due Date
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTasks.map((task) => (
                  <tr key={task.id} className="border-b">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          task.status === 'completed' && 'line-through text-gray-500'
                        )}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          task.priority === 'high' && 'bg-red-100 text-red-700',
                          task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                          task.priority === 'low' && 'bg-green-100 text-green-700'
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {task.dueDate ? (
                        <span
                          className={cn(
                            'text-sm',
                            new Date(task.dueDate) < new Date() &&
                              task.status !== 'completed' &&
                              'text-red-500'
                          )}
                        >
                          {format(new Date(task.dueDate), 'PP')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              tasks={tasks}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onAddTask={handleAddTask}
            />
          </CardContent>
        </Card>
      </div>

      <AddTaskDialog
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        defaultDate={selectedDate}
      />
    </div>
  );
}
