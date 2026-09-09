import { Layout } from 'lucide-react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { AuthLayout, GuestLayout } from './pages/Layout'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'
import { PreviewPage } from './pages/PreviewPage'

const App = () => {
  return (
    <Routes>
      <Route element={<GuestLayout/>}>
        <Route path='/register' element={<AuthPage mode='register'/>} />
        <Route path='/login' element={<AuthPage mode='login'/>} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthLayout/>}>
        <Route path='/preview/:id' element={<PreviewPage/>} />
        <Route path='/builder/:id' element={<BuilderPage/>} />
        <Route path='/' element={<HomePage/>} />
      </Route>
    </Routes>
  )
}

export default App