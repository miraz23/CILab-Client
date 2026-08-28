"use client"

import ActivityStats from '@/components/dashboard/overview/ActivityStats'
import EventsComponent from '@/components/dashboard/overview/EventsComponent'
import OverviewComponent from '@/components/dashboard/overview/OverviewComponent'
import PaperStats from '@/components/dashboard/overview/PaperStats'
import StateCards from '@/components/dashboard/overview/StateCards'
import TaskManager from '@/components/dashboard/overview/TaskManager'
import TodoItems from '@/components/dashboard/overview/TodoList'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <section className='w-[95%] mx-auto py-5'>
      <div>
        <div className="mb-6">
          <div className='flex items-center justify-between'>
            <h1 className="text-2xl font-bold text-white">Overview</h1>

            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="w-4 h-4" aria-hidden />
              <p className='hidden md:block'>Reload</p>
            </Button>
          </div>

          <p className="text-white/80 mt-1">Manage your research papers and presentation uploads</p>
        </div>

        <StateCards />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full">
          <div className="col-span-1 lg:col-span-4 space-y-4">
            <OverviewComponent />
            <EventsComponent />
          </div>
          <div className="col-span-1 lg:col-span-2 space-y-4">
          <PaperStats />
            
          </div>
          {/* <div className="col-span-1 lg:col-span-2 space-y-4">
            <TodoItems />
            <ActivityStats />
            <PaperStats />
          </div> */}
        </div>
      </div>
    </section>
  )
}