import React from "react";
import Hero from "./components/Hero/Hero";
import Services from "./components/Services/Services";
import VideoSection from "./components/VideoSection/VideoSection";
import ErasmusProjects from "./components/ErasmusProjects/ErasmusProjects";
import SpecialEvents from "./components/SpecialEvents/SpecialEvents";
import Footer from "./components/Footer/Footer";

const App = () => {
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

export default App;