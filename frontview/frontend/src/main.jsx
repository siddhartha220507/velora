import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'

import { WorkspaceProvider } from './context/WorkspaceContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </React.StrictMode>,
)
