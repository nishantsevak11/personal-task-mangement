'use client'

import { Task } from '@/db/schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from './ui/textarea'
import { useState } from 'react'
import { updateTask } from '@/app/actions/tasks'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface EditTaskDialogProps {
  task: Task
  children: React.ReactNode
}

export function EditTaskDialog({ task, children }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)
  const [status, setStatus] = useState(task.status)
  const [dueDate, setDueDate] = useState(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.promise(
      async () => {
        await updateTask(task.id, {
          title,
          description,
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate) : null,
        })
        setOpen(false)
        router.refresh()
      },
      {
        loading: 'Updating task...',
        success: 'Task updated successfully! 🎉',
        error: 'Failed to update task',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-200">Edit Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="dark:text-gray-300">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger 
                  id="priority"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="low" className="dark:text-gray-200 dark:focus:bg-gray-700">Low</SelectItem>
                  <SelectItem value="medium" className="dark:text-gray-200 dark:focus:bg-gray-700">Medium</SelectItem>
                  <SelectItem value="high" className="dark:text-gray-200 dark:focus:bg-gray-700">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger 
                  id="status"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="todo" className="dark:text-gray-200 dark:focus:bg-gray-700">To Do</SelectItem>
                  <SelectItem value="in-progress" className="dark:text-gray-200 dark:focus:bg-gray-700">In Progress</SelectItem>
                  <SelectItem value="completed" className="dark:text-gray-200 dark:focus:bg-gray-700">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="dark:bg-gray-900">
            <Button 
              type="submit"
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
