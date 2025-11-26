import React, { ReactNode, useState, createContext, useContext } from 'react'
import './Tabs.css'

interface TabsContextType {
  activeTab: 'info' | 'operational' | 'lbo_entry' | 'exit'
  setActiveTab: (tab: 'info' | 'operational' | 'lbo_entry' | 'exit') => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  children: ReactNode
}

export function Tabs({ children }: TabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'operational' | 'lbo_entry' | 'exit'>('info')

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`tab-button ${activeTab === 'operational' ? 'active' : ''}`}
            onClick={() => setActiveTab('operational')}
          >
            Operational Forecast
          </button>
          <button
            className={`tab-button ${activeTab === 'lbo_entry' ? 'active' : ''}`}
            onClick={() => setActiveTab('lbo_entry')}
          >
            LBO Entry
          </button>
          <button
            className={`tab-button ${activeTab === 'exit' ? 'active' : ''}`}
            onClick={() => setActiveTab('exit')}
          >
            Exit
          </button>
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabContent must be used within Tabs')
  }
  return context
}
