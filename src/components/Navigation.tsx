import { Home, UserCheck, BedDouble, Tags } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { ViewType } from '@/types/billing';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useClock } from '@/hooks/useClock';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  BedDouble: <BedDouble className="w-5 h-5" />,
  Tags: <Tags className="w-5 h-5" />,
};

export const Navigation = () => {
  const { currentView, setCurrentView } = useBilling();
  const { settings } = useAppSettings();
  const time = useClock();

  const visibleButtons = settings.navButtons.filter(btn => btn.visible);
  
  // Get current view index
  const currentIndex = visibleButtons.findIndex(btn => btn.id === currentView);
  
  // Touch gesture navigation
  const navigateToNext = () => {
    if (currentIndex < visibleButtons.length - 1) {
      setCurrentView(visibleButtons[currentIndex + 1].id as ViewType);
    }
  };

  const navigateToPrev = () => {
    if (currentIndex > 0) {
      setCurrentView(visibleButtons[currentIndex - 1].id as ViewType);
    }
  };

  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: navigateToNext,
    onSwipeRight: navigateToPrev,
    threshold: 50,
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 mb-4 sm:mb-6" {...touchHandlers}>
      {/* Desktop Navigation */}
      <nav className="hidden sm:flex bg-secondary/50 p-1.5 rounded-2xl border border-border gap-1.5">
        {visibleButtons.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as ViewType)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl border-none font-bold text-xs cursor-pointer flex flex-col md:flex-row items-center justify-center gap-2 transition-all duration-200 uppercase",
              currentView === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-light"
            )}
          >
            {iconMap[item.icon] || <Home className="w-5 h-5" />}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Navigation - Horizontal Tabs like design */}
      <nav className="sm:hidden flex bg-secondary/50 p-1 rounded-xl border border-border gap-0.5" {...touchHandlers}>
        {visibleButtons.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as ViewType)}
            className={cn(
              "flex-1 py-2.5 px-2 rounded-lg border-none font-bold text-[10px] cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 uppercase",
              currentView === item.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-transparent text-muted-foreground active:bg-surface-light"
            )}
          >
            {iconMap[item.icon] || <Home className="w-4 h-4" />}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Mobile Clock - Below Navigation */}
      <div className="sm:hidden flex justify-end mt-2 px-1">
        <span className="text-primary font-mono font-bold text-sm">
          {time}
        </span>
      </div>
    </div>
  );
};
