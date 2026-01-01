import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTouchGestures } from '@/hooks/useTouchGestures';

interface CategoryCarouselProps {
  categoryName: string;
  itemCount: number;
  onPrev: () => void;
  onNext: () => void;
  onGridView: () => void;
}

export const CategoryCarousel = ({
  categoryName,
  itemCount,
  onPrev,
  onNext,
  onGridView,
}: CategoryCarouselProps) => {
  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
    threshold: 50,
  });

  return (
    <div 
      className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-md transition-all duration-300 animate-scale-in"
      {...touchHandlers}
    >
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          className="w-11 h-11 rounded-xl border border-border bg-surface-light text-primary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center flex-1">
          <h4 className="font-black text-primary text-xl uppercase tracking-wider mb-1">
            {categoryName}
          </h4>
          <p className="text-muted-foreground font-bold text-xs">
            {itemCount} indexed items
          </p>
          <button
            onClick={onGridView}
            className="mt-3 bg-primary text-primary-foreground font-extrabold rounded-xl px-4 py-1.5 text-xs uppercase tracking-wide transition-all duration-200 hover:bg-primary/90"
          >
            GRID VIEW
          </button>
        </div>
        
        <button
          onClick={onNext}
          className="w-11 h-11 rounded-xl border border-border bg-surface-light text-primary cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
