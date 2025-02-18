import { pgTable, serial, varchar, timestamp, text, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const statusEnum = pgEnum('status', ['pending', 'in_progress', 'completed']);

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: priorityEnum('priority').notNull().default('medium'),
  status: statusEnum('status').notNull().default('pending'),
  dueDate: timestamp('due_date'),
  projectId: integer('project_id').references(() => projects.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taskCategories = pgTable('task_categories', {
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  projects: many(projects),
  categories: many(categories),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  categories: many(taskCategories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  tasks: many(taskCategories),
}));

export const taskCategoriesRelations = relations(taskCategories, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCategories.taskId],
    references: [tasks.id],
  }),
  category: one(categories, {
    fields: [taskCategories.categoryId],
    references: [categories.id],
  }),
}));
