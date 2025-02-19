import { NextResponse } from 'next/server'
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/actions'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const project = await createProject(data)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const project = await updateProject(data)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to update project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return new NextResponse('Missing project ID', { status: 400 })
    }

    const success = await deleteProject(parseInt(id))
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
