import { getTasks } from '@/app/actions/tasks'
import { TaskList } from '@/components/task-list'

export default async function TasksPage() {
  const { data: tasks, error } = await getTasks()

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <TaskList initialTasks={tasks || []} />
    </div>
  )
}
