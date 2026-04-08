/**
 * RTL (Right-to-Left) support utilities for Arabic, Hebrew, Persian, Urdu
 */

export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

/**
 * Check if a language is RTL
 */
export const isRTL = (language: string): boolean => {
  return rtlLanguages.includes(language);
};

/**
 * Apply RTL styles to document
 */
export const applyRTL = (language: string): void => {
  const isRTL = rtlLanguages.includes(language);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // Add RTL-specific CSS class if needed
  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
};

/**
 * Get text direction based on language
 */
export const getTextDirection = (language: string): 'rtl' | 'ltr' => {
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

/**
 * Flip margin/padding values for RTL
 * Converts left values to right and vice versa
 */
export const flipSpacing = (value: string): string => {
  if (!value) return value;
  
  // Flip margin-left to margin-right and vice versa
  return value
    .replace(/margin-left/g, 'margin-TEMP')
    .replace(/margin-right/g, 'margin-left')
    .replace(/margin-TEMP/g, 'margin-right')
    .replace(/padding-left/g, 'padding-TEMP')
    .replace(/padding-right/g, 'padding-left')
    .replace(/padding-TEMP/g, 'padding-right');
};

/**
 * Flip icon for RTL (e.g., arrows should point opposite direction)
 */
export const shouldFlipIcon = (language: string): boolean => {
  return rtlLanguages.includes(language);
};

/**
 * Get RTL-aware flex direction
 */
export const getFlexDirection = (language: string, defaultDirection: 'row' | 'row-reverse' = 'row'): 'row' | 'row-reverse' => {
  if (rtlLanguages.includes(language)) {
    return defaultDirection === 'row' ? 'row-reverse' : 'row';
  }
  return defaultDirection;
};

/**
 * Get RTL-aware text alignment
 */
export const getTextAlign = (language: string, defaultAlign: 'left' | 'right' | 'center' = 'left'): 'left' | 'right' | 'center' => {
  if (rtlLanguages.includes(language)) {
    if (defaultAlign === 'left') return 'right';
    if (defaultAlign === 'right') return 'left';
  }
  return defaultAlign;
};

/**
 * RTL CSS utility class generator
 */
export const getRTLClass = (language: string, baseClass: string): string => {
  if (rtlLanguages.includes(language)) {
    return `${baseClass} rtl`;
  }
  return baseClass;
};

/**
 * RTL-aware spacing utility
 * Use this for conditional classes based on RTL
 */
export const rtlSpacing = {
  ml: (language: string) => rtlLanguages.includes(language) ? 'mr' : 'ml',
  mr: (language: string) => rtlLanguages.includes(language) ? 'ml' : 'mr',
  pl: (language: string) => rtlLanguages.includes(language) ? 'pr' : 'pl',
  pr: (language: string) => rtlLanguages.includes(language) ? 'pl' : 'pr',
  'ml-auto': (language: string) => rtlLanguages.includes(language) ? 'mr-auto' : 'ml-auto',
  'mr-auto': (language: string) => rtlLanguages.includes(language) ? 'ml-auto' : 'mr-auto',
};
