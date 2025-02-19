'use server'

import { db } from '@/db'
import { tasks, projects, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { options } from '@/app/api/auth/[...nextauth]/options'
import { CreateTaskInput, Task, UpdateTaskInput, Project, CreateProjectInput, UpdateProjectInput } from './types'

async function getCurrentUserId() {
  const session = await getServerSession(options)
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  if (!user) {
    // Create user if they don't exist
    const [newUser] = await db.insert(users).values({
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      password: '', // Since we're using OAuth, we don't need a password
    }).returning()
    return newUser.id
  }

  return user.id
}

export async function getTasks(): Promise<Task[]> {
  try {
    const userId = await getCurrentUserId()
    return await db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      orderBy: tasks.createdAt,
      with: {
        project: true,
      },
    })
  } catch (error) {
    console.error('Error getting tasks:', error)
    throw new Error('Failed to get tasks')
  }
}

export async function getTask(id: number): Promise<Task | null> {
  try {
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
  } catch (error) {
    console.error('Error getting task:', error)
    throw new Error('Failed to get task')
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  try {
    const userId = await getCurrentUserId()
    const [task] = await db
      .insert(tasks)
      .values({
        ...input,
        userId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      })
      .returning()
    revalidatePath('/projects')
    revalidatePath(`/projects/${input.projectId}`)
    return task
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }
}

export async function updateTask(input: UpdateTaskInput): Promise<Task | null> {
  try {
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
    revalidatePath('/projects')
    revalidatePath(`/projects/${updatedTask.projectId}`)
    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const userId = await getCurrentUserId()
    const task = await getTask(id)
    if (!task || task.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await db.delete(tasks).where(eq(tasks.id, id))
    revalidatePath('/projects')
    revalidatePath(`/projects/${task.projectId}`)
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const userId = await getCurrentUserId()
    return await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      orderBy: projects.createdAt,
      with: {
        tasks: true
      }
    })
  } catch (error) {
    console.error('Error getting projects:', error)
    throw new Error('Failed to get projects')
  }
}

export async function getProject(id: number): Promise<Project | null> {
  try {
    const userId = await getCurrentUserId()
    return await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        tasks: true
      }
    })
  } catch (error) {
    console.error('Error getting project:', error)
    throw new Error('Failed to get project')
  }
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  try {
    const userId = await getCurrentUserId()
    const [project] = await db
      .insert(projects)
      .values({
        ...input,
        userId,
      })
      .returning()
    revalidatePath('/projects')
    return project
  } catch (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }
}

export async function updateProject(input: UpdateProjectInput): Promise<Project | null> {
  try {
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
    revalidatePath('/projects')
    revalidatePath(`/projects/${input.id}`)
    return updatedProject
  } catch (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }
}

export async function deleteProject(id: number): Promise<boolean> {
  try {
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
    revalidatePath('/projects')
    return true
  } catch (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }
}
