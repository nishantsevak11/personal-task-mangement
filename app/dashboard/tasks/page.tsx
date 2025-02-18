'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, ArrowUpDown, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { EditTaskDialog } from '@/components/edit-task-dialog';
import { TaskCalendar } from '@/components/task-calendar';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  projectId: number | null;
}

type SortField = 'title' | 'priority' | 'status' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export default function TasksPage() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const updateTask = useMutation({
    mutationFn: async (data: Partial<Task> & { id: number }) => {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleToggleStatus = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === 'completed' ? 'pending' : 'completed',
    });
  };

  const handleDeleteTask = (task: Task) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id);
    }
  };

  const filteredAndSortedTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
          return order * (
            priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder]
          );
        }

        case 'status': {
          const statusOrder = { completed: 2, in_progress: 1, pending: 0 };
          return order * (
            statusOrder[a.status as keyof typeof statusOrder] -
            statusOrder[b.status as keyof typeof statusOrder]
          );
        }

        case 'title':
          return order * a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search Bar and Sort Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 self-end">
              <Button
                variant="outline"
                onClick={() => handleSort('priority')}
                className={cn(
                  'gap-2',
                  sortField === 'priority' && 'bg-gray-100'
                )}
              >
                Sort by Priority
                {sortField === 'priority' && (
                  <ArrowUpDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSort('dueDate')}
                className={cn(
                  'gap-2',
                  sortField === 'dueDate' && 'bg-gray-100'
                )}
              >
                Sort by Date
                {sortField === 'dueDate' && (
                  <ArrowUpDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Priority</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredAndSortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className={cn(
                        "border-b",
                        task.status === 'completed' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className="focus:outline-none"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "font-medium",
                              task.status === 'completed' && "line-through text-gray-500"
                            )}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-sm text-gray-500">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {task.dueDate ? (
                          format(new Date(task.dueDate), 'MMM d, yyyy')
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1 hover:text-indigo-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <TaskCalendar />
      </div>

      {isAddingTask && (
        <AddTaskDialog
          onClose={() => setIsAddingTask(false)}
          onSuccess={() => {
            setIsAddingTask(false);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}
    </div>
  );
}
