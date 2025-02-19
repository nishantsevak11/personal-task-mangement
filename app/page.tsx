'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Manage Your Tasks Efficiently
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                A simple and intuitive task management application to help you stay organized and productive.
              </p>
            </div>
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                onClick={() => signIn()}
                className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
