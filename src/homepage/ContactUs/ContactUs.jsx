import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
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

const ContactInfoCard = ({ icon: Icon, title, content, delay }) => (
  <motion.div
    variants={FadeUp(delay)}
    initial="initial"
    animate="animate"
    className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center"
  >
    <div className="bg-secondary/10 p-4 rounded-full mb-4">
      <Icon className="w-6 h-6 text-secondary" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </motion.div>
);

const ContactUs = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-light py-16">
      <div className="container">
        {/* Header Sektion */}
        <motion.div
          variants={FadeUp(0.2)}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">{t('contactUs.title')}</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t('contactUs.subtitle')}
          </p>
        </motion.div>

        {/* Kontaktinfo Karten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <ContactInfoCard
            icon={MapPin}
            title={t('contactUs.address')}
            content="Bulevardul Cloșca, nr. 72, Satu Mare, Romania"
            delay={0.3}
          />
          <ContactInfoCard
            icon={Phone}
            title={t('contactUs.phone')}
            content="0261722185"
            delay={0.4}
          />
          <ContactInfoCard
            icon={Mail}
            title={t('contactUs.email')}
            content="ltg@lgerm-ettinger.ro"
            delay={0.5}
          />
          <ContactInfoCard
            icon={Clock}
            title={t('contactUs.officeHours')}
            content={t('contactUs.officeHoursValue')}
            delay={0.6}
          />
        </div>

        {/* Kontaktformular und Karte Sektion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Kontaktformular */}
          <motion.div
            variants={FadeUp(0.7)}
            initial="initial"
            animate="animate"
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-6">{t('contactUs.sendMessage')}</h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contactUs.form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder={t('contactUs.form.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contactUs.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder={t('contactUs.form.emailPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contactUs.form.subject')}
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder={t('contactUs.form.subjectPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contactUs.form.message')}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder={t('contactUs.form.messagePlaceholder')}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-secondary text-white py-3 px-6 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
              >
                {t('contactUs.form.send')}
              </button>
            </form>
          </motion.div>

          <motion.div
            variants={FadeUp(0.8)}
            initial="initial"
            animate="animate"
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-6">{t('contactUs.findUs')}</h3>
            <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                title="School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3299.2843534766475!2d22.863807476799664!3d47.77518147632032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4738067e1c4e1501%3A0x3e45269aaadaafa5!2sJohann%20Ettinger%20German%20Theoretical%20Highschool!5e1!3m2!1sde!2sro!4v1736964901068!5m2!1sde!2sro"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;