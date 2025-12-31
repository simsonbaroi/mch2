import { useNavigate } from 'react-router-dom';
import { Microscope, Settings, Sun, Moon, LogOut, User } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuthContext } from '@/contexts/AuthContext';

export const Header = () => {
  const time = useClock();
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppSettings();
  const { user, role, signOut } = useAuthContext();

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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <Microscope className="w-8 h-8 text-primary drop-shadow-lg" />
          )}
          <h1 className="text-xl font-bold">
            {settings.appName} <span className="font-light text-muted-foreground">{settings.appSubtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2">
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
      </div>
    </header>
  );
};
