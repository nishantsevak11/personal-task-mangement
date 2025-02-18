'use client';

import { DashboardCalendar } from '@/components/dashboard-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Plus } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: tasks = [], refetch } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const handleAddTask = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      refetch();
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.status === 'pending' &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          onClick={() => handleAddTask()} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <DashboardCalendar
            tasks={tasks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddTask={handleAddTask}
          />
        </CardContent>
      </Card>

      <AddTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
        defaultDate={selectedDate}
      />
    </div>
  );
}
