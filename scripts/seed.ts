import { db } from '@/db'
import { tasks, projects } from '@/db/schema'

async function main() {
  // First clear existing data
  await db.delete(tasks)
  await db.delete(projects)

  // Create sample projects
  const projectData = [
    { name: 'Personal Website', description: 'Building my portfolio website', color: '#FF6B6B' },
    { name: 'Mobile App', description: 'Fitness tracking application', color: '#4ECDC4' },
    { name: 'Blog Project', description: 'Technical blog platform', color: '#45B7D1' },
    { name: 'E-commerce', description: 'Online store development', color: '#96CEB4' },
    { name: 'Learning', description: 'Study and courses', color: '#D4A5A5' }
  ]

  const createdProjects = await Promise.all(
    projectData.map(async (project) => {
      const [created] = await db.insert(projects).values({
        ...project,
        userId: 1, // Replace with your user ID
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      return created
    })
  )

  // Create sample tasks
  const taskData = [
    // Personal Website Tasks
    {
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups',
      priority: 'high',
      status: 'in_progress',
      projectId: createdProjects[0].id,
      progress: 60,
      dueDate: new Date('2025-03-01')
    },
    {
      title: 'Implement Responsive Design',
      description: 'Make website mobile-friendly',
      priority: 'medium',
      status: 'pending',
      projectId: createdProjects[0].id,
      progress: 0,
      dueDate: new Date('2025-03-15')
    },
    {
      title: 'Add Portfolio Section',
      description: 'Showcase previous work',
      priority: 'medium',
      status: 'completed',
      projectId: createdProjects[0].id,
      progress: 100,
      dueDate: new Date('2025-02-15')
    },

    // Mobile App Tasks
    {
      title: 'User Authentication',
      description: 'Implement login and registration',
      priority: 'high',
      status: 'in_progress',
      projectId: createdProjects[1].id,
      progress: 75,
      dueDate: new Date('2025-03-10')
    },
    {
      title: 'Workout Tracking Feature',
      description: 'Add exercise logging functionality',
      priority: 'high',
      status: 'pending',
      projectId: createdProjects[1].id,
      progress: 0,
      dueDate: new Date('2025-03-20')
    },
    {
      title: 'UI/UX Design',
      description: 'Design user interface mockups',
      priority: 'medium',
      status: 'completed',
      projectId: createdProjects[1].id,
      progress: 100,
      dueDate: new Date('2025-02-10')
    },

    // Blog Project Tasks
    {
      title: 'Set Up CMS',
      description: 'Configure content management system',
      priority: 'high',
      status: 'pending',
      projectId: createdProjects[2].id,
      progress: 0,
      dueDate: new Date('2025-03-05')
    },
    {
      title: 'Create Blog Templates',
      description: 'Design post and category templates',
      priority: 'medium',
      status: 'in_progress',
      projectId: createdProjects[2].id,
      progress: 40,
      dueDate: new Date('2025-03-12')
    },
    {
      title: 'SEO Optimization',
      description: 'Implement SEO best practices',
      priority: 'low',
      status: 'pending',
      projectId: createdProjects[2].id,
      progress: 0,
      dueDate: new Date('2025-03-25')
    },

    // E-commerce Tasks
    {
      title: 'Product Catalog',
      description: 'Set up product database',
      priority: 'high',
      status: 'completed',
      projectId: createdProjects[3].id,
      progress: 100,
      dueDate: new Date('2025-02-20')
    },
    {
      title: 'Shopping Cart',
      description: 'Implement cart functionality',
      priority: 'high',
      status: 'in_progress',
      projectId: createdProjects[3].id,
      progress: 80,
      dueDate: new Date('2025-03-08')
    },
    {
      title: 'Payment Integration',
      description: 'Add payment gateway',
      priority: 'high',
      status: 'pending',
      projectId: createdProjects[3].id,
      progress: 0,
      dueDate: new Date('2025-03-18')
    },

    // Learning Tasks
    {
      title: 'React Advanced Course',
      description: 'Complete online course',
      priority: 'medium',
      status: 'in_progress',
      projectId: createdProjects[4].id,
      progress: 50,
      dueDate: new Date('2025-03-30')
    },
    {
      title: 'TypeScript Workshop',
      description: 'Attend virtual workshop',
      priority: 'medium',
      status: 'pending',
      projectId: createdProjects[4].id,
      progress: 0,
      dueDate: new Date('2025-04-05')
    },
    {
      title: 'AWS Certification',
      description: 'Study for certification exam',
      priority: 'high',
      status: 'pending',
      projectId: createdProjects[4].id,
      progress: 20,
      dueDate: new Date('2025-04-15')
    },

    // Unassigned Tasks
    {
      title: 'Update Resume',
      description: 'Add recent projects and skills',
      priority: 'low',
      status: 'pending',
      projectId: null,
      progress: 0,
      dueDate: new Date('2025-03-28')
    },
    {
      title: 'Networking Event',
      description: 'Attend tech meetup',
      priority: 'medium',
      status: 'pending',
      projectId: null,
      progress: 0,
      dueDate: new Date('2025-03-22')
    },
    {
      title: 'Code Review',
      description: 'Review pull requests',
      priority: 'high',
      status: 'in_progress',
      projectId: null,
      progress: 30,
      dueDate: new Date('2025-03-01')
    },
    {
      title: 'Team Meeting',
      description: 'Weekly sync-up',
      priority: 'medium',
      status: 'completed',
      projectId: null,
      progress: 100,
      dueDate: new Date('2025-02-18')
    },
    {
      title: 'Documentation',
      description: 'Update API documentation',
      priority: 'medium',
      status: 'pending',
      projectId: null,
      progress: 0,
      dueDate: new Date('2025-03-15')
    }
  ]

  // Insert tasks
  await Promise.all(
    taskData.map(async (task) => {
      await db.insert(tasks).values({
        ...task,
        userId: 1, // Replace with your user ID
        isCompleted: task.status === 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
  )

  console.log('Seed data inserted successfully!')
}

main().catch((err) => {
  console.error('Error seeding data:', err)
  process.exit(1)
})
