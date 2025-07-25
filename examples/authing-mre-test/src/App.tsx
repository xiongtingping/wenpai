import { Routes, Route } from 'react-router-dom'
import { AuthingProvider } from './contexts/AuthingContext'
import HomePage from './pages/HomePage'
import CallbackPage from './pages/CallbackPage'
import './App.css'

function App() {
  return (
    <AuthingProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </div>
    </AuthingProvider>
  )
}

export default App 