import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HZ from './hz'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App /> 
//   </StrictMode>,
// )

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello HZ-Engine</div>
  },
  {
    path: "/hz",
    element: <HZ projectPath='./project' cachePath='./cache' savePath='./save' /> 
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
