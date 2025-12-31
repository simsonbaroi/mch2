import { ShieldCheck, UserCheck, BedDouble } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export const HomeView = () => {
  const { setCurrentView } = useBilling();
  const { settings } = useAppSettings();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="mb-8 inline-block p-8 rounded-3xl bg-primary/10 border-2 border-dashed border-primary shadow-primary-glow">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
        ) : (
          <ShieldCheck className="w-20 h-20 text-primary" />
        )}
      </div>
      
      <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
        {settings.appName} <span className="text-primary">{settings.appSubtitle}.</span>
      </h2>
      
      <p className="text-lg text-muted-foreground max-w-md text-center font-semibold mb-10">
        Authorized Revenue Management Terminal.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setCurrentView('outpatient')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl px-8 py-4 text-sm uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-3"
        >
          <UserCheck className="w-5 h-5" />
          {settings.navButtons.find(b => b.id === 'outpatient')?.label || 'OUTPATIENT'}
        </button>
        
        <button
          onClick={() => setCurrentView('inpatient')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl px-8 py-4 text-sm uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-3"
        >
          <BedDouble className="w-5 h-5" />
          {settings.navButtons.find(b => b.id === 'inpatient')?.label || 'INPATIENT'}
        </button>
      </div>
    </div>
  );
};
