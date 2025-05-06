import React from "react";
import Navbar from "../Navbar/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="mt-24 flex-grow w-full">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;