import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import WaitlistLanding from "@/pages/WaitlistLanding"
import NotFound from "@/pages/NotFound"
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/waitlist" element={<WaitlistLanding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App