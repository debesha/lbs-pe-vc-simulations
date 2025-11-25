import './index.css'

function App() {
  return (
    <div className="app">
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1 style={{ marginBottom: '50px', color: '#fff' }}>LBS PE/VC Simulations</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <a 
            href="./vestaron.html" 
            style={{
              display: 'inline-block',
              padding: '20px 40px',
              backgroundColor: '#fff',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Vestaron Case Study Modelling
          </a>
        </div>
      </div>
    </div>
  )
}

export default App

