import { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/appSlice'
import './Tabs.css'

interface TabsProps {
  children: ReactNode
}

export function Tabs({ children }: TabsProps) {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.app.activeTab)

  return (
    <div>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'dilution' ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab('dilution'))}
        >
          Dilution Impact
        </button>
        <button
          className={`tab-button ${activeTab === 'return' ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab('return'))}
        >
          Return Comparison
        </button>
      </div>
      {children}
    </div>
  )
}

