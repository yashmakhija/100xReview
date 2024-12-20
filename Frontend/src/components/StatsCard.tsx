import React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  darkMode: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  darkMode,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl border ${
        darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
      } shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-30" />
      <div className="relative p-6 flex items-center">
        <div
          className={`p-3 rounded-full mr-4 ${
            darkMode ? "bg-zinc-700" : "bg-gray-100"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-2xl font-semibold mt-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
