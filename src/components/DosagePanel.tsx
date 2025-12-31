import { useState, useEffect } from 'react';
import { X, PlusCircle, FlaskConical } from 'lucide-react';
import { InventoryItem } from '@/types/billing';
import { toast } from 'sonner';

interface DosagePanelProps {
  item: InventoryItem | null;
  category: string;
  onClose: () => void;
  onAddToBill: (item: InventoryItem, qty: number, subtotal: number) => void;
}

export const DosagePanel = ({ item, category, onClose, onAddToBill }: DosagePanelProps) => {
  const [doseQty, setDoseQty] = useState('1.0');
  const [doseType, setDoseType] = useState('Tablet');
  const [doseFreq, setDoseFreq] = useState('3');
  const [doseDays, setDoseDays] = useState('7');
  const [serviceQty, setServiceQty] = useState('1');

  const isMedicine = category === 'Medicine' || category === 'Discharge Medicine' ||
    ['Injection', 'Tablet', 'Capsule', 'Syrup'].includes(item?.type || '');

  useEffect(() => {
    if (item) {
      setDoseType(item.type || 'Tablet');
      setDoseQty('1.0');
      setDoseFreq('3');
      setDoseDays('7');
      setServiceQty('1');
    }
  }, [item]);

  if (!item) return null;

  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d.]/g, '') || '0');

  const calculateTotal = () => {
    if (isMedicine) {
      const qty = parseFloat(doseQty) || 0;
      const freq = parseFloat(doseFreq) || 0;
      const days = parseInt(doseDays) || 0;
      return qty * freq * days * price;
    }
    return (parseFloat(serviceQty) || 1) * price;
  };

  const totalQty = isMedicine
    ? (parseFloat(doseQty) || 0) * (parseFloat(doseFreq) || 0) * (parseInt(doseDays) || 0)
    : parseFloat(serviceQty) || 1;

  const handleAdd = () => {
    const subtotal = calculateTotal();
    onAddToBill({ ...item, category }, totalQty, subtotal);
    toast.success('Added to statement', {
      className: 'bg-card border-border text-foreground',
    });
    onClose();
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 mb-6 shadow-md animate-scale-in">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
        <h4 className="font-extrabold text-lg text-foreground flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          COMMIT: <span className="text-primary">{item.name}</span>
        </h4>
        <X
          className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={onClose}
        />
      </div>

      {isMedicine ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Dose Qty
            </label>
            <input
              type="text"
              value={doseQty}
              onChange={(e) => setDoseQty(e.target.value)}
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light focus:ring-2 focus:ring-primary/20"
              placeholder="1.0"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Route
            </label>
            <select
              value={doseType}
              onChange={(e) => setDoseType(e.target.value)}
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Injection">Injection</option>
              <option value="Syrup">Syrup</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Frequency
            </label>
            <select
              value={doseFreq}
              onChange={(e) => setDoseFreq(e.target.value)}
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
            >
              <option value="1">QD (1/day)</option>
              <option value="2">BID (2/day)</option>
              <option value="3">TID (3/day)</option>
              <option value="4">QID (4/day)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Days
            </label>
            <input
              type="number"
              value={doseDays}
              onChange={(e) => setDoseDays(e.target.value)}
              min="1"
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Units Required
            </label>
            <input
              type="number"
              value={serviceQty}
              onChange={(e) => setServiceQty(e.target.value)}
              min="1"
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="font-mono font-bold text-3xl text-primary">
          ৳ {calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-primary-foreground font-extrabold rounded-xl px-6 py-3 text-sm flex items-center gap-2 transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 uppercase tracking-wide"
        >
          <PlusCircle className="w-5 h-5" />
          ADD TO STATEMENT
        </button>
      </div>
    </div>
  );
};
