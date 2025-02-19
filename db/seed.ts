import { db } from '.'
import { users, projects, tasks } from './schema'
import { hash } from 'bcrypt'

async function seed() {
  try {
    // Create demo user
    const hashedPassword = await hash('password123', 10)
    const [user] = await db
      .insert(users)
      .values({
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
      })
      .returning()

    // Create sample projects
    const [project1, project2] = await db
      .insert(projects)
      .values([
        {
          name: 'Website Redesign',
          description: 'Redesign company website with modern UI/UX',
          userId: user.id,
        },
        {
          name: 'Mobile App Development',
          description: 'Develop a new mobile app for task management',
          userId: user.id,
        },
      ])
      .returning()

    // Create sample tasks
    await db.insert(tasks).values([
      {
        title: 'Design Homepage',
        description: 'Create new homepage design with modern look',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date('2024-03-01'),
        projectId: project1.id,
        userId: user.id,
      },
      {
        title: 'Implement Authentication',
        description: 'Add user authentication system',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2024-03-15'),
        projectId: project1.id,
        userId: user.id,
      },
      {
        title: 'Design System',
        description: 'Create a comprehensive design system',
        priority: 'medium',
        status: 'completed',
        projectId: project1.id,
        userId: user.id,
      },
      {
        title: 'App Wireframes',
        description: 'Create wireframes for mobile app',
        priority: 'high',
        status: 'completed',
        projectId: project2.id,
        userId: user.id,
      },
      {
        title: 'API Design',
        description: 'Design RESTful API endpoints',
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date('2024-03-30'),
        projectId: project2.id,
        userId: user.id,
      },
    ])

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
