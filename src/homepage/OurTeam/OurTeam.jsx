import React from "react";
import { motion } from "framer-motion";
import { BsPersonCircle } from "react-icons/bs";

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
  const staffMembers = {
    leadership: [
      {
        name: "Maria Raiz",
        role: "School Principal",
        description: "Leading our school with dedication and commitment to educational excellence.",
        delay: 0.3,
        featured: true
      }
    ],
    viceprincipals: [
      {
        name: "Elek Norbert",
        role: "Vice Principal",
        description: "Supporting school administration and coordinating educational programs.",
        delay: 0.4
      }
    ],
    teachers: [
      {
        name: "Zsolt Kuki",
        role: "Teacher",
        subject: "Music",
        description: "Inspiring students through music education and cultural activities.",
        delay: 0.5
      },
      {
        name: "Maria Tompos",
        role: "Teacher",
        subject: "Romanian Language",
        description: "Dedicated to developing students' language proficiency and literary appreciation.",
        delay: 0.6
      },
      {
        name: "Manuela Dan",
        role: "Teacher",
        subject: "Romanian Language",
        description: "Passionate about Romanian literature and cultural studies.",
        delay: 0.7
      },
      {
        name: "Renata Hodor",
        role: "Teacher",
        subject: "Romanian Language",
        description: "Specialized in Romanian language teaching methodologies.",
        delay: 0.8
      },
      {
        name: "Renata Veron",
        role: "Teacher",
        subject: "Chemistry",
        description: "Making the world of chemistry accessible and exciting for students.",
        delay: 0.9
      },
      {
        name: "Ildiko Bodnar",
        role: "Teacher",
        subject: "German Language",
        description: "Promoting German language skills and cultural understanding.",
        delay: 1.0
      },
      {
        name: "Anzik Ester",
        role: "Teacher",
        subject: "German Language",
        description: "Specializing in German language instruction and literature.",
        delay: 1.1
      },
      {
        name: "Erika Gazsa",
        role: "Teacher",
        subject: "Mathematics",
        description: "Dedicated to developing strong mathematical foundations and problem-solving skills.",
        delay: 1.2
      },
      {
        name: "Mr. Pop",
        role: "Teacher",
        subject: "Mathematics",
        description: "Helping students discover the beauty and logic of mathematics.",
        delay: 1.3
      },
      {
        name: "Mr. Szekely",
        role: "Teacher",
        subject: "Philosophy",
        description: "Encouraging critical thinking and philosophical inquiry.",
        delay: 1.4
      },
      {
        name: "Adrian Tascu",
        role: "Teacher",
        subject: "Physical Education",
        description: "Promoting physical fitness and team sports.",
        delay: 1.5
      },
      {
        name: "Sebi",
        role: "Teacher",
        subject: "Physical Education",
        description: "Dedicated to students' physical development and sports excellence.",
        delay: 1.6
      },
      {
        name: "Bogdan Stana",
        role: "Teacher",
        subject: "History",
        description: "Making history come alive through engaging teaching methods.",
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
          Our Team
        </motion.h2>
        
        <motion.p
          variants={FadeUp(0.3)}
          initial="initial"
          animate="animate"
          className="text-lg text-center text-gray-700 mb-12 max-w-2xl mx-auto"
        >
          Meet the dedicated professionals who make Liceul Teoretic German "Johann Ettinger" 
          a center of excellence in bilingual education.
        </motion.p>

        {/* School Leadership */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">School Leadership</h3>
          <div className="grid grid-cols-1 gap-8">
            {staffMembers.leadership.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Vice Principals */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">Vice Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {staffMembers.viceprincipals.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Teachers */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center">Teachers</h3>
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