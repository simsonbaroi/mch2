import { BillingProvider, useBilling } from '@/contexts/BillingContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { HomeView } from '@/components/views/HomeView';
import { OutpatientView } from '@/components/views/OutpatientView';
import { InpatientView } from '@/components/views/InpatientView';
import { PricingView } from '@/components/views/PricingView';
import { Loader2 } from 'lucide-react';

const MainContent = () => {
  const { currentView, isLoading } = useBilling();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {currentView === 'home' && <HomeView />}
      {currentView === 'outpatient' && <OutpatientView />}
      {currentView === 'inpatient' && <InpatientView />}
      {currentView === 'pricing' && <PricingView />}
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
