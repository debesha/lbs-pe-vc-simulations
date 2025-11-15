import { Tabs } from './components/Tabs'
import { TabContent } from './components/TabContent'
import { DilutionTab } from './components/DilutionTab'
import { ReturnComparisonTab } from './components/ReturnComparisonTab'
import './App.css'

function App() {
  return (
    <div className="app">
      <div className="container">
        <h1>Vestaron Case Study Modelling</h1>
        <Tabs>
          <TabContent tab="dilution">
            <DilutionTab />
          </TabContent>
          <TabContent tab="return">
            <ReturnComparisonTab />
          </TabContent>
        </Tabs>
        <div className="case-reference">
          <p>Case Study: "Vestaron – Enabling a Revolution in Crop Protection"</p>
          <p>
            Prepared by Professor Florin Vasvari, Academic Director at the Institute of
            Entrepreneurship and Private Capital, London Business School
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
