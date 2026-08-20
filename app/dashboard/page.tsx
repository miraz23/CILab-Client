import StateCards from '@/components/ui/dashboard/overview/StateCards'
import OverviewComponent from '@/components/ui/dashboard/overview/OverviewComponent'
import TaskManager from '@/components/ui/dashboard/overview/TaskManager'
import TodoItems from '@/components/ui/dashboard/overview/TodoList'
import EventsComponent from '@/components/ui/dashboard/overview/EventsComponent'
import React from 'react'

export default function page() {
  return (
    <section className='w-[95%] mx-auto py-5'>
      <div>
        <StateCards />

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
          <div className="col-span-1 md:col-span-3 lg:col-span-4">
            <OverviewComponent />
            <TaskManager />
            <EventsComponent />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <TodoItems />
            
          </div>
        </div>
      </div>
    </section>
  )
}