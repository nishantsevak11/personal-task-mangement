import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { QueryProvider } from '@/providers/query-provider'
import { CalendarDays, ListTodo } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Management App',
  description: 'A simple task management application',
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: CalendarDays,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ListTodo,
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <div className="flex items-center space-x-4 lg:space-x-6">
                    <Link href="/" className="flex items-center space-x-2">
                      <span className="font-bold text-xl">
                        Task Manager
                      </span>
                    </Link>
                    <nav className="flex items-center space-x-4 lg:space-x-6">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="flex flex-1 items-center justify-end">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
