'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Task } from '@/lib/types'
import { getTasks } from '@/lib/api'
import { Calendar } from '@/components/ui/calendar'
import { DashboardStats } from '@/components/dashboard-stats'
import { TaskForm } from '@/components/task-form'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddingTask, setIsAddingTask] = useState(false)

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
    enabled: status === 'authenticated',
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <div className="border rounded-lg p-4 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                booked: (date) => getTasksForDate(date).length > 0,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                },
              }}
            />
            {selectedDate && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    Tasks for {format(selectedDate, 'PP')}
                  </h3>
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Task
                  </button>
                </div>
                <div className="space-y-2">
                  {getTasksForDate(selectedDate).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{task.title}</span>
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'destructive'
                            : task.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {getTasksForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-gray-500">No tasks for this date</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Overview</h2>
          <DashboardStats tasks={tasks} />
        </div>
      </div>

      {isAddingTask && (
        <TaskForm
          onClose={() => setIsAddingTask(false)}
          initialDueDate={selectedDate}
        />
      )}
    </div>
  )
}
