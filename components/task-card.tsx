'use client'

import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EditTaskDialog } from './edit-task-dialog'
import { Button } from './ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteTask, updateTask } from '@/lib/api'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { toast } from 'sonner'
import { useState } from 'react'

const priorityStyles = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const statusStyles = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
}

interface TaskCardProps {
  task: Task
  onUpdate?: () => void
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    toast.promise(
      async () => {
        setIsDeleting(true)
        try {
          await deleteTask(task.id)
          router.refresh()
        } finally {
          setIsDeleting(false)
        }
      },
      {
        loading: 'Deleting task...',
        success: 'Task deleted successfully!',
        error: 'Failed to delete task',
      }
    )
  }

  const handleStatusChange = async (newStatus: Task['status']) => {
    const statusMessages = {
      todo: 'Task moved to To Do',
      'in-progress': 'Task moved to In Progress',
      completed: 'Task marked as Completed! 🎉',
    }

    toast.promise(
      async () => {
        await updateTask(task.id, {
          ...task,
          status: newStatus,
        })
        router.refresh()
      },
      {
        loading: 'Updating task status...',
        success: statusMessages[newStatus],
        error: 'Failed to update task status',
      }
    )
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/5",
      "animate-in slide-in-from-bottom-2 duration-300 ease-in-out",
      isDeleting && "animate-out slide-out-to-right duration-200 ease-in-out"
    )}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold leading-none tracking-tight dark:text-foreground">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <EditTaskDialog task={task}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </EditTaskDialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-muted hover:text-red-500 dark:hover:text-red-400"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              priorityStyles[task.priority as keyof typeof priorityStyles],
              "transition-all duration-200 hover:scale-105"
            )}
          >
            {task.priority}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              statusStyles[task.status as keyof typeof statusStyles],
              "transition-all duration-200 hover:scale-105"
            )}
          >
            {task.status}
          </Badge>
          {task.dueDate && (
            <Badge 
              variant="outline" 
              className={cn(
                "dark:border-muted dark:text-muted-foreground",
                "transition-all duration-200 hover:scale-105"
              )}
            >
              Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t dark:border-gray-800">
        <div className="text-sm text-muted-foreground dark:text-muted-foreground">
          Due: {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-200 transition-all duration-200 hover:scale-105"
            >
              Change Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="dark:bg-gray-800 dark:border-gray-700 animate-in zoom-in-90 duration-200"
          >
            <DropdownMenuItem 
              onClick={() => handleStatusChange('todo')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white transition-colors"
            >
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('in-progress')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white transition-colors"
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('completed')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white transition-colors"
            >
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
