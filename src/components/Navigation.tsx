import { Home, UserCheck, BedDouble, Tags, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { ViewType } from '@/types/billing';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/useTouchGestures';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  BedDouble: <BedDouble className="w-5 h-5" />,
  Tags: <Tags className="w-5 h-5" />,
};

export const Navigation = () => {
  const { currentView, setCurrentView } = useBilling();
  const { settings } = useAppSettings();

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

      {/* Mobile Navigation - Swipeable */}
      <div className="sm:hidden">
        <div className="bg-secondary/50 p-1 rounded-xl border border-border flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={navigateToPrev}
            disabled={currentIndex <= 0}
            className="p-2 rounded-lg text-muted-foreground disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Current View Indicator */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase">
            {iconMap[visibleButtons[currentIndex]?.icon] || <Home className="w-5 h-5" />}
            <span>{visibleButtons[currentIndex]?.label || 'Home'}</span>
          </div>
          
          {/* Next Button */}
          <button
            onClick={navigateToNext}
            disabled={currentIndex >= visibleButtons.length - 1}
            className="p-2 rounded-lg text-muted-foreground disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Page Indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {visibleButtons.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentIndex === idx
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        
        {/* Swipe Hint */}
        <p className="text-center text-xs text-muted-foreground mt-1 opacity-60">
          Swipe left/right to navigate
        </p>
      </div>
    </div>
  );
};
