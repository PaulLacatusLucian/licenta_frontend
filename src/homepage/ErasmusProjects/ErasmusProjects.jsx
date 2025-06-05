import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

import ProjectCard from "./ProjectCard";
import projectImage1 from "../../assets/erasmus-1.jpg";
import projectImage2 from "../../assets/erasmus-2.jpg";
import projectImage3 from "../../assets/erasmus-3.jpg";
import projectImage4 from "../../assets/erasmus-4.jpg";
import projectImage5 from "../../assets/erasmus-5.jpg";
import projectImage6 from "../../assets/erasmus-6.jpg";
import projectImage7 from "../../assets/erasmus-7.jpg";
import projectImage8 from "../../assets/erasmus-8.jpg";
import projectImage9 from "../../assets/erasmus-9.jpg";
import { FadeUp } from "../Hero/Hero";

const ErasmusProjects = () => {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(0);
  const targetCount = 100;

  useEffect(() => {
    if (counter < targetCount) {
      const interval = setInterval(() => {
        setCounter((prevCount) => Math.min(prevCount + 1, targetCount));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [counter]);

  const projects = [
    { image: projectImage1, title: "Erasmus+ \"Förderung didaktischer Strategien\"", delay: 0.6 },
    { image: projectImage2, title: "Erasmus+ \"Glas begeistert\"", delay: 0.7 },
    { image: projectImage3, title: "Erasmus+ \"Theatre-a common language to express ourselves\"", delay: 0.8 },
    { image: projectImage4, title: "Erasmus+ \"No Time To Waste\"", delay: 0.9 },
    { image: projectImage5, title: "Erasmus+ \"The world is in the hands of children\"", delay: 1.0 },
    { image: projectImage6, title: "Erasmus+ \"Cross into the Languages\"", delay: 1.1 },
    { image: projectImage7, title: "Erasmus+ \"Mein Deutsch ist gut, ich spreche mit Mut!\"", delay: 1.2 },
    { image: projectImage8, title: "Erasmus+ \"Cross Into The Languages\"", delay: 1.3 },
    { image: projectImage9, title: "Erasmus+ \"Playful Mathematics\"", delay: 1.4 },
  ];

  return (
    <section className="bg-light py-16">
      <div className="container">
        {/* Titel der Sektion */}
        <motion.h2
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold text-center pb-10"
        >
          {t('erasmus.title')}
        </motion.h2>

        {/* Zähler */}
        <motion.div
          variants={FadeUp(0.4)}
          initial="initial"
          animate="animate"
          className="text-5xl font-bold text-center mb-8"
        >
          <span className="text-secondary">{counter}+ </span>
          {t('erasmus.counter')}
        </motion.div>

        {/* Beschreibung */}
        <motion.p
          variants={FadeUp(0.5)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mb-12"
        >
          {t('erasmus.description')}
        </motion.p>

        {/* Erasmus-Projektliste */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              image={project.image}
              title={project.title}
              delay={project.delay}
            />
          ))}
        </div>

        {/* "Und viele weitere Projekte" Text */}
        <motion.div
          variants={FadeUp(0.6)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mt-12"
        >
          {t('erasmus.andMore')}
        </motion.div>
      </div>
    </section>
  );
};

export default ErasmusProjects;