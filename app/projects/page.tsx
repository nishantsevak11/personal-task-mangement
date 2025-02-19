'use server'

import { Suspense } from 'react'
import { getProjects } from '@/lib/actions'
import ProjectCard from '@/components/project-card'
import ProjectDialog from '@/components/project-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and their tasks
          </p>
        </div>
        <ProjectDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </ProjectDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading projects...</div>}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No projects found. Create your first project to get started!
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
