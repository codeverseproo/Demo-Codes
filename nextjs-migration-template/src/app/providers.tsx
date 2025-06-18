'use client';

import { createContext, useContext, ReactNode } from 'react';

// Example context for theme management
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Providers component that wraps all client-side providers
export function Providers({ children }: { children: ReactNode }) {
  // Add your context providers here
  // Example: Theme provider, Auth provider, etc.
  
  return (
    <>
      {/* Add your providers here */}
      {children}
    </>
  );
}

