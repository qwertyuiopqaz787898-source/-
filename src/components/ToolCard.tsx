import React from 'react';
import { motion } from 'motion/react';
import { playHover, playClick } from '../utils/audio';

interface ToolCardProps {
  key?: React.Key;
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

export default function ToolCard({ title, description, icon: Icon, onClick }: ToolCardProps) {
  return (
    <motion.button
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={playHover}
      onClick={() => { playClick(); onClick(); }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 text-right flex flex-col items-start gap-4 group hover:border-indigo-100 w-full"
    >
      <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </motion.button>
  );
}
