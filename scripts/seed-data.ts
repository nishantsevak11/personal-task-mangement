import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { users, projects, tasks, categories, taskCategories } from '../db/schema';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const seedDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Seeding database...');

    // Create test user with a different email
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [user] = await db.insert(users).values({
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    }).returning();

    console.log('Created test user:', user.email);

    // Create categories
    const categoryNames = ['Work', 'Personal', 'Shopping', 'Health', 'Learning'];
    const createdCategories = await Promise.all(
      categoryNames.map(async (name) => {
        const [category] = await db.insert(categories).values({
          name,
          userId: user.id,
        }).returning();
        return category;
      })
    );

    console.log('Created categories:', categoryNames);

    // Create projects
    const projectData = [
      { name: 'Website Redesign', description: 'Redesign company website with modern UI/UX' },
      { name: 'Mobile App Development', description: 'Develop new mobile app for client' },
      { name: 'Database Migration', description: 'Migrate legacy database to new system' },
      { name: 'Personal Finance', description: 'Track and manage personal expenses' },
      { name: 'Home Renovation', description: 'Plan and execute home renovation project' },
    ];

    const createdProjects = await Promise.all(
      projectData.map(async (project) => {
        const [createdProject] = await db.insert(projects).values({
          ...project,
          userId: user.id,
        }).returning();
        return createdProject;
      })
    );

    console.log('Created projects:', projectData.map(p => p.name));

    // Create tasks
    const taskData = [
      { title: 'Design Homepage', projectId: createdProjects[0].id, priority: 'high', status: 'in_progress', dueDate: new Date('2025-03-01') },
      { title: 'Implement Authentication', projectId: createdProjects[0].id, priority: 'high', status: 'pending', dueDate: new Date('2025-03-05') },
      { title: 'Setup Database', projectId: createdProjects[0].id, priority: 'medium', status: 'completed', dueDate: new Date('2025-02-28') },
      { title: 'Create API Documentation', projectId: createdProjects[0].id, priority: 'low', status: 'pending', dueDate: new Date('2025-03-10') },
      
      { title: 'Design App Wireframes', projectId: createdProjects[1].id, priority: 'high', status: 'completed', dueDate: new Date('2025-03-02') },
      { title: 'Implement User Profile', projectId: createdProjects[1].id, priority: 'medium', status: 'in_progress', dueDate: new Date('2025-03-07') },
      { title: 'Add Push Notifications', projectId: createdProjects[1].id, priority: 'low', status: 'pending', dueDate: new Date('2025-03-15') },
      
      { title: 'Backup Current Database', projectId: createdProjects[2].id, priority: 'high', status: 'completed', dueDate: new Date('2025-02-25') },
      { title: 'Schema Migration', projectId: createdProjects[2].id, priority: 'high', status: 'in_progress', dueDate: new Date('2025-03-01') },
      { title: 'Data Validation', projectId: createdProjects[2].id, priority: 'medium', status: 'pending', dueDate: new Date('2025-03-05') },
      
      { title: 'Create Budget Plan', projectId: createdProjects[3].id, priority: 'high', status: 'completed', dueDate: new Date('2025-02-20') },
      { title: 'Track Monthly Expenses', projectId: createdProjects[3].id, priority: 'medium', status: 'in_progress', dueDate: new Date('2025-03-01') },
      { title: 'Review Investments', projectId: createdProjects[3].id, priority: 'low', status: 'pending', dueDate: new Date('2025-03-10') },
      
      { title: 'Get Contractor Quotes', projectId: createdProjects[4].id, priority: 'high', status: 'completed', dueDate: new Date('2025-02-15') },
      { title: 'Purchase Materials', projectId: createdProjects[4].id, priority: 'high', status: 'in_progress', dueDate: new Date('2025-02-28') },
      { title: 'Schedule Workers', projectId: createdProjects[4].id, priority: 'medium', status: 'pending', dueDate: new Date('2025-03-05') },
      
      // Additional tasks without projects
      { title: 'Weekly Team Meeting', priority: 'medium', status: 'pending', dueDate: new Date('2025-02-26') },
      { title: 'Prepare Monthly Report', priority: 'high', status: 'pending', dueDate: new Date('2025-03-01') },
      { title: 'Client Presentation', priority: 'high', status: 'in_progress', dueDate: new Date('2025-02-28') },
      { title: 'Research New Technologies', priority: 'low', status: 'pending', dueDate: new Date('2025-03-15') },
    ];

    const createdTasks = await Promise.all(
      taskData.map(async (task) => {
        const [createdTask] = await db.insert(tasks).values({
          ...task,
          userId: user.id,
        }).returning();
        return createdTask;
      })
    );

    console.log('Created tasks:', createdTasks.length);

    // Assign categories to tasks
    const taskCategoryAssignments = [];
    createdTasks.forEach((task) => {
      // Randomly assign 1-3 categories to each task
      const numCategories = Math.floor(Math.random() * 3) + 1;
      const shuffledCategories = [...createdCategories].sort(() => Math.random() - 0.5);
      const selectedCategories = shuffledCategories.slice(0, numCategories);
      
      selectedCategories.forEach((category) => {
        taskCategoryAssignments.push({
          taskId: task.id,
          categoryId: category.id,
        });
      });
    });

    await db.insert(taskCategories).values(taskCategoryAssignments);
    console.log('Assigned categories to tasks');

    console.log('Database seeding completed successfully!');
    console.log('Test user credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

seedDatabase().catch((err) => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
