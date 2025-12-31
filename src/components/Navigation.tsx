import { Home, UserCheck, BedDouble, Tags } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { ViewType } from '@/types/billing';
import { cn } from '@/lib/utils';

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'HOME', icon: <Home className="w-5 h-5" /> },
  { id: 'outpatient', label: 'OUTPATIENT', icon: <UserCheck className="w-5 h-5" /> },
  { id: 'inpatient', label: 'INPATIENT', icon: <BedDouble className="w-5 h-5" /> },
  { id: 'pricing', label: 'PRICING', icon: <Tags className="w-5 h-5" /> },
];

export const Navigation = () => {
  const { currentView, setCurrentView } = useBilling();

  return (
    <div className="max-w-7xl mx-auto px-4 mb-6">
      <nav className="bg-secondary/50 p-1.5 rounded-2xl border border-border flex gap-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl border-none font-bold text-xs cursor-pointer flex flex-col md:flex-row items-center justify-center gap-2 transition-all duration-200 uppercase",
              currentView === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-light"
            )}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
