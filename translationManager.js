import AsyncStorage from "@react-native-async-storage/async-storage";
import translations from "./translations";

const LANGUAGE_KEY = 'language';
const translationManager = {
  currentLanguage: 'en', // default language

  init: async () => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage) {
      translationManager.currentLanguage = storedLanguage;
    }
  },

  getTranslation(key) {
    return translations[this.currentLanguage][key];
  },

  changeLanguage: async (lang) => {
    translationManager.currentLanguage = lang;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  },
};

// Initialize translation manager
translationManager.init();

export default translationManager;

// const translationManager = {

//   currentLanguage: 'en', // default language

//   getTranslation(key) {
//     return translations[this.currentLanguage][key];
//   },

//   changeLanguage(lang) {
//     this.currentLanguage = lang;
//   },
// };

// export default translationManager;