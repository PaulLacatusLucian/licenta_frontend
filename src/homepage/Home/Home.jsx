import React from "react";
import Hero from "../Hero/Hero"; // Importă Hero
import Services from "../Services/Services"; // Importă Services
import VideoSection from "../VideoSection/VideoSection"; // Importă VideoSection
import ErasmusProjects from "../ErasmusProjects/ErasmusProjects"; // Importă ErasmusProjects
import SpecialEvents from "../SpecialEvents/SpecialEvents"; // Importă SpecialEvents
import Footer from "../Footer/Footer"; // Importă Footer

const Home = () => {
  return (
    <main className="overflow-x-hidden bg-white text-dark">
      <Hero />
      <Services />
      <VideoSection />
      <ErasmusProjects />
      <SpecialEvents />
      <Footer />
    </main>
  );
};

export default Home;
