import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Globe, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const StatCard = ({ icon: Icon, title, value, delay }) => (
  <motion.div
    variants={FadeUp(delay)}
    initial="initial"
    animate="animate"
    className="bg-white p-6 rounded-xl shadow-lg text-center"
  >
    <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-secondary" />
    </div>
    <h3 className="text-4xl font-bold mb-2">{value}</h3>
    <p className="text-gray-600">{title}</p>
  </motion.div>
);

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-light">
      {/* Hero Sektion */}
      <section className="relative h-[400px] bg-secondary/10 overflow-hidden">
        <div className="container h-full flex items-center justify-center">
          <motion.div
            variants={FadeUp(0.2)}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('aboutUs.ourStory')}
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('aboutUs.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistiken Sektion */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={Users}
              title={t('aboutUs.stats.students')}
              value="500+"
              delay={0.3}
            />
            <StatCard
              icon={BookOpen}
              title={t('aboutUs.stats.yearsOfExcellence')}
              value="26"
              delay={0.4}
            />
            <StatCard
              icon={Globe}
              title={t('aboutUs.stats.exchangePrograms')}
              value="15+"
              delay={0.5}
            />
            <StatCard
              icon={Award}
              title={t('aboutUs.stats.awards')}
              value="100+"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">{t('aboutUs.missionVision.title')}</h2>
            <p className="text-lg text-gray-700 mb-8">
              {t('aboutUs.missionVision.mission')}
            </p>
            <p className="text-lg text-gray-700">
              {t('aboutUs.missionVision.vision')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Geschichte Timeline */}
      <section className="py-16">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            {t('aboutUs.journey.title')}
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={FadeUp(0.4)}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">1997</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">{t('aboutUs.journey.1997.title')}</h4>
                  <p className="text-gray-700">{t('aboutUs.journey.1997.desc')}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2005</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">{t('aboutUs.journey.2005.title')}</h4>
                  <p className="text-gray-700">{t('aboutUs.journey.2005.desc')}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2010</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">{t('aboutUs.journey.2010.title')}</h4>
                  <p className="text-gray-700">{t('aboutUs.journey.2010.desc')}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2023</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">{t('aboutUs.journey.2023.title')}</h4>
                  <p className="text-gray-700">{t('aboutUs.journey.2023.desc')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Werte Sektion */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            {t('aboutUs.values.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={FadeUp(0.4)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">{t('aboutUs.values.academicExcellence.title')}</h3>
              <p className="text-gray-700">
                {t('aboutUs.values.academicExcellence.desc')}
              </p>
            </motion.div>

            <motion.div
              variants={FadeUp(0.5)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">{t('aboutUs.values.culturalUnderstanding.title')}</h3>
              <p className="text-gray-700">
                {t('aboutUs.values.culturalUnderstanding.desc')}
              </p>
            </motion.div>

            <motion.div
              variants={FadeUp(0.6)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">{t('aboutUs.values.innovation.title')}</h3>
              <p className="text-gray-700">
                {t('aboutUs.values.innovation.desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;