'use client'

import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CheckCircle2, Circle, Clock, ListTodo, AlertTriangle } from 'lucide-react'
import { Progress } from './ui/progress'

interface DashboardStatsProps {
  tasks: Task[]
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
  const pendingTasks = tasks.filter(task => task.status === 'pending').length
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  const upcomingDeadlines = tasks
    .filter(task => 
      task.status !== 'completed' && 
      task.dueDate && 
      new Date(task.dueDate) > new Date() &&
      new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
    .sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 5)

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-blue-600',
      description: 'All tasks in the system',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-green-600',
      description: `${completionRate.toFixed(1)}% completion rate`,
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-purple-600',
      description: 'Tasks currently being worked on',
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: Circle,
      color: 'text-gray-600',
      description: 'Tasks not yet started',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completionRate.toFixed(1)}% of all tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-2">
                {upcomingDeadlines.map((task) => (
                  <li key={task.id} className="text-sm">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-muted-foreground ml-2">
                      Due {new Date(task.dueDate!).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines in the next 7 days
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
