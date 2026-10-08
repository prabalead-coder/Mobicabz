import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationManager from './translationManager';

// Create the context
export const TranslationContext = createContext();

// Create the provider component
export const TranslationProvider = ({children}) => {
  const [language, setLanguage] = useState('en'); // Default language

  useEffect(() => {
    // Load the saved language when the app starts
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem('language');
      if (storedLang) {
        translationManager.changeLanguage(storedLang);
        setLanguage(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const changeAppLanguage = async newLang => {
    translationManager.changeLanguage(newLang);
    await AsyncStorage.setItem('language', newLang);
    setLanguage(newLang); // This will trigger a re-render
  };

  return (
    <TranslationContext.Provider value={{language, changeAppLanguage}}>
      {children}
    </TranslationContext.Provider>
  );
};