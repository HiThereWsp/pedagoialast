import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes/AppRoutes"
import { Toaster } from "@/components/ui/toaster"
import { HelmetProvider } from "react-helmet-async"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { supabase } from "./integrations/supabase/client"

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <HelmetProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </HelmetProvider>
    </SessionContextProvider>
  )
}

export default App