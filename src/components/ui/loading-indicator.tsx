
import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  message?: string;
  submessage?: string;
}

export const LoadingIndicator = ({ message, submessage }: LoadingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center space-x-2">
        <motion.div 
          className="w-2 h-2 bg-[#FEF7CD] rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="w-2 h-2 bg-[#FFDEE2] rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.div 
          className="w-2 h-2 bg-[#FEC6A1] rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
      
      {message && <p className="text-sm text-gray-600">{message}</p>}
      {submessage && <p className="text-xs text-gray-400">{submessage}</p>}
    </div>
  );
};
