"use client"

import OverviewComponent from '@/components/dashboard/overview/OverviewComponent'
import StateCards from '@/components/dashboard/overview/StateCards'
import { OverviewSkeleton } from '@/components/dashboard/skeleton-loader/OverviewSkeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useDashboardLoading } from '@/lib/hooks/use-dashboard-loading'
import { cn } from '@/lib/utils'

export default function Page() {
  const { isLoading, refresh } = useDashboardLoading()

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
              onClick={refresh}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} aria-hidden />
              <p className='hidden md:block'>Reload</p>
            </Button>
          </div>

          <p className="text-white/80 mt-1">Manage your research papers and presentation uploads</p>
        </div>

        {isLoading ? (
          <OverviewSkeleton />
        ) : (
          <>
            <StateCards />

            <div className="gap-4 w-full">
              <div className="space-y-4">
                <OverviewComponent />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}