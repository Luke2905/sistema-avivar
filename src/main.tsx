import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Importe isso!
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* O Router deve ser o pai de todos que usam rotas */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)