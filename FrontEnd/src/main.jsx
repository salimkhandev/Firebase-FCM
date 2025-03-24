import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
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
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
