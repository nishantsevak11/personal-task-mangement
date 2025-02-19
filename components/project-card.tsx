'use client'

import { Project } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Progress } from './ui/progress'
import Link from 'next/link'
import { useState } from 'react'
import { useToast } from './ui/use-toast'
import { deleteProject } from '@/lib/actions'
import ProjectDialog from './project-dialog'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteProject(project.id)
      toast({
        title: 'Project deleted',
        description: 'Project has been deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate completion percentage
  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <Link
              href={`/projects/${project.id}`}
              className="font-medium hover:underline"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
            </Badge>
            <Badge
              variant="secondary"
              className={
                progress === 100
                  ? 'bg-green-100 text-green-800'
                  : progress > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {progress.toFixed(0)}% complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/projects/${project.id}`}>View Tasks</Link>
          </Button>
        </CardFooter>
      </Card>

      <ProjectDialog
        mode="edit"
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  )
}
