import { BillingProvider, useBilling } from '@/contexts/BillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { HomeView } from '@/components/views/HomeView';
import { OutpatientView } from '@/components/views/OutpatientView';
import { InpatientView } from '@/components/views/InpatientView';
import { PricingView } from '@/components/views/PricingView';
import { Loader2 } from 'lucide-react';

const MainContent = () => {
  const { currentView, isLoading } = useBilling();
  const { settings } = useAppSettings();

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
    <>
      {currentView === 'home' && <HomeView />}
      {currentView === 'outpatient' && isViewVisible('outpatient') && <OutpatientView />}
      {currentView === 'inpatient' && isViewVisible('inpatient') && <InpatientView />}
      {currentView === 'pricing' && isViewVisible('pricing') && <PricingView />}
    </>
  );
};

const Index = () => {
  return (
    <BillingProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 pb-8">
          <MainContent />
        </main>
      </div>
    </BillingProvider>
  );
};

export default Index;
