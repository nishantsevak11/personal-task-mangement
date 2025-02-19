export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'in_progress' | 'completed'

export interface Project {
  id: number
  name: string
  description: string | null
  color: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  priority: Priority
  status: Status
  dueDate: string | null
  projectId: number | null
  project?: Project
  progress: number
  userId: number
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  upcomingDeadlines: Task[]
  completionRate: number
}

export interface CreateTaskInput {
  title: string
  description: string | null
  priority: Priority
  status: Status
  dueDate: string | null
  projectId: number | null
  progress: number
}

export interface UpdateTaskInput {
  id: number
  title?: string
  description?: string | null
  priority?: Priority
  status?: Status
  dueDate?: string | null
  projectId?: number | null
  progress?: number
}

export interface CreateProjectInput {
  name: string
  description: string | null
  color: string
}

export interface UpdateProjectInput {
  id: number
  name?: string
  description?: string | null
  color?: string
}
