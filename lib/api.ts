'use client'

import { CreateTaskInput, Task, UpdateTaskInput, Project, CreateProjectInput, UpdateProjectInput } from './types'
import { 
  getTasks as getTasksAction,
  getTask as getTaskAction,
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  getProjects as getProjectsAction,
  getProject as getProjectAction,
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
} from './actions'

export async function getTasks(): Promise<Task[]> {
  return await getTasksAction()
}

export async function getTask(id: number): Promise<Task | null> {
  return await getTaskAction(id)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return await createTaskAction(input)
}

export async function updateTask(input: UpdateTaskInput): Promise<Task | null> {
  return await updateTaskAction(input)
}

export async function deleteTask(id: number): Promise<boolean> {
  return await deleteTaskAction(id)
}

export async function getProjects(): Promise<Project[]> {
  return await getProjectsAction()
}

export async function getProject(id: number): Promise<Project | null> {
  return await getProjectAction(id)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return await createProjectAction(input)
}

export async function updateProject(input: UpdateProjectInput): Promise<Project | null> {
  return await updateProjectAction(input)
}

export async function deleteProject(id: number): Promise<boolean> {
  return await deleteProjectAction(id)
}
