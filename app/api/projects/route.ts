import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await db
      .insert(projects)
      .values({
        ...validatedData,
        userId: user.id,
      })
      .returning();

    return NextResponse.json(project[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id));

    return NextResponse.json(userProjects);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
