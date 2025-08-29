import React from 'react';
import { EnhancedAuthModal } from './EnhancedAuthModal';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

export const AuthModalWrapper: React.FC = () => {
  const {
    customAuthModalOpen,
    setCustomAuthModalOpen,
    customAuthModalTab
  } = useUnifiedAuth();

  return (
    <EnhancedAuthModal
      isOpen={customAuthModalOpen}
      onClose={() => setCustomAuthModalOpen(false)}
      defaultTab={customAuthModalTab}
    />
  );
};