import React from "react";
import Hero from "../Hero/Hero";
import Services from "../Services/Services";
import VideoSection from "../VideoSection/VideoSection";
import ErasmusProjects from "../ErasmusProjects/ErasmusProjects";
import SpecialEvents from "../SpecialEvents/SpecialEvents";
import Footer from "../Footer/Footer";

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