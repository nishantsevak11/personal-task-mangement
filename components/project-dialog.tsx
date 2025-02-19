'use client'

import { Project } from '@/lib/types'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useState } from 'react'
import { useToast } from './ui/use-toast'
import { createProject, updateProject } from '@/lib/actions'

interface ProjectDialogProps {
  mode?: 'create' | 'edit'
  project?: Project
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export default function ProjectDialog({
  mode = 'create',
  project,
  open,
  onOpenChange,
  children,
}: ProjectDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'edit' && project) {
        await updateProject({
          id: project.id,
          ...formData,
        })
      } else {
        await createProject(formData)
      }

      toast({
        title: `Project ${mode === 'edit' ? 'updated' : 'created'}`,
        description: `Project has been ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })
      onOpenChange?.(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} project`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit' : 'Create'} Project</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Make changes to your project here.'
              : 'Add a new project to manage your tasks.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : mode === 'edit'
              ? 'Save changes'
              : 'Create project'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  if (mode === 'edit') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {content}
    </Dialog>
  )
}
