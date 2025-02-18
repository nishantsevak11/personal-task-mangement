'use client'

import { Task } from '@/db/schema'
import { Card, CardContent, CardHeader, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EditTaskDialog } from './edit-task-dialog'
import { Button } from './ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteTask, updateTask } from '@/app/actions/tasks'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

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
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter()

  const handleDelete = async () => {
    await deleteTask(task.id)
    router.refresh()
  }

  const handleStatusChange = async (newStatus: Task['status']) => {
    await updateTask(task.id, {
      ...task,
      status: newStatus,
    })
    router.refresh()
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/5">
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
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-muted"
              onClick={handleDelete}
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
              priorityStyles[task.priority as keyof typeof priorityStyles]
            )}
          >
            {task.priority}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              statusStyles[task.status as keyof typeof statusStyles]
            )}
          >
            {task.status}
          </Badge>
          {task.dueDate && (
            <Badge variant="outline" className="dark:border-muted dark:text-muted-foreground">
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
              className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              Change Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuItem 
              onClick={() => handleStatusChange('todo')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white"
            >
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('in-progress')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white"
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange('completed')}
              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-white"
            >
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
