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
            Prepared by Professor <a href="https://www.london.edu/faculty-and-research/faculty-profiles/v/vasvari-v" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'none' }}>Florin Vasvari</a>, Academic Director at the Institute of
            Entrepreneurship and Private Capital, London Business School
          </p>
          <p>
            <a href="index.html" style={{ color: '#000', textDecoration: 'none', marginRight: '16px' }}>← Back to Main</a>
            Vibe-coded by <a href="https://www.linkedin.com/in/dima-malyshenko/" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'none' }}>Dima Malyshenko</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
