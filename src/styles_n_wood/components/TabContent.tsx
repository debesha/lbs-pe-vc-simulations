import { ReactNode } from 'react'
import { useTabsContext } from './Tabs'

interface TabContentProps {
  tab: 'info' | 'operational' | 'lbo_entry' | 'exit'
  children: ReactNode
}

export function TabContent({ tab, children }: TabContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== tab) {
    return null
  }

  return <div id={`${tab}-tab`} className="tab-content active">{children}</div>
}

