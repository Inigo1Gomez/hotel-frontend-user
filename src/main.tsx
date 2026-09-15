import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/search.css'
import './styles/home.css'
import './styles/results.css'
import './styles/detail.css'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el nodo #root en index.html')

createRoot(container).render(
  <StrictMode>
    {/* BASE_URL es "/" en desarrollo y "/hotel-frontend-user/" en GitHub Pages (--base del build). */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
