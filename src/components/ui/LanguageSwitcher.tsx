import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => 
    lang.code === i18n.language || 
    (lang.code === 'zh-CN' && i18n.language === 'zh') ||
    (lang.code === 'en-US' && i18n.language === 'en')
  ) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
        onClick={() => {
          setIsOpen(!isOpen);
          
          // 确保根元素可交互
          const root = document.getElementById('root');
          if (root && root.hasAttribute('aria-hidden')) {
            root.removeAttribute('aria-hidden');
          }
        }}
        type="button"
        aria-expanded={isOpen}
        data-testid="native-language-switcher-trigger"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div
          className="language-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              className={`w-full flex items-center px-3 py-2 text-sm hover:bg-accent text-left ${
                (i18n.language === language.code || 
                 (language.code === 'zh-CN' && i18n.language === 'zh') ||
                 (language.code === 'en-US' && i18n.language === 'en'))
                ? 'bg-accent' : ''
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}