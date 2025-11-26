import './App.css'

function App() {
  return (
    <div className="app">
      <div className="container">
        <h1>Styles & Wood – Behind the Scenes of Retail</h1>
        <button className="hello-world-button">Hello World</button>
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
  )
}

export default App

