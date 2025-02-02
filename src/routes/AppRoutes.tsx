import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Settings from '@/pages/Settings'
import PdfChatPage from '@/pages/PdfChatPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/pdf-chat" element={<PdfChatPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
