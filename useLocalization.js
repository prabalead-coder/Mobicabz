import { useEffect, useState } from 'react';
import * as RNLocalize from 'react-native-localize';

const translations = {
  eng: require('./languages/eng.json'),
  hin: require('./languages/hin.json'),
  // Add more languages as needed
};

const useLocalization = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('eng'); // Default language

  useEffect(() => {
    const detectLanguage = () => {
      const locales = RNLocalize.getLocales();
      if (locales.length > 0) {
        const preferredLocale = locales[0].languageCode;
        if (translations[preferredLocale]) {
          setSelectedLanguage(preferredLocale);
        }
      }
    };

    detectLanguage();

    const changeListener = () => {
      detectLanguage();
    };

    RNLocalize.addEventListener('change', changeListener);

    return () => {
      RNLocalize.removeEventListener('change', changeListener);
    };
  }, []); // Empty dependency array to ensure effect runs only once

  const translate = (key) => {
    return translations[selectedLanguage][key] || key;
  };

  return translate;
};

export default useLocalization;
