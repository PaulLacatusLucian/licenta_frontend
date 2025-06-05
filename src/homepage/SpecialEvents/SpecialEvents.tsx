import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

// Bilder für Veranstaltungen
import matchImage from "../../assets/event-1.jpg";
import weihnachtsbasarImage from "../../assets/event-2.jpg";
import eratosthenesImage from "../../assets/event-3.jpg";

// Animation für Eingang
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
  const { t } = useTranslation();

  const events = [
    {
      image: matchImage,
      title: t('specialEvents.studentsVsTeachers.title'),
      description: t('specialEvents.studentsVsTeachers.desc'),
      delay: 0.6,
    },
    {
      image: weihnachtsbasarImage,
      title: t('specialEvents.christmasMarket.title'),
      description: t('specialEvents.christmasMarket.desc'),
      delay: 0.7,
    },
    {
      image: eratosthenesImage,
      title: t('specialEvents.eratosthenes.title'),
      description: t('specialEvents.eratosthenes.desc'),
      delay: 0.8,
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container">
        {/* Sektionstitel */}
        <motion.h2
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold text-center pb-10"
        >
          {t('specialEvents.title')}
        </motion.h2>

        {/* Sektionsbeschreibung */}
        <motion.p
          variants={FadeUp(0.4)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mb-12"
        >
          {t('specialEvents.subtitle')}
        </motion.p>

        {/* Liste der besonderen Veranstaltungen */}
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