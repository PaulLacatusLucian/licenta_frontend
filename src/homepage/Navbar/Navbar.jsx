import React, { useState, useEffect } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const NavbarMenu = [
    {
      id: 1,
      title: t('navbar.home'),
      path: "/LTG/",
    },
    {
      id: 2,
      title: t('navbar.services'),
      path: "/LTG/services",
    },
    {
      id: 3,
      title: t('navbar.aboutUs'),
      path: "/LTG/about-us",
    },
    {
      id: 4,
      title: t('navbar.ourTeam'),
      path: "/LTG/our-team",
    },
    {
      id: 5,
      title: t('navbar.contactUs'),
      path: "/LTG/contact-us",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg py-2" : "bg-white/90 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo section */}
          <div className="flex-shrink-0">
            <h1 
              className="font-bold text-xl md:text-2xl text-gray-800 cursor-pointer transition-all"
              onClick={() => navigate("/")}
            >
              {t('navbar.schoolName')}
            </h1>
          </div>
          
          {/* Desktop Menu section */}
          <div className="hidden lg:block">
            <ul className="flex items-center space-x-1">
              {NavbarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <li key={menu.id}>
                    <a
                      href={menu.path}
                      className={`inline-block py-2 px-4 rounded-md font-medium transition-all relative group ${
                        isActive 
                          ? "text-secondary" 
                          : "text-gray-700 hover:text-secondary hover:bg-gray-50"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary mx-4"
                          initial={false}
                        />
                      )}
                      {menu.title}
                    </a>
                  </li>
                );
              })}
              <li className="ml-2">
                <LanguageSwitcher />
              </li>
              <li className="ml-2">
                <button
                  className="py-2 px-6 bg-secondary text-white rounded-md font-medium hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => navigate("/login")}
                >
                  {t('navbar.signIn')}
                </button>
              </li>
            </ul>
          </div>
          
          {/* Mobile Hamburger menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button 
              className="p-2 rounded-md text-gray-700 hover:text-secondary hover:bg-gray-100 focus:outline-none transition-all"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <IoMdClose className="text-3xl" />
              ) : (
                <IoMdMenu className="text-3xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="container mx-auto px-4 py-2">
              <ul className="divide-y divide-gray-100">
                {NavbarMenu.map((menu) => {
                  const isActive = location.pathname === menu.path;
                  return (
                    <li key={menu.id}>
                      <a
                        href={menu.path}
                        className={`block py-3 px-4 rounded-md font-medium transition-all ${
                          isActive ? "text-secondary bg-gray-50" : "text-gray-700 hover:text-secondary hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {menu.title}
                      </a>
                    </li>
                  );
                })}
                <li className="py-4 px-4">
                  <button
                    className="w-full py-3 bg-secondary text-white rounded-md font-medium hover:bg-secondary/90 transition-all shadow-md"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('navbar.signIn')}
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
