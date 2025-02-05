import React from "react";
import { motion } from "framer-motion";

// Înlocuiește cu ID-ul videoclipului tău
const videoUrl = "https://www.youtube.com/embed/2mrNqd8n7U8";

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

const VideoSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Text Section */}
        <motion.div
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="flex flex-col justify-center px-4"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            A quick video to summarize our school experience
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Watch this short video that captures the essence of our school,
            from the vibrant classroom activities to the exciting extracurricular
            moments. Get a glimpse into the unique experience we offer our students.
          </p>
        </motion.div>

        {/* Video Section */}
        <motion.div
          variants={FadeUp(0.5)}
          initial="initial"
          animate="animate"
          className="flex justify-center"
        >
         <iframe
            width="560"
            height="315"
            src={videoUrl} // Folosește URL-ul corect
            title="School Experience Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          ></iframe>

        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
