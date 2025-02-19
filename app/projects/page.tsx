'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Project, Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      // Replace with your project fetching logic
      return []
    },
  })

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      // Replace with your task fetching logic
      return []
    },
  })

  const getProjectStats = (projectId: number) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      totalTasks,
      completedTasks,
      progress,
      upcomingTasks: projectTasks.filter(
        task => 
          task.status !== 'completed' && 
          task.dueDate && 
          new Date(task.dueDate) > new Date()
      ).length
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const stats = getProjectStats(project.id)
          return (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {project.name}
                  </CardTitle>
                  <Badge
                    style={{
                      backgroundColor: project.color + '20',
                      borderColor: project.color,
                      color: project.color,
                    }}
                  >
                    {stats.totalTasks} tasks
                  </Badge>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(stats.progress)}%</span>
                    </div>
                    <Progress value={stats.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{stats.completedTasks} completed</span>
                      <span>{stats.upcomingTasks} upcoming</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
