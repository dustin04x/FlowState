import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './styles.css'
import { applyStoredTheme } from './theme'

applyStoredTheme()

const isMiniClock = window.location.search.includes('mini')

if (isMiniClock) {
  import('./miniClock')
} else {
  import('./App').then((mod) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><mod.default /></React.StrictMode>)
  })
}
