import { Microscope, Settings } from 'lucide-react';
import { useClock } from '@/hooks/useClock';

export const Header = () => {
  const time = useClock();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <Microscope className="w-8 h-8 text-primary drop-shadow-lg" />
          <h1 className="text-xl font-bold">
            MCH Billing <span className="font-light text-muted-foreground">System</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer">
            <Settings className="w-5 h-5" />
          </div>
          <div className="text-primary font-mono font-bold text-lg">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
};
