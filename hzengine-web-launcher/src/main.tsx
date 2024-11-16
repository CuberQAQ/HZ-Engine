import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HZ from './hz'
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App /> 
//   </StrictMode>,
// )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HZ projectPath='./project' cachePath='./cache' savePath='./save' /> 
  </StrictMode>,
)
