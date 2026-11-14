import React from 'react'
import ReactDOM from 'react-dom/client'
// Font cài sẵn trong node_modules (không tải từ Google) — đủ dấu tiếng Việt
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import Root from './app/Root'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
