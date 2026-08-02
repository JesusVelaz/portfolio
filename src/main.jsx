import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SmoothScrollProvider } from './components/SmoothScrollProvider.jsx'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SmoothScrollProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SmoothScrollProvider>
  </React.StrictMode>
)
