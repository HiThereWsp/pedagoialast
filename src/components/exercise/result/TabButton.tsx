
import { cn } from "@/lib/utils";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
        isActive 
          ? "bg-orange-100 text-orange-900" 
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}
