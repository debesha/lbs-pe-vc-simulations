import { ReactNode } from 'react'
import { useAppSelector } from '../store/hooks'

interface TabContentProps {
  tab: 'dilution' | 'return'
  children: ReactNode
}

export function TabContent({ tab, children }: TabContentProps) {
  const activeTab = useAppSelector((state) => state.app.activeTab)

  if (activeTab !== tab) {
    return null
  }

  return <div id={`${tab}-tab`} className="tab-content active">{children}</div>
}

