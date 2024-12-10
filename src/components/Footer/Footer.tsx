import React from "react";
import sponsor1 from "../../assets/ecdl-sponsor.png";
import sponsor2 from "../../assets/dsd-sponsor.png";
import sponsor3 from "../../assets/medias-sponsor.png";
import sponsor4 from "../../assets/wolfenbuttel-sponsor.png";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container flex justify-between items-center">
        {/* Sponsori */}
        <div className="flex flex-wrap gap-6 justify-start">
          <h4 className="text-lg font-semibold mb-4 w-full">Our Sponsors</h4>
          {/* Logo-urile sponsorilor */}
          <img src={sponsor1} alt="Sponsor 1" className="w-32 h-32 object-contain" />
          <img src={sponsor2} alt="Sponsor 2" className="w-32 h-32 object-contain" />
          <img src={sponsor3} alt="Sponsor 3" className="w-32 h-32 object-contain" />
          {/* Sponsor 4 - dimensiune ajustată */}
          <img src={sponsor4} alt="Sponsor 4" className="w-28 h-28 object-contain" /> {/* Reducerea dimensiunii */}
        </div>

        {/* Contact sau alte informații */}
        <div className="text-right">
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <p>Email: ltg@lgerm-ettinger.ro</p>
          <p>Phone: 0261722185</p>
          <p>Address: Bulevardul Cloșca, nr. 72, Satu Mare</p>
        </div>
      </div>

      <div className="mt-12 text-center text-sm">
        <p>© 2024 Liceul Teoretic German "Johann Ettinger". All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
