import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, and, between } from 'drizzle-orm';
import { withAuth } from '@/lib/api-auth';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  dueDate: z.string().optional(),
  projectId: z.number().optional(),
});

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = eq(tasks.userId, user.id);

    if (startDate && endDate) {
      query = and(
        query,
        between(tasks.dueDate, new Date(startDate), new Date(endDate))
      );
    }

    const userTasks = await db.select().from(tasks).where(query);
    return NextResponse.json(userTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const newTask = await db.insert(tasks).values({
      ...validatedData,
      userId: user.id,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    }).returning();

    return NextResponse.json(newTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const validatedData = taskSchema.partial().parse(data);

    const updatedTask = await db
      .update(tasks)
      .set({
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning();

    if (!updatedTask.length) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, parseInt(id)), eq(tasks.userId, user.id)))
      .returning();

    if (!deletedTask.length) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedTask[0]);
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
