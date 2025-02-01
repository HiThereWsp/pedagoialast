import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Chat } from '@/components/chat/Chat'
import { Login } from '@/components/auth/Login'
import { Register } from '@/components/auth/Register'
import { ForgotPassword } from '@/components/auth/ForgotPassword'
import { ResetPassword } from '@/components/auth/ResetPassword'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <div>
      <button 
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => {
          throw new Error("Test Sentry Error!");
        }}
      >
        Test Sentry
      </button>
      
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
      <Toaster />
    </div>
  )
}

export default App