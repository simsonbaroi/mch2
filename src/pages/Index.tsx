import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocalBillingProvider, useLocalBilling } from '@/contexts/LocalBillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { HomeView } from '@/components/views/HomeView';
import { OutpatientView } from '@/components/views/OutpatientView';
import { InpatientView } from '@/components/views/InpatientView';
import { PricingView } from '@/components/views/PricingView';
import { PatientsView } from '@/components/views/PatientsView';
import { PullToRefreshIndicator } from '@/components/mobile/PullToRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const MainContent = () => {
  const { currentView, isLoading, refreshData } = useLocalBilling();
  const { settings } = useAppSettings();

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await refreshData?.();
    toast.success('Data refreshed');
  }, [refreshData]);

  const { pullDistance, isRefreshing, pullProgress, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Check if the view is visible in settings
  const isViewVisible = (viewId: string) => {
    const btn = settings.navButtons.find(b => b.id === viewId);
    return btn?.visible !== false;
  };

  return (
    <div {...handlers} className="relative scroll-touch">
      {/* Pull to refresh indicator - mobile only */}
      <div className="sm:hidden">
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          pullProgress={pullProgress}
        />
      </div>
      
      <div 
        className="transition-transform duration-100"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined }}
      >
        {currentView === 'home' && <HomeView />}
        {currentView === 'outpatient' && isViewVisible('outpatient') && <OutpatientView />}
        {currentView === 'inpatient' && isViewVisible('inpatient') && <InpatientView />}
        {currentView === 'pricing' && isViewVisible('pricing') && <PricingView />}
        {currentView === 'patients' && isViewVisible('patients') && <PatientsView />}
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useLocalAuthContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Check if this is a preview mode (embedded iframe in settings)
  const isPreviewMode = searchParams.get('preview') === 'true';

  // Redirect to auth if not authenticated (skip in preview mode)
  useEffect(() => {
    if (!isPreviewMode && !isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate, isPreviewMode]);

  // Prevent bounce scroll on iOS
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user && !isPreviewMode) {
    return null; // Will redirect to auth
  }

  return (
    <LocalBillingProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <>
            <div 
              className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="md:hidden fixed top-0 left-0 bottom-0 z-50 animate-slide-in-right">
              <AppSidebar />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-background border-b border-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold">MCH Billing</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <MainContent />
          </main>
        </div>
      </div>
    </LocalBillingProvider>
  );
};

export default Index;
