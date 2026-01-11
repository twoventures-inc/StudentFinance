import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';

interface FontContextType {
  fontFamily: string;
  setFontFamily: (font: string) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const [fontFamily, setFontFamily] = useState('Inter');

  useEffect(() => {
    if (profile?.fontFamily) {
      setFontFamily(profile.fontFamily);
    }
  }, [profile?.fontFamily]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', `"${fontFamily}", ui-sans-serif, system-ui, sans-serif`);
  }, [fontFamily]);

  return (
    <FontContext.Provider value={{ fontFamily, setFontFamily }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
