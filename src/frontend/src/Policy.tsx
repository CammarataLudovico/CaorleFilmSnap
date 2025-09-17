import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Policy = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
      i18n.changeLanguage('it');
    }, []);
  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Language selector */}
      <div className="flex justify-end p-4">
        <div className="flex items-center gap-2 bg-base-200 rounded-xl px-4 py-5 shadow-sm">
          <span className="text-sm font-semibold text-base-content flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414m12.728 0l-1.414-1.414M6.343 6.343L4.929 4.929" />
            </svg>
          </span>
          <select
            className="select select-primary select-xs"
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
          >
            <option value="it">🇮🇹 Italiano</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Privacy & Policy Foto</h1>
      <p>
        {t('privacy.consent')}
      </p>
      <p className="mt-4"><a href="mailto:info@caorlefilmfestival.com" className="underline text-primary">info@caorlefilmfestival.com</a>.</p>
    </div>
  );
};

export default Policy;
