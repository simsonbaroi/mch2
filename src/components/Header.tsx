import { useNavigate } from 'react-router-dom';
import { Microscope, Settings, Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { useState } from 'react';

export const Header = () => {
  const time = useClock();
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppSettings();
  const { user, role, signOut } = useLocalAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'billing_clerk':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" onClick={() => window.location.reload()}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          ) : (
            <Microscope className="w-7 h-7 sm:w-8 sm:h-8 text-primary drop-shadow-lg" />
          )}
          <h1 className="text-base sm:text-xl font-bold truncate">
            {settings.appName} <span className="hidden xs:inline font-light text-muted-foreground">{settings.appSubtitle}</span>
          </h1>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                {user.email}
              </span>
              {role && (
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                  {role.replace('_', ' ')}
                </span>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
            title={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <div className="text-primary font-mono font-bold text-lg">
            {time}
          </div>
        </div>

        {/* Mobile Controls - Just Settings Icon */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="md:hidden fixed top-[60px] left-0 right-0 bg-card border-b border-border p-4 animate-fade-in z-50 shadow-xl">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium truncate flex-1">
                  {user.email}
                </span>
                {role && (
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                    {role.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateSettings({ isDarkMode: !settings.isDarkMode });
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 bg-surface-light border border-border py-3 rounded-lg flex items-center justify-center gap-2 text-muted-foreground"
              >
                {settings.isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm font-medium">{settings.isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 bg-surface-light border border-border py-3 rounded-lg flex items-center justify-center gap-2 text-muted-foreground"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 bg-surface-light border border-border py-3 rounded-lg flex items-center justify-center gap-2 text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
