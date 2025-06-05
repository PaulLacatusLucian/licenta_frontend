import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Globe, 
  Users, 
  Medal, 
  Music, 
  Microscope,
  Code,
  Heart,
  Video,
  Library
} from 'lucide-react';

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

const ServiceCard = ({ icon: Icon, title, description, features, delay }) => (
  <motion.div
    variants={FadeUp(delay)}
    initial="initial"
    animate="animate"
    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-secondary" />
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-gray-700 mb-6">{description}</p>
    {features && (
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
            {feature}
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

const OurServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const mainServices = [
    {
      icon: BookOpen,
      title: t('ourServices.germanEducation.title'),
      description: t('ourServices.germanEducation.description'),
      features: [
        t('ourServices.germanEducation.features.dsd'),
        t('ourServices.germanEducation.features.native'),
        t('ourServices.germanEducation.features.smallClass'),
        t('ourServices.germanEducation.features.cultural')
      ],
      delay: 0.3
    },
    {
      icon: Globe,
      title: t('ourServices.international.title'),
      description: t('ourServices.international.description'),
      features: [
        t('ourServices.international.features.exchange'),
        t('ourServices.international.features.summer'),
        t('ourServices.international.features.events'),
        t('ourServices.international.features.partnership')
      ],
      delay: 0.4
    },
    {
      icon: Medal,
      title: t('ourServices.academic.title'),
      description: t('ourServices.academic.description'),
      features: [
        t('ourServices.academic.features.dual'),
        t('ourServices.academic.features.advanced'),
        t('ourServices.academic.features.university'),
        t('ourServices.academic.features.competitions')
      ],
      delay: 0.5
    }
  ];

  const additionalServices = [
    {
      icon: Music,
      title: t('ourServices.arts.title'),
      description: t('ourServices.arts.description'),
      delay: 0.6
    },
    {
      icon: Microscope,
      title: t('ourServices.science.title'),
      description: t('ourServices.science.description'),
      delay: 0.7
    },
    {
      icon: Code,
      title: t('ourServices.technology.title'),
      description: t('ourServices.technology.description'),
      delay: 0.8
    },
    {
      icon: Heart,
      title: t('ourServices.support.title'),
      description: t('ourServices.support.description'),
      delay: 0.9
    },
    {
      icon: Video,
      title: t('ourServices.media.title'),
      description: t('ourServices.media.description'),
      delay: 1.0
    },
    {
      icon: Library,
      title: t('ourServices.library.title'),
      description: t('ourServices.library.description'),
      delay: 1.1
    }
  ];

  return (
    <div className="bg-light">
      {/* Hero Sektion */}
      <section className="relative py-20 bg-secondary/10">
        <div className="container">
          <motion.div
            variants={FadeUp(0.2)}
            initial="initial"
            animate="animate"
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('ourServices.title')}
            </h1>
            <p className="text-lg text-gray-700">
              {t('ourServices.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hauptdienstleistungen */}
      <section className="py-16">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            {t('ourServices.corePrograms')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Zusätzliche Dienstleistungen */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            {t('ourServices.additionalServices')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container">
          <motion.div
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="bg-secondary/10 p-12 rounded-xl text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              {t('ourServices.cta.title')}
            </h2>
            <p className="text-gray-700 mb-8">
              {t('ourServices.cta.description')}
            </p>
            <button 
              className="bg-secondary text-white px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
              onClick={() => navigate("/contact-us")}
            >
              {t('ourServices.cta.button')}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurServices;