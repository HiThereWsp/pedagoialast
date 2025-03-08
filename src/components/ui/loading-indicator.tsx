
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
  type?: "dots" | "spinner";
}

export const LoadingIndicator = ({ 
  message, 
  submessage, 
  size = "md",
  type = "dots" 
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };

  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {type === "dots" ? (
        <div className="flex items-center justify-center space-x-2">
          <motion.div 
            className={`${sizeClasses[size]} bg-[#FEF7CD] rounded-full`}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div 
            className={`${sizeClasses[size]} bg-[#FFDEE2] rounded-full`}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.div 
            className={`${sizeClasses[size]} bg-[#FEC6A1] rounded-full`}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      ) : (
        <Loader2 className={`${spinnerSizes[size]} animate-spin text-[#FFA800]`} />
      )}
      
      {message && <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{message}</p>}
      {submessage && <p className="text-xs text-gray-400 dark:text-gray-500 text-center">{submessage}</p>}
    </div>
  );
};
