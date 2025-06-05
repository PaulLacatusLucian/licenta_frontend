import React from "react";
import { motion } from "framer-motion";
import { BsPersonCircle } from "react-icons/bs";
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

const StaffCard = ({ name, role, subject, description, imageUrl, delay, featured }) => (
  <motion.div
    variants={FadeUp(delay)}
    initial="initial"
    animate="animate"
    className={`bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 
      ${featured ? 'md:col-span-2 lg:col-span-3' : ''}`}
  >
    <div className={`flex ${featured ? 'md:flex-row' : 'flex-col'} items-center gap-6`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${featured ? 'w-48 h-48' : 'w-40 h-40'} rounded-full object-cover border-4 border-secondary`}
        />
      ) : (
        <div className={`${featured ? 'w-48 h-48' : 'w-40 h-40'} rounded-full border-4 border-secondary flex items-center justify-center bg-gray-100`}>
          <BsPersonCircle className="text-secondary text-5xl" />
        </div>
      )}
      <div className={`flex flex-col ${featured ? 'text-left' : 'items-center text-center'}`}>
        <h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-semibold mb-1`}>{name}</h3>
        <p className="text-secondary font-medium mb-1">{role}</p>
        {subject && <p className="text-gray-600 mb-2">{subject}</p>}
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </div>
  </motion.div>
);

const OurTeam = () => {
  const { t } = useTranslation();

  const staffMembers = {
    leadership: [
      {
        name: "Maria Raiz",
        role: t('ourTeam.roles.principal'),
        description: t('ourTeam.principal.description'),
        delay: 0.3,
        featured: true
      }
    ],
    viceprincipals: [
      {
        name: "Elek Norbert",
        role: t('ourTeam.roles.vicePrincipal'),
        description: t('ourTeam.vicePrincipalDesc.description'),
        delay: 0.4
      }
    ],
    teachers: [
      {
        name: "Zsolt Kuki",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.music'),
        description: t('ourTeam.teacherDescriptions.zsoltKuki'),
        delay: 0.5
      },
      {
        name: "Maria Tompos",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.romanianLanguage'),
        description: t('ourTeam.teacherDescriptions.mariaTompos'),
        delay: 0.6
      },
      {
        name: "Manuela Dan",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.romanianLanguage'),
        description: t('ourTeam.teacherDescriptions.manuelaDan'),
        delay: 0.7
      },
      {
        name: "Renata Hodor",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.romanianLanguage'),
        description: t('ourTeam.teacherDescriptions.renataHodor'),
        delay: 0.8
      },
      {
        name: "Renata Veron",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.chemistry'),
        description: t('ourTeam.teacherDescriptions.renataVeron'),
        delay: 0.9
      },
      {
        name: "Ildiko Bodnar",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.germanLanguage'),
        description: t('ourTeam.teacherDescriptions.ildikoBodnar'),
        delay: 1.0
      },
      {
        name: "Anzik Ester",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.germanLanguage'),
        description: t('ourTeam.teacherDescriptions.anzikEster'),
        delay: 1.1
      },
      {
        name: "Erika Gazsa",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.mathematics'),
        description: t('ourTeam.teacherDescriptions.erikaGazsa'),
        delay: 1.2
      },
      {
        name: "Mr. Pop",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.mathematics'),
        description: t('ourTeam.teacherDescriptions.mrPop'),
        delay: 1.3
      },
      {
        name: "Mr. Szekely",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.philosophy'),
        description: t('ourTeam.teacherDescriptions.mrSzekely'),
        delay: 1.4
      },
      {
        name: "Adrian Tascu",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.physicalEducation'),
        description: t('ourTeam.teacherDescriptions.adrianTascu'),
        delay: 1.5
      },
      {
        name: "Sebi",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.physicalEducation'),
        description: t('ourTeam.teacherDescriptions.sebi'),
        delay: 1.6
      },
      {
        name: "Bogdan Stana",
        role: t('ourTeam.roles.teacher'),
        subject: t('ourTeam.subjects.history'),
        description: t('ourTeam.teacherDescriptions.bogdanStana'),
        delay: 1.7
      }
    ]
  };

  return (
    <section className="bg-light py-16">
      <div className="container">
        <motion.h2
          variants={FadeUp(0.2)}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold text-center mb-4"
        >
          {t('ourTeam.title')}
        </motion.h2>
        
        <motion.p
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mb-12 max-w-2xl mx-auto"
        >
          {t('ourTeam.subtitle')}
        </motion.p>

        {/* Schulleitung */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">{t('ourTeam.leadership')}</h3>
          <div className="grid grid-cols-1 gap-8">
            {staffMembers.leadership.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Stellvertretende Schulleitung */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">{t('ourTeam.vicePrincipal')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {staffMembers.viceprincipals.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Lehrer */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center">{t('ourTeam.teachers')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.teachers.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;