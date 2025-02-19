import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const runSetup = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Connect with elevated privileges to create the database
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    // Drop existing tables and types
    console.log('Dropping existing tables and types...');
    await sql.unsafe(`
      DROP TABLE IF EXISTS task_categories CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS priority CASCADE;
      DROP TYPE IF EXISTS status CASCADE;
    `);
    console.log('Tables and types dropped successfully');

    // Run migrations
    console.log('Running migrations...');
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully!');

  } catch (error) {
    console.error('Error during database setup:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

runSetup().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
