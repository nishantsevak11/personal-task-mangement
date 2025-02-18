'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';
import { EditTaskDialog } from './edit-task-dialog';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  projectId: number | null;
}

interface TaskActionsProps {
  task: Task;
}

export function TaskActions({ task }: TaskActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

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

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateTaskStatus.mutate({ id: task.id, status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[160px]">
          <div className="grid gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {task.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            )}
            {task.status === 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleStatusChange('pending')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reopen
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {isEditing && (
        <EditTaskDialog task={task} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
