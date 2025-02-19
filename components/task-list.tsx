'use client'

import { Task, Project } from '@/lib/types'
import { TaskCard } from './task-card'
import { Button } from './ui/button'
import { AddTaskDialog } from './add-task-dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

interface TaskListProps {
  tasks: Task[]
  onTasksChange?: () => void
  projects: Project[]
}

export function TaskList({ tasks = [], onTasksChange, projects }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredAndSortedTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2 }
        const diff =
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        return sortOrder === 'asc' ? diff : -diff
      } else {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      }
    })

  const getProjectColor = (projectId: number | null) => {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project?.color
  }

  const getProjectName = (projectId: number | null) => {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project?.name
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setSortBy(sortBy === 'priority' ? 'date' : 'priority')}
        >
          Sort by {sortBy === 'priority' ? 'Date' : 'Priority'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No tasks found. Add some tasks to get started!
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {task.projectId && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getProjectColor(task.projectId) }}
                    />
                  )}
                  <h3 className="font-medium">{task.title}</h3>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.projectId && (
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getProjectColor(task.projectId) + '20',
                        borderColor: getProjectColor(task.projectId),
                        color: getProjectColor(task.projectId),
                      }}
                    >
                      {getProjectName(task.projectId)}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      task.priority === 'high'
                        ? 'destructive'
                        : task.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    variant={
                      task.status === 'completed'
                        ? 'default'
                        : task.status === 'in_progress'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {task.status}
                  </Badge>
                  {task.dueDate && (
                    <Badge variant="outline">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                  )}
                  {task.progress > 0 && (
                    <Badge variant="secondary">
                      {task.progress}% complete
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <TaskCard task={task} onUpdate={onTasksChange} />
              </div>
            </div>
          ))
        )}
      </div>

      <AddTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={() => {
          setIsCreateDialogOpen(false)
          onTasksChange?.()
        }}
      />
    </div>
  )
}
