import { Link } from "react-router-dom";
import { Wand2 } from "lucide-react";

const AppSidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-lg font-bold">Menu</h2>
        <nav className="mt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
          >
            <span>Home</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
          >
            <span>Chat</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
          >
            <span>Login</span>
          </Link>
          <Link
            to="/pricing"
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
          >
            <span>Pricing</span>
          </Link>
          <Link
            to="/suggestions"
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            <span>Suggestions</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar;
