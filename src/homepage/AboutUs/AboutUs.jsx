import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Globe, Award } from 'lucide-react';

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
  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-secondary/10 overflow-hidden">
        <div className="container h-full flex items-center justify-center">
          <motion.div
            variants={FadeUp(0.2)}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Story
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Building bridges between cultures through education since 1997
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={Users}
              title="Students"
              value="500+"
              delay={0.3}
            />
            <StatCard
              icon={BookOpen}
              title="Years of Excellence"
              value="26"
              delay={0.4}
            />
            <StatCard
              icon={Globe}
              title="Exchange Programs"
              value="15+"
              delay={0.5}
            />
            <StatCard
              icon={Award}
              title="Awards"
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
            <h2 className="text-3xl font-bold mb-6">Our Mission & Vision</h2>
            <p className="text-lg text-gray-700 mb-8">
              At Liceul Teoretic German "Johann Ettinger", we strive to provide excellent bilingual education 
              that bridges German and Romanian cultures while preparing students for global opportunities.
            </p>
            <p className="text-lg text-gray-700">
              Our vision is to be a leading institution in bilingual education, fostering cultural understanding 
              and academic excellence while nurturing responsible global citizens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            Our Journey
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
                  <h4 className="font-semibold mb-2">School Foundation</h4>
                  <p className="text-gray-700">Establishment of the German theoretical high school in Satu Mare.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2005</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">DSD Program Implementation</h4>
                  <p className="text-gray-700">Introduction of the German Language Diploma (DSD) program.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2010</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">International Partnerships</h4>
                  <p className="text-gray-700">Establishment of key partnerships with German schools and institutions.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-secondary">2023</h3>
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">Modern Campus Development</h4>
                  <p className="text-gray-700">Expansion and modernization of school facilities and programs.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={FadeUp(0.4)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">Academic Excellence</h3>
              <p className="text-gray-700">
                We maintain high academic standards and promote critical thinking through bilingual education.
              </p>
            </motion.div>

            <motion.div
              variants={FadeUp(0.5)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">Cultural Understanding</h3>
              <p className="text-gray-700">
                We foster appreciation for both German and Romanian cultures, promoting diversity and inclusion.
              </p>
            </motion.div>

            <motion.div
              variants={FadeUp(0.6)}
              initial="initial"
              animate="animate"
              className="bg-light p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p className="text-gray-700">
                We embrace modern teaching methods and technologies while maintaining traditional educational values.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;