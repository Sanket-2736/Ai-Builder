import { Layout } from 'lucide-react'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { AuthLayout, GuestLayout } from './pages/Layout'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'
import { PreviewPage } from './pages/PreviewPage'
import { Toaster } from 'react-hot-toast'
import PublishPage from './pages/PublishPage'

const App = () => {
  return (
    <>
      <Toaster/>
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

        <Route path='/publih/:id' element={<PublishPage/>}/>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  )
}

export default App