import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import { UIExperienceProvider } from './context/UIExperienceContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UIExperienceProvider>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </UIExperienceProvider>
  </React.StrictMode>,
)
