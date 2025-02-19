'use server'

import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type TaskInput = {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status?: 'todo' | 'in-progress' | 'completed'
}

export async function createTask(task: TaskInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    await db.insert(tasks).values({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      userId: session.user.id,
      isCompleted: task.status === 'completed',
    })
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to create task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(id: number, task: Partial<TaskInput>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    await db.update(tasks)
      .set({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        isCompleted: task.status === 'completed',
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .where(eq(tasks.userId, session.user.id))
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to update task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    await db.delete(tasks)
      .where(eq(tasks.id, id))
      .where(eq(tasks.userId, session.user.id))
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function getTasks() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated', data: [] }
    }

    const data = await db.select().from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(tasks.dueDate)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return { success: false, error: 'Failed to fetch tasks', data: [] }
  }
}

export async function getTask(id: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    const data = await db.select().from(tasks)
      .where(eq(tasks.id, id))
      .where(eq(tasks.userId, session.user.id))
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return { success: false, error: 'Failed to fetch task' }
  }
}
