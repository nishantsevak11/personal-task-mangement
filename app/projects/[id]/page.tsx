'use server'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProject } from '@/lib/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import TaskList from '@/components/task-list'
import TaskDialog from '@/components/task-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  // Calculate project statistics
  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0
  const inProgressTasks = project.tasks?.filter(task => task.status === 'in_progress').length || 0
  const pendingTasks = project.tasks?.filter(task => task.status === 'pending').length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        <TaskDialog project={project}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </TaskDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.toFixed(0)}% complete</span>
              <span>{completedTasks} of {totalTasks} tasks</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TaskList tasks={project.tasks || []} />
          </Suspense>
        </TabsContent>
        <TabsContent value="pending">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TaskList
              tasks={project.tasks?.filter((task) => task.status === 'pending') || []}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="in_progress">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TaskList
              tasks={project.tasks?.filter((task) => task.status === 'in_progress') || []}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="completed">
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TaskList
              tasks={project.tasks?.filter((task) => task.status === 'completed') || []}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
