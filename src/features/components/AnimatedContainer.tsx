import { motion } from "framer-motion";
import React from "react";

interface AnimatedContainerProps {
  children: React.ReactNode;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeIn" }}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
