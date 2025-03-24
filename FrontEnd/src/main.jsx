import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'
// import { BrowserRouter as Router } from 'react-router-dom';


if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    swUrl: '/firebase-messaging-sw.js',
    onNeedRefresh() {
      // if (confirm('New content is available. Would you like to update?')) {
      updateSW(true)
      // }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
    onRegistered() {
      console.log('Service worker registered')
    },
    onRegisterError(error) {
      console.error('Service worker registration error', error)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>

      <App />
    </Router>
  </React.StrictMode>,
)