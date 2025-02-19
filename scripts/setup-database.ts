import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../db/schema';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const setupDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a new connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await sql.unsafe(`
      DROP TABLE IF EXISTS task_categories CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS priority CASCADE;
      DROP TYPE IF EXISTS status CASCADE;
    `);
    console.log('Tables dropped successfully');

    // Create enums
    console.log('Creating enums...');
    await sql.unsafe(`
      DO $$ BEGIN
        CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE status AS ENUM ('pending', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Enums created successfully');

    // Create tables
    console.log('Creating tables...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority priority DEFAULT 'medium' NOT NULL,
        status status DEFAULT 'pending' NOT NULL,
        due_date TIMESTAMP,
        project_id INTEGER REFERENCES projects(id),
        user_id INTEGER REFERENCES users(id) NOT NULL,
        is_completed BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_categories (
        task_id INTEGER REFERENCES tasks(id) NOT NULL,
        category_id INTEGER REFERENCES categories(id) NOT NULL,
        PRIMARY KEY (task_id, category_id)
      );
    `);
    console.log('Tables created successfully');

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

setupDatabase().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
