import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { secureStorage, resetSessionTimeout } from '@/lib/crypto';

export interface NavButtonConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

export interface AppSettings {
  appName: string;
  appSubtitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  isDarkMode: boolean;
  navButtons: NavButtonConfig[];
}

const defaultSettings: AppSettings = {
  appName: 'MCH Billing',
  appSubtitle: 'System',
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '160 84% 39%',
  accentColor: '199 89% 48%',
  backgroundColor: '240 10% 4%',
  cardColor: '240 6% 7%',
  borderColor: '240 4% 16%',
  isDarkMode: true,
  navButtons: [
    { id: 'home', label: 'HOME', icon: 'Home', visible: true },
    { id: 'outpatient', label: 'OUTPATIENT', icon: 'UserCheck', visible: true },
    { id: 'inpatient', label: 'INPATIENT', icon: 'BedDouble', visible: true },
    { id: 'pricing', label: 'PRICING', icon: 'Tags', visible: true },
  ],
};

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNavButton: (id: string, updates: Partial<NavButtonConfig>) => void;
  resetSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load encrypted settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await secureStorage.getItem('appSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch {
        // Use defaults if loading fails
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Save encrypted settings when changed
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveSettings = async () => {
      try {
        await secureStorage.setItem('appSettings', JSON.stringify(settings));
        // Reset session timeout on activity
        resetSessionTimeout();
      } catch {
        // Silent fail - settings will be lost on refresh
      }
    };
    saveSettings();
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--accent', settings.primaryColor);
    root.style.setProperty('--accent-blue', settings.accentColor);
    root.style.setProperty('--background', settings.backgroundColor);
    root.style.setProperty('--card', settings.cardColor);
    root.style.setProperty('--surface', settings.cardColor);
    root.style.setProperty('--border', settings.borderColor);
    
    // Update favicon if set
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Apply dark/light mode
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateNavButton = (id: string, updates: Partial<NavButtonConfig>) => {
    setSettings(prev => ({
      ...prev,
      navButtons: prev.navButtons.map(btn => 
        btn.id === id ? { ...btn, ...updates } : btn
      ),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, updateNavButton, resetSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
