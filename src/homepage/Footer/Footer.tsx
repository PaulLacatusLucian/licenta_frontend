import React from "react";
import { useTranslation } from 'react-i18next';
import sponsor1 from "../../assets/ecdl-sponsor.png";
import sponsor2 from "../../assets/dsd-sponsor.png";
import sponsor3 from "../../assets/medias-sponsor.png";
import sponsor4 from "../../assets/wolfenbuttel-sponsor.png";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container flex justify-between items-center">
        {/* Sponsoren */}
        <div className="flex flex-wrap gap-6 justify-start">
          <h4 className="text-lg font-semibold mb-4 w-full">{t('footer.sponsors')}</h4>
          {/* Sponsoren-Logos */}
          <img src={sponsor1} alt="Sponsor 1" className="w-32 h-32 object-contain" />
          <img src={sponsor2} alt="Sponsor 2" className="w-32 h-32 object-contain" />
          <img src={sponsor3} alt="Sponsor 3" className="w-32 h-32 object-contain" />
          {/* Sponsor 4 - angepasste Größe */}
          <img src={sponsor4} alt="Sponsor 4" className="w-28 h-28 object-contain" />
        </div>

        {/* Kontaktinformationen */}
        <div className="text-right">
          <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
          <p>Email: ltg@lgerm-ettinger.ro</p>
          <p>{t('contactUs.phone')}: 0261722185</p>
          <p>{t('contactUs.address')}: Bulevardul Cloșca, nr. 72, Satu Mare</p>
        </div>
      </div>

      <div className="mt-12 text-center text-sm">
        <p>© 2024 Liceul Teoretic German "Johann Ettinger". {t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;