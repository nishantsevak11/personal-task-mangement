'use client'

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
import { createTask } from '@/app/actions/tasks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AddTaskDialogProps {
  children: React.ReactNode;
  defaultDate?: Date;
}

export function AddTaskDialog({ children, defaultDate }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo')
  const [dueDate, setDueDate] = useState(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    try {
      const result = await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      })

      if (result.success) {
        toast.success('Task created successfully! 🎉')
        setOpen(false)
        router.refresh()
        // Reset form
        setTitle('')
        setDescription('')
        setPriority('medium')
        setStatus('todo')
        setDueDate('')
      } else {
        toast.error(result.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-200">Add New Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Create a new task here. Click save when you're done.
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
                required
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
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
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
              <Select value={status} onValueChange={(value: 'todo' | 'in-progress' | 'completed') => setStatus(value)}>
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
                required
              />
            </div>
          </div>
          <DialogFooter className="dark:bg-gray-900">
            <Button 
              type="submit"
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
