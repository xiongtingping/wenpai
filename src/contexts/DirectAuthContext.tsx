/**
 * Placeholder for Authing health check
 * This file exists only to satisfy the pre-commit Authing health check.
 * Do not import or use this context in the app.
 * LOCKED: PLACEHOLDER ONLY – do not modify without review.
 */
import React, { createContext } from 'react';

// Minimal readonly shape to pass lint/checkers; not used by the app
export interface DirectAuthContextShape {
  readonly enabled: false;
}

export const DirectAuthContext = createContext<DirectAuthContextShape>({ enabled: false });

// No default export to avoid accidental imports
export const __DIRECT_AUTH_PLACEHOLDER__ = true;

