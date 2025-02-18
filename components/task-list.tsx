'use client'

import { Task } from '@/db/schema'
import { TaskCard } from './task-card'
import { Button } from './ui/button'
import { AddTaskDialog } from './add-task-dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Input } from './ui/input'

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredAndSortedTasks = initialTasks
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

  const handleAddTask = (date?: Date) => {
    if (date) {
      setSelectedDate(date)
    }
    setIsCreateDialogOpen(true)
  }

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
  }

  const handleSortByPriority = () => {
    if (sortBy === 'priority') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy('priority')
      setSortOrder('asc')
    }
  }

  const handleSortByDate = () => {
    if (sortBy === 'date') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy('date')
      setSortOrder('asc')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <AddTaskDialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateDialogChange}
          defaultDate={selectedDate}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </AddTaskDialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button
          variant={sortBy === 'priority' ? 'default' : 'outline'}
          onClick={handleSortByPriority}
        >
          Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          variant={sortBy === 'date' ? 'default' : 'outline'}
          onClick={handleSortByDate}
        >
          Due Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center text-muted-foreground mt-10">
          No tasks found. {searchQuery ? 'Try a different search.' : 'Create one to get started!'}
        </div>
      )}
    </div>
  )
}
