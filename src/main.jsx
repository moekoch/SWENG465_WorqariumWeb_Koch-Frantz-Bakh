import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applySettingsToPage, loadSettings } from './settings.js'

// apply saved comfort settings (reduced motion, text size) before the first paint
applySettingsToPage(loadSettings())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
