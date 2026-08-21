import ActivityStats from '@/components/dashboard/overview/ActivityStats'
import EventsComponent from '@/components/dashboard/overview/EventsComponent'
import OverviewComponent from '@/components/dashboard/overview/OverviewComponent'
import PaperStats from '@/components/dashboard/overview/PaperStats'
import StateCards from '@/components/dashboard/overview/StateCards'
import TaskManager from '@/components/dashboard/overview/TaskManager'
import TodoItems from '@/components/dashboard/overview/TodoList'
import React from 'react'

export default function page() {
  return (
    <section className='w-[95%] mx-auto py-5'>
      <div>
        <StateCards />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full">
          <div className="col-span-1 lg:col-span-4">
            <OverviewComponent />
            <TaskManager />
            <EventsComponent />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <TodoItems />
            <ActivityStats />
            <PaperStats />
          </div>
        </div>
      </div>
    </section>
  )
}