import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Globe, 
  Users, 
  Medal, 
  Music, 
  Microscope  ,
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
  
  const mainServices = [
    {
      icon: BookOpen,
      title: "German Language Education",
      description: "Comprehensive German language instruction from beginner to advanced levels.",
      features: [
        "DSD (German Language Diploma) preparation",
        "Native German-speaking teachers",
        "Small class sizes for optimal learning",
        "Cultural integration activities"
      ],
      delay: 0.3
    },
    {
      icon: Globe,
      title: "International Programs",
      description: "Exchange programs and international partnerships for global exposure.",
      features: [
        "Student exchange programs with German schools",
        "International summer camps",
        "Cultural exchange events",
        "Partnership with German universities"
      ],
      delay: 0.4
    },
    {
      icon: Medal,
      title: "Academic Excellence",
      description: "Rigorous academic programs following both Romanian and German curricula.",
      features: [
        "Dual language instruction",
        "Advanced placement courses",
        "University preparation programs",
        "Academic competitions support"
      ],
      delay: 0.5
    }
  ];

  const additionalServices = [
    {
      icon: Music,
      title: "Arts & Music",
      description: "Comprehensive arts education including music, theater, and visual arts.",
      delay: 0.6
    },
    {
      icon: Microscope ,
      title: "Science Labs",
      description: "Modern laboratories for physics, chemistry, and biology experiments.",
      delay: 0.7
    },
    {
      icon: Code,
      title: "Technology",
      description: "Computer science courses and digital literacy programs.",
      delay: 0.8
    },
    {
      icon: Heart,
      title: "Student Support",
      description: "Counseling services and academic guidance for all students.",
      delay: 0.9
    },
    {
      icon: Video,
      title: "Media Center",
      description: "Modern media facilities for digital learning and projects.",
      delay: 1.0
    },
    {
      icon: Library,
      title: "Library",
      description: "Extensive collection of German and Romanian literature and resources.",
      delay: 1.1
    }
  ];

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="relative py-20 bg-secondary/10">
        <div className="container">
          <motion.div
            variants={FadeUp(0.2)}
            initial="initial"
            animate="animate"
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-lg text-gray-700">
              Discover the comprehensive educational services and programs we offer 
              to help our students excel in both German and Romanian educational systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            Core Educational Programs
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.h2
            variants={FadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="text-3xl font-bold text-center mb-12"
          >
            Additional Services
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
              Want to Learn More About Our Services?
            </h2>
            <p className="text-gray-700 mb-8">
              Contact us to schedule a visit or learn more about our educational programs.
            </p>
            <button className="bg-secondary text-white px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
            onClick={() => navigate("/contact-us")}>
              Contact Us
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurServices;