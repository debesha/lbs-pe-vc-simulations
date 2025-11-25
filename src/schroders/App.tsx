import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')

  const handleClick = () => {
    setMessage('Hello World from Schroders!')
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Stewardship of Multi-Generational Family Wealth at Schroders</h1>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          gap: '20px'
        }}>
          <button
            onClick={handleClick}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5568d3'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Click for Hello World
          </button>
          
          {message && (
            <div style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#667eea',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              {message}
            </div>
          )}
        </div>

        <div className="case-reference">
          <p>Case Study: "Stewardship of Multi-Generational Family Wealth at Schroders"</p>
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

