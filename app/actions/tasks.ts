'use server'

import { db } from "@/db"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type TaskInput = {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status?: 'todo' | 'in-progress' | 'completed'
}

export async function createTask(task: TaskInput) {
  try {
    await db.insert(tasks).values({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
    })
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(id: number, task: Partial<TaskInput>) {
  try {
    await db.update(tasks)
      .set({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: number) {
  try {
    await db.delete(tasks).where(eq(tasks.id, id))
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function getTasks() {
  try {
    const allTasks = await db.select().from(tasks)
    return { success: true, data: allTasks }
  } catch (error) {
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function getTask(id: number) {
  try {
    const task = await db.select().from(tasks).where(eq(tasks.id, id))
    return { success: true, data: task[0] }
  } catch (error) {
    return { success: false, error: 'Failed to fetch task' }
  }
}
