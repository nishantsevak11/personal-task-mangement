'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Task, Project } from '@/lib/types'
import { createTask, updateTask } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { ProjectSelector } from './project-selector'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TaskFormProps {
  task?: Task
  onClose: () => void
  onTaskAdded?: () => void
  onTaskUpdated?: () => void
  initialDueDate?: Date | null
}

export function TaskForm({
  task,
  onClose,
  onTaskAdded,
  onTaskUpdated,
  initialDueDate,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [status, setStatus] = useState(task?.status || 'pending')
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : initialDueDate
  )
  const [projectId, setProjectId] = useState<number | null>(task?.projectId || null)
  const [progress, setProgress] = useState(task?.progress || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      // Replace with your project fetching logic
      return []
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const taskData = {
        title,
        description: description || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        projectId: projectId || null,
        progress,
      }

      if (task) {
        await updateTask({ id: task.id, ...taskData })
        toast.success('Task updated successfully')
        onTaskUpdated?.()
      } else {
        await createTask(taskData)
        toast.success('Task created successfully')
        onTaskAdded?.()
      }
      onClose()
    } catch (error) {
      toast.error('Failed to save task')
      console.error('Failed to save task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: Task['priority']) => setPriority(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: Task['status']) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
                onClick={() => setDueDate(new Date())}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
              </Button>
              {dueDate && (
                <Button
                  variant="ghost"
                  onClick={() => setDueDate(null)}
                  type="button"
                >
                  Clear
                </Button>
              )}
            </div>
            {dueDate && (
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                className="rounded-md border"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <ProjectSelector
              projects={projects}
              selectedProjectId={projectId}
              onProjectSelect={setProjectId}
            />
          </div>

          <div className="space-y-2">
            <Label>Progress ({progress}%)</Label>
            <Slider
              value={[progress]}
              onValueChange={([value]) => setProgress(value)}
              max={100}
              step={5}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
