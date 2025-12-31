import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InventoryItem, BillItem, ViewType, INPATIENT_CATEGORIES } from '@/types/billing';

interface BillingContextType {
  inventory: Record<string, InventoryItem[]>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, InventoryItem[]>>>;
  bill: BillItem[];
  addToBill: (item: BillItem) => void;
  removeFromBill: (index: number) => void;
  clearBill: () => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  outpatientCategories: string[];
  inpatientCategories: string[];
  currentCatOPIdx: number;
  setCurrentCatOPIdx: (idx: number) => void;
  currentCatIPIdx: number;
  setCurrentCatIPIdx: (idx: number) => void;
  isLoading: boolean;
  nextItemId: number;
  setNextItemId: React.Dispatch<React.SetStateAction<number>>;
}

const BillingContext = createContext<BillingContextType | null>(null);

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Record<string, InventoryItem[]>>({});
  const [bill, setBill] = useState<BillItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentCatOPIdx, setCurrentCatOPIdx] = useState(0);
  const [currentCatIPIdx, setCurrentCatIPIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [nextItemId, setNextItemId] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/med.json');
        if (res.ok) {
          const data: InventoryItem[] = await res.json();
          const inv: Record<string, InventoryItem[]> = {};
          let maxId = 0;
          
          data.forEach((item) => {
            const cat = item.category || "General";
            if (!inv[cat]) inv[cat] = [];
            inv[cat].push(item);
            if (item.id > maxId) maxId = item.id;
          });
          
          // Ensure all inpatient categories exist
          INPATIENT_CATEGORIES.forEach(c => {
            if (!inv[c]) inv[c] = [];
          });
          
          setInventory(inv);
          setNextItemId(maxId + 1);
        }
      } catch (e) {
        console.warn("Failed to load initial data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const outpatientCategories = Object.keys(inventory).sort();
  const inpatientCategories = INPATIENT_CATEGORIES;

  const addToBill = useCallback((item: BillItem) => {
    setBill(prev => [...prev, item]);
  }, []);

  const removeFromBill = useCallback((index: number) => {
    setBill(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearBill = useCallback(() => {
    setBill([]);
  }, []);

  return (
    <BillingContext.Provider
      value={{
        inventory,
        setInventory,
        bill,
        addToBill,
        removeFromBill,
        clearBill,
        currentView,
        setCurrentView,
        outpatientCategories,
        inpatientCategories,
        currentCatOPIdx,
        setCurrentCatOPIdx,
        currentCatIPIdx,
        setCurrentCatIPIdx,
        isLoading,
        nextItemId,
        setNextItemId,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
