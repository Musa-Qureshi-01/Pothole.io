import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/NeonAuthContext'
import { ThemeProvider } from './context/ThemeContext'

const savedTheme = localStorage.getItem('pothole-app-theme') || 'light';
if (savedTheme === 'dark') document.documentElement.classList.add('dark');
else document.documentElement.classList.remove('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
