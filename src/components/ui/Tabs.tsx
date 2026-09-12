'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  children: ReactNode
  defaultValue?: string
  /** Valeur contrôlée optionnelle (sync avec l'état du parent) */
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function Tabs({ children, defaultValue = '', value: controlledValue, onChange, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue)
  // Mode contrôlé si `value` est fourni, sinon état interne
  const activeTab = controlledValue ?? internalTab

  const handleSetActiveTab = (value: string) => {
    setInternalTab(value)
    onChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 bg-fmx-carbon/50 border border-fmx-border/50 rounded-lg p-1',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

export function TabsTrigger({ value, children, disabled = false, className, icon }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={cn(
        'tab px-4 py-2.5 rounded-md font-display font-medium transition-all duration-200',
        'flex items-center gap-2',
        isActive
          ? 'tab-active bg-fmx-red/10 text-fmx-red'
          : 'text-fmx-gray hover:text-fmx-white hover:bg-fmx-red/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { activeTab } = context

  if (activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  )
}