"use client"

import OverviewComponent from '@/components/dashboard/overview/OverviewComponent'
import StateCards from '@/components/dashboard/overview/StateCards'
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

        <div className="gap-4 w-full">
          <div className="space-y-4">
            <OverviewComponent />
          </div>
        </div>
      </div>
    </section>
  )
}