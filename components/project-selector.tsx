'use client'

import { Project } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: number | null
  onProjectSelect: (projectId: number | null) => void
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectSelect,
}: ProjectSelectorProps) {
  return (
    <Select
      value={selectedProjectId?.toString() ?? "none"}
      onValueChange={(value) =>
        onProjectSelect(value === "none" ? null : parseInt(value, 10))
      }
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Project</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id.toString()}>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: project.color + '20',
                  borderColor: project.color,
                  color: project.color,
                }}
              >
                {project.name}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
