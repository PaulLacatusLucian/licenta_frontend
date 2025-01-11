import React from "react";
import { motion } from "framer-motion";

// Images for events
import matchImage from "../../assets/event-1.jpg"; // Replace with your own images
import weihnachtsbasarImage from "../../assets/event-2.jpg";
import eratosthenesImage from "../../assets/event-3.jpg";

// Animation for entrance
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

const SpecialEvents = () => {
  const events = [
    {
      image: matchImage,
      title: "Students vs Teachers Match (12th Grade)",
      description:
        "A friendly, yet emotional match between students and teachers from the 12th grade, held annually.",
      delay: 0.6,
    },
    {
      image: weihnachtsbasarImage,
      title: "Weihnachtsbasar (Christmas Market)",
      description:
        "The school's Christmas market, where students and teachers collaborate to sell traditional and handmade products.",
      delay: 0.7,
    },
    {
      image: eratosthenesImage,
      title: "Eratosthenes Experiment",
      description:
        "A fascinating experiment that allows students to measure the Earth's circumference using only the shadow of a pillar and geography.",
      delay: 0.8,
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container">
        {/* Section Title */}
        <motion.h2
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold text-center pb-10"
        >
          Special Events at Our School
        </motion.h2>

        {/* Section Description */}
        <motion.p
          variants={FadeUp(0.4)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mb-12"
        >
          Our school is not just about academics. We also celebrate creativity, fun, and tradition through various special events
          throughout the year. Here are some of our highlights:
        </motion.p>

        {/* List of special events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {events.map((event, index) => (
            <motion.div
              key={index}
              variants={FadeUp(event.delay)}
              initial="initial"
              animate="animate"
              className="bg-gray-100 p-6 rounded-xl shadow-xl transform hover:scale-105 transition duration-300"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2 text-center">{event.title}</h3>
              <p className="text-gray-600 text-center">{event.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialEvents;
