import { Tabs } from './components/Tabs'
import { TabContent } from './components/TabContent'
import { InfoTab } from './components/InfoTab'
import { OperationalForecastTab } from './components/OperationalForecastTab'
import { LBOEntryTab } from './components/LBOEntryTab'
import { ExitTab } from './components/ExitTab'
import { LBOAssumptionsProvider } from './context/LBOAssumptionsContext'
import './App.css'

function App() {
  return (
    <LBOAssumptionsProvider>
      <div className="app">
        <div className="container">
          <h1>Styles & Wood – Behind the Scenes of Retail</h1>
          <Tabs>
            <TabContent tab="info">
              <InfoTab />
            </TabContent>
            <TabContent tab="operational">
              <OperationalForecastTab />
            </TabContent>
            <TabContent tab="lbo_entry">
              <LBOEntryTab />
            </TabContent>
            <TabContent tab="exit">
              <ExitTab />
            </TabContent>
          </Tabs>
          <div className="case-reference">
            <p>Case Study: "Styles & Wood – Behind the Scenes of Retail"</p>
            <p>
              Prepared by Alberto Pons, Kay Nemoto, Eli Talmor
            </p>
            <p>
              <a href="index.html" style={{ color: '#000', textDecoration: 'none', marginRight: '16px' }}>← Back to Main</a>
              Vibe-coded by <a href="https://www.linkedin.com/in/dima-malyshenko/" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'none' }}>Dima Malyshenko</a>
            </p>
          </div>
        </div>
      </div>
    </LBOAssumptionsProvider>
  )
}

export default App

