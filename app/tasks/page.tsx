'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Task, Project } from '@/lib/types'
import { getTasks } from '@/lib/api'
import { TaskList } from '@/components/task-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskForm } from '@/components/task-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProjectForm } from '@/components/project-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TasksPage() {
  const { data: session, status } = useSession()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isAddingProject, setIsAddingProject] = useState(false)

  const { data: tasks = [], isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
    enabled: status === 'authenticated',
  })

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      // Replace with your project fetching logic
      return []
    },
    enabled: status === 'authenticated',
  })

  if (status === 'loading' || isLoadingTasks || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  const filteredAndSortedTasks = [...tasks]
    .filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
      
      const matchesProject = 
        selectedProject === 'all' || 
        (selectedProject === 'none' && !task.projectId) ||
        task.projectId?.toString() === selectedProject

      return matchesSearch && matchesProject
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortBy === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2 }
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority]
      } else {
        const statusOrder = { pending: 0, in_progress: 1, completed: 2 }
        return sortOrder === 'asc'
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status]
      }
    })

  const tasksByProject = projects.reduce((acc, project) => {
    acc[project.id] = tasks.filter(task => task.projectId === project.id)
    return acc
  }, {} as Record<number, Task[]>)

  const unassignedTasks = tasks.filter(task => !task.projectId)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingProject(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="none">No Project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value: 'dueDate' | 'priority' | 'status') =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="projects">Project View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <TaskList
            tasks={filteredAndSortedTasks}
            onTasksChange={refetchTasks}
            projects={projects}
          />
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <Badge variant="secondary">
                    {tasksByProject[project.id]?.length || 0} tasks
                  </Badge>
                </div>
                <TaskList
                  tasks={tasksByProject[project.id] || []}
                  onTasksChange={refetchTasks}
                  projects={projects}
                />
              </div>
            ))}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">No Project</h2>
                <Badge variant="secondary">
                  {unassignedTasks.length} tasks
                </Badge>
              </div>
              <TaskList
                tasks={unassignedTasks}
                onTasksChange={refetchTasks}
                projects={projects}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isAddingTask && (
        <TaskForm
          onClose={() => setIsAddingTask(false)}
          onTaskAdded={() => {
            refetchTasks()
            setIsAddingTask(false)
          }}
        />
      )}

      {isAddingProject && (
        <ProjectForm
          onClose={() => setIsAddingProject(false)}
        />
      )}
    </div>
  )
}
