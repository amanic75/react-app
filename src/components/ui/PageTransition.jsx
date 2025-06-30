import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth feel
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 