import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const currentLanguage = i18n.language;
  const isChineseMode = currentLanguage === 'zh-CN' || currentLanguage === 'zh';
  const isEnglishMode = currentLanguage === 'en-US' || currentLanguage === 'en';
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    isChineseMode,
    isEnglishMode
  };
};