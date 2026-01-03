import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, UserCheck, BedDouble, Tags, Users, Settings, Sun, Moon, LogOut, ChevronLeft, ChevronRight, Microscope } from 'lucide-react';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { ViewType } from '@/types/billing';
import { cn } from '@/lib/utils';
import { useClock } from '@/hooks/useClock';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  UserCheck,
  BedDouble,
  Tags,
  Users,
};

export const AppSidebar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentView, setCurrentView } = useLocalBilling();
  const { settings, updateSettings } = useAppSettings();
  const { signOut } = useLocalAuthContext();
  const time = useClock();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isPreviewMode = searchParams.get('preview') === 'true';
  const visibleButtons = settings.navButtons.filter(btn => btn.visible);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavClick = (viewId: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setCurrentView(viewId as ViewType);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
        ) : (
          <Microscope className="w-8 h-8 text-primary flex-shrink-0" />
        )}
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold truncate">{settings.appName}</h1>
            <p className="text-xs text-muted-foreground truncate">{settings.appSubtitle}</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleButtons.map((item) => {
          const IconComponent = iconMap[item.icon] || Home;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-2 border-t border-border space-y-1">
        {/* Clock */}
        <div className={cn(
          "text-primary font-mono font-bold text-center py-2",
          isCollapsed ? "text-xs" : "text-sm"
        )}>
          {time}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
          title={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          {settings.isDarkMode ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 text-indigo-500" />
          )}
          {!isCollapsed && <span className="text-sm font-medium">{settings.isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Settings */}
        {!isPreviewMode && (
          <button
            onClick={() => navigate('/settings')}
            title="Settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
