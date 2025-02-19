'use server'

import { db } from '@/db'
import { tasks, projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CreateTaskInput, Task, UpdateTaskInput, Project, CreateProjectInput, UpdateProjectInput } from './types'
import { getServerSession } from 'next-auth'
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options'

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return parseInt(session.user.id)
}

export async function getTasks(): Promise<Task[]> {
  const userId = await getCurrentUserId()
  return await db.query.tasks.findMany({
    where: eq(tasks.userId, userId),
    orderBy: tasks.createdAt,
    with: {
      project: true,
    },
  })
}

export async function getTask(id: number): Promise<Task | null> {
  const userId = await getCurrentUserId()
  const results = await db.query.tasks.findMany({
    where: eq(tasks.id, id),
    limit: 1,
    with: {
      project: true,
    },
  })
  const task = results[0]
  if (task && task.userId !== userId) {
    throw new Error('Unauthorized')
  }
  return task || null
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const userId = await getCurrentUserId()
  const [task] = await db
    .insert(tasks)
    .values({
      ...input,
      userId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    })
    .returning()
  return task
}

export async function updateTask(input: UpdateTaskInput): Promise<Task | null> {
  const userId = await getCurrentUserId()
  const task = await getTask(input.id)
  if (!task || task.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, input.id))
    .returning()
  return updatedTask
}

export async function deleteTask(id: number): Promise<boolean> {
  const userId = await getCurrentUserId()
  const task = await getTask(id)
  if (!task || task.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.delete(tasks).where(eq(tasks.id, id))
  return true
}

export async function getProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId()
  return await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: projects.createdAt,
  })
}

export async function getProject(id: number): Promise<Project | null> {
  const userId = await getCurrentUserId()
  const results = await db.query.projects.findMany({
    where: eq(projects.id, id),
    limit: 1,
  })
  const project = results[0]
  if (project && project.userId !== userId) {
    throw new Error('Unauthorized')
  }
  return project || null
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const userId = await getCurrentUserId()
  const [project] = await db
    .insert(projects)
    .values({
      ...input,
      userId,
    })
    .returning()
  return project
}

export async function updateProject(input: UpdateProjectInput): Promise<Project | null> {
  const userId = await getCurrentUserId()
  const project = await getProject(input.id)
  if (!project || project.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const [updatedProject] = await db
    .update(projects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, input.id))
    .returning()
  return updatedProject
}

export async function deleteProject(id: number): Promise<boolean> {
  const userId = await getCurrentUserId()
  const project = await getProject(id)
  if (!project || project.userId !== userId) {
    throw new Error('Unauthorized')
  }

  // First update all tasks in this project to have no project
  await db
    .update(tasks)
    .set({ projectId: null })
    .where(eq(tasks.projectId, id))

  // Then delete the project
  await db.delete(projects).where(eq(projects.id, id))
  return true
}
