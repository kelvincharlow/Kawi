import React from 'react'
import ReactDOM from 'react-dom/client'

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'blue' }}>🚀 Digital Fleet System Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h2>Environment Check:</h2>
        <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
        <p><strong>Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
        <p><strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not Set'}</p>
        <p><strong>Has Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)
