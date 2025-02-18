'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-6">
        {children}
      </div>
    </div>
  )
}
