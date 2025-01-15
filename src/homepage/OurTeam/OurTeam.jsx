import React from "react";
import { motion } from "framer-motion";

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
      <img
        src={`/api/placeholder/200/200`}
        alt={name}
        className={`${featured ? 'w-48 h-48' : 'w-40 h-40'} rounded-full object-cover border-4 border-secondary`}
      />
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
        name: "Dr. Maria Schmidt",
        role: "School Principal",
        subject: "German Language and Literature",
        description: "Leading our school with dedication and innovation for over 10 years. Dr. Schmidt has been instrumental in developing our bilingual curriculum and strengthening international partnerships.",
        delay: 0.3,
        featured: true
      }
    ],
    viceprincipals: [
      {
        name: "Prof. Hans Weber",
        role: "Vice Principal of Academic Affairs",
        subject: "Mathematics",
        description: "Passionate about developing strong STEM programs and student initiatives.",
        delay: 0.4
      },
      {
        name: "Prof. Elena Müller",
        role: "Vice Principal of International Relations",
        subject: "English Language",
        description: "Coordinating international exchange programs and language certifications.",
        delay: 0.5
      }
    ],
    administration: [
      {
        name: "Ana Popescu",
        role: "Head Secretary",
        description: "Ensuring smooth administrative operations and student support services.",
        delay: 0.6
      },
      {
        name: "Monica Ionescu",
        role: "School Counselor",
        description: "Supporting students' emotional and academic well-being through guidance and counseling.",
        delay: 0.7
      },
      {
        name: "Laura Nagy",
        role: "Head Librarian",
        description: "Managing our bilingual library and promoting reading culture.",
        delay: 0.8
      }
    ],
    departmentHeads: [
      {
        name: "Dr. Johann Fischer",
        role: "Head of Science Department",
        subject: "Physics & Chemistry",
        description: "Leading our science department with innovative teaching methods.",
        delay: 0.9
      },
      {
        name: "Prof. Stefan Bauer",
        role: "Head of Social Studies",
        subject: "History & Geography",
        description: "Coordinating social studies curriculum and international projects.",
        delay: 1.0
      },
      {
        name: "Prof. Carmen Schneider",
        role: "Head of Arts Department",
        subject: "Arts & Music",
        description: "Directing our school's cultural and artistic programs.",
        delay: 1.1
      }
    ],
    teachers: [
      {
        name: "Prof. Michael Klein",
        role: "Teacher",
        subject: "German Language",
        description: "Specializing in German literature and cultural studies.",
        delay: 1.2
      },
      {
        name: "Prof. Alexandra Popa",
        role: "Teacher",
        subject: "Mathematics",
        description: "Preparing students for national and international competitions.",
        delay: 1.3
      },
      {
        name: "Prof. Robert Wagner",
        role: "Teacher",
        subject: "Computer Science",
        description: "Leading digital literacy initiatives and programming clubs.",
        delay: 1.4
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
          <h3 className="text-2xl font-semibold mb-6 text-center">Vice Principals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {staffMembers.viceprincipals.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Administration */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">Administration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.administration.map((member, index) => (
              <StaffCard key={index} {...member} />
            ))}
          </div>
        </div>

        {/* Department Heads */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">Department Heads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.departmentHeads.map((member, index) => (
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