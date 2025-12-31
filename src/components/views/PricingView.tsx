import { useState } from 'react';
import { Search, Plus, Download, Upload, Database } from 'lucide-react';
import { useBilling } from '@/contexts/BillingContext';
import { InventoryItem } from '@/types/billing';
import { ItemEntry } from '@/components/ItemEntry';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const PricingView = () => {
  const { inventory, setInventory, outpatientCategories, inpatientCategories, nextItemId, setNextItemId } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formType, setFormType] = useState('Medicine');

  const allCategories = [...new Set([...outpatientCategories, ...inpatientCategories])].sort();

  // Flatten inventory for display
  const allItems: InventoryItem[] = [];
  Object.entries(inventory).forEach(([cat, items]) => {
    items.forEach((item) => {
      if (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        allItems.push({ ...item, category: cat });
      }
    });
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(allCategories[0] || 'Medicine');
    setFormPrice('');
    setFormType('Medicine');
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || 'Medicine');
    setFormPrice(String(item.price).replace(/[^\d.]/g, ''));
    setFormType(item.type || 'Medicine');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || isNaN(parseFloat(formPrice)) || parseFloat(formPrice) < 0) {
      toast.error('Please provide a valid name and price');
      return;
    }

    const newInventory = { ...inventory };

    if (editingItem) {
      // Editing existing item
      const oldCat = editingItem.category || '';

      // Remove from old category if category changed
      if (oldCat && oldCat !== formCategory && newInventory[oldCat]) {
        newInventory[oldCat] = newInventory[oldCat].filter((i) => i.id !== editingItem.id);
        if (newInventory[oldCat].length === 0) {
          delete newInventory[oldCat];
        }
      }

      // Add/update in new category
      if (!newInventory[formCategory]) {
        newInventory[formCategory] = [];
      }

      const existingIndex = newInventory[formCategory].findIndex((i) => i.id === editingItem.id);
      const updatedItem: InventoryItem = {
        ...editingItem,
        name: formName,
        category: formCategory,
        price: parseFloat(formPrice),
        type: formType,
      };

      if (existingIndex > -1) {
        newInventory[formCategory][existingIndex] = updatedItem;
      } else {
        newInventory[formCategory].push(updatedItem);
      }

      toast.success('Record updated');
    } else {
      // Adding new item
      if (!newInventory[formCategory]) {
        newInventory[formCategory] = [];
      }

      const newItem: InventoryItem = {
        id: nextItemId,
        name: formName,
        price: parseFloat(formPrice),
        type: formType,
        category: formCategory,
      };

      newInventory[formCategory].push(newItem);
      setNextItemId(nextItemId + 1);
      toast.success('Record added');
    }

    setInventory(newInventory);
    setIsModalOpen(false);
  };

  const handleDelete = (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}" from ${item.category || 'N/A'}?`)) return;

    const newInventory = { ...inventory };
    const cat = item.category || '';

    if (cat && newInventory[cat]) {
      newInventory[cat] = newInventory[cat].filter((i) => i.id !== item.id);
      if (newInventory[cat].length === 0) {
        delete newInventory[cat];
      }
    }

    setInventory(newInventory);
    toast.success('Record deleted');
  };

  const handleExport = () => {
    const data = JSON.stringify(allItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mch_db_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Database exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data: InventoryItem[] = JSON.parse(event.target?.result as string);

        if (!Array.isArray(data)) {
          throw new Error('Invalid format');
        }

        if (!confirm('This will REPLACE your current database. Continue?')) return;

        const newInventory: Record<string, InventoryItem[]> = {};
        let maxId = 0;

        data.forEach((item) => {
          const cat = item.category || 'General';
          if (!newInventory[cat]) newInventory[cat] = [];
          if (item.id > maxId) maxId = item.id;
          newInventory[cat].push(item);
        });

        setInventory(newInventory);
        setNextItemId(maxId + 1);
        toast.success('Database imported');
      } catch {
        toast.error('Failed to import: Invalid JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Database className="w-10 h-10 text-accent-blue" />
          <div>
            <h2 className="text-3xl font-extrabold text-foreground">Price List</h2>
            <span className="text-xl font-normal text-muted-foreground">Database Management</span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 flex flex-col items-center gap-2 font-extrabold text-xs uppercase transition-all hover:scale-[0.98] shadow-md"
          >
            <Plus className="w-6 h-6" />
            ADD NEW
          </button>
          <button
            onClick={handleExport}
            className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 flex flex-col items-center gap-2 font-extrabold text-xs uppercase transition-all hover:scale-[0.98] shadow-md"
          >
            <Download className="w-6 h-6" />
            EXPORT
          </button>
          <label className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 flex flex-col items-center gap-2 font-extrabold text-xs uppercase cursor-pointer transition-all hover:scale-[0.98] shadow-md">
            <Upload className="w-6 h-6" />
            IMPORT
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-input border border-border rounded-2xl px-5 py-4 flex items-center gap-4 mb-8 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card">
        <Search className="w-5 h-5 text-primary opacity-80" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search price list..."
          className="bg-transparent border-none text-foreground w-full outline-none text-lg font-semibold placeholder:text-muted-foreground placeholder:font-medium"
        />
      </div>

      <div className="flex flex-col gap-3">
        {allItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground opacity-60 font-semibold">
            No records found
          </div>
        ) : (
          allItems.map((item) => (
            <ItemEntry
              key={`${item.category}-${item.id}`}
              item={item}
              category={item.category || ''}
              onClick={() => {}}
              showActions
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-extrabold uppercase tracking-wide">
              {editingItem ? 'EDIT DATABASE RECORD' : 'ADD NEW DATABASE RECORD'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Price (৳)
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                min="0"
                step="0.01"
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
              >
                <option value="Medicine">Medicine</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Injection">Injection</option>
                <option value="Syrup">Syrup</option>
                <option value="Test">Test</option>
                <option value="Procedure">Procedure</option>
                <option value="Fee">Fee</option>
                <option value="Fluid">Fluid</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground font-extrabold rounded-xl py-4 text-sm transition-all duration-200 hover:bg-primary/90 uppercase tracking-wide mt-2"
            >
              {editingItem ? 'UPDATE RECORD' : 'ADD RECORD'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
