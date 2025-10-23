import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const createLanguages = (t: (key: string) => string) => [
  { code: 'zh-CN', name: t('language.chinese'), flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const languages = createLanguages(t);
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
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground h-9 px-3"
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
          className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-[999999]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题 */}
          <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
            {t('settings.language')}
          </div>

          {/* 语言选项 */}
          {languages.map((language) => {
            const isCurrentLanguage = (i18n.language === language.code ||
             (language.code === 'zh-CN' && i18n.language === 'zh') ||
             (language.code === 'en-US' && i18n.language === 'en'));

            return (
              <button
                key={language.code}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/40 ${
                  isCurrentLanguage ? 'bg-muted/30' : ''
                }`}
                onClick={() => changeLanguage(language.code)}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm">{language.name}</span>
                </div>
                {isCurrentLanguage && (
                  <span className="ml-auto text-xs text-foreground">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}