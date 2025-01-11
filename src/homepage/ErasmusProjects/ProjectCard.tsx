import React from "react";
import { motion } from "framer-motion";

// Animația pentru intrare
const FadeUp = (delay) => {
  return {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

const ProjectCard = ({ image, title, delay }) => {
  return (
    <motion.div
      variants={FadeUp(delay)}
      initial="initial"
      animate="animate"
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <img src={image} alt={title} className="w-full h-40 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
    </motion.div>
  );
};

export default ProjectCard;
