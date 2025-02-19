'use client'

import { Task } from '@/lib/types'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'
import { CalendarDays, Circle } from 'lucide-react'
import TaskDialog from './task-dialog'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

const statusColors = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  return (
    <TaskDialog task={task} onUpdate={onUpdate}>
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-medium">
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{task.status}</Badge>
              <Circle
                className={`h-2 w-2 ${priorityColors[task.priority]}`}
              />
            </div>
          </div>
        </CardHeader>
        {(task.description || task.dueDate) && (
          <CardContent className="text-sm text-muted-foreground">
            {task.description && <p>{task.description}</p>}
            {task.dueDate && (
              <div className="flex items-center gap-2 mt-2">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TaskDialog>
  )
}
