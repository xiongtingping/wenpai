import React from 'react';
import { ExtensionPromoBanner, ExtensionGuideSection } from '@/components/landing/ExtensionPromoBanner';

const BrowserExtensionPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-16">
      <div className="ds-container py-8 md:py-12">
        <ExtensionPromoBanner />
      </div>
      <ExtensionGuideSection />
    </div>
  );
};

export default BrowserExtensionPage;

