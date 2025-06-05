import React from "react";
import { FaGraduationCap } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { MdSportsSoccer } from "react-icons/md";
import { FiShield } from "react-icons/fi";
import { IoMdHappy } from "react-icons/io";
import { IoIosSchool } from "react-icons/io";
import { RiComputerLine } from "react-icons/ri";
import { FaRegClock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const SlideLeft = (delay) => {
  return {
    initial: {
      opacity: 0,
      x: 50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

const Services = () => {
  const { t } = useTranslation();

  const ServicesData = [
    {
      id: 1,
      title: t('services.education'),
      link: "#",
      icon: <FaGraduationCap />,
      delay: 0.2,
    },
    {
      id: 2,
      title: t('services.cafeteria'),
      link: "#",
      icon: <MdRestaurant />,
      delay: 0.3,
    },
    {
      id: 3,
      title: t('services.sportsField'),
      link: "#",
      icon: <MdSportsSoccer />,
      delay: 0.4,
    },
    {
      id: 4,
      title: t('services.security'),
      link: "#",
      icon: <FiShield />,
      delay: 0.5,
    },
    {
      id: 5,
      title: t('services.afterSchool'),
      link: "#",
      icon: <FaRegClock />,
      delay: 0.6,
    },
    {
      id: 6,
      title: t('services.modernEquipment'),
      link: "#",
      icon: <RiComputerLine />,
      delay: 1.2,
    },
  ];

  return (
    <section className="bg-white">
      <div className="container pb-14 pt-16">
        <h1 className="text-4xl font-bold text-left pb-10">
          {t('services.title')}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {ServicesData.map((service) => (
            <motion.div
              key={service.id}
              variants={SlideLeft(service.delay)}
              initial="initial"
              whileInView={"animate"}
              viewport={{ once: true }}
              className="bg-[#f4f4f4] rounded-2xl flex flex-col gap-4 items-center justify-center p-4 py-7 hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h1 className="text-lg font-semibold text-center px-3">
                {service.title}
              </h1>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;