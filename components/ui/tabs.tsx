"use client"

import React, { createContext, useContext, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsListVariants = cva(
  "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  { variants: {}, defaultVariants: {} }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
  { variants: {}, defaultVariants: {} }
)

const tabsContentVariants = cva(
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  { variants: {}, defaultVariants: {} }
)

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within Tabs.Root")
  }
  return context
}

function TabsRoot({ children, defaultValue, value, onValueChange, className, ...props }: {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsListVariants>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(tabsListVariants({ className }))}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof tabsTriggerVariants> & { value: string }) {
  const { value: currentValue, onValueChange } = useTabsContext()
  const isActive = currentValue === value

  return (
    <button
      data-slot="tabs-trigger"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      className={cn(tabsTriggerVariants({ className }))}
      onClick={() => !disabled && onValueChange(value)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsContentVariants> & { value: string }) {
  const { value: currentValue } = useTabsContext()
  const isActive = currentValue === value

  if (!isActive) return null

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      className={cn(tabsContentVariants({ className }))}
      {...props}
    />
  )
}

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})

export { Tabs, TabsList, TabsTrigger, TabsContent }