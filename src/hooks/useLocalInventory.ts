import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '@/types/billing';
import { toast } from 'sonner';

const STORAGE_KEY = 'mch_inventory';

export const useLocalInventory = () => {
  const [inventory, setInventory] = useState<Record<string, InventoryItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load inventory from localStorage
  const fetchInventory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: InventoryItem[] = JSON.parse(stored);
        const inv: Record<string, InventoryItem[]> = {};
        items.forEach((item) => {
          const cat = item.category || 'General';
          if (!inv[cat]) inv[cat] = [];
          inv[cat].push(item);
        });
        setInventory(inv);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save inventory to localStorage
  const saveToStorage = useCallback((inv: Record<string, InventoryItem[]>) => {
    const allItems: InventoryItem[] = [];
    Object.entries(inv).forEach(([cat, items]) => {
      items.forEach(item => allItems.push({ ...item, category: cat }));
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems));
  }, []);

  // Generate unique ID
  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  // Add item
  const addItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    setIsSyncing(true);
    try {
      const newId = generateId();
      const cat = item.category || 'General';
      
      setInventory(prev => {
        const newInv = { ...prev };
        if (!newInv[cat]) newInv[cat] = [];
        newInv[cat].push({
          id: newId,
          name: item.name,
          strength: item.strength,
          price: item.price,
          type: item.type,
          category: cat,
        });
        saveToStorage(newInv);
        return newInv;
      });

      toast.success('Record added');
      return newId;
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [saveToStorage]);

  // Update item
  const updateItem = useCallback((id: number, updates: Partial<InventoryItem>, oldCategory?: string) => {
    setIsSyncing(true);
    try {
      setInventory(prev => {
        const newInv = { ...prev };
        const newCat = updates.category || 'General';

        // Remove from old category if changed
        if (oldCategory && oldCategory !== newCat && newInv[oldCategory]) {
          newInv[oldCategory] = newInv[oldCategory].filter(i => i.id !== id);
          if (newInv[oldCategory].length === 0) {
            delete newInv[oldCategory];
          }
        }

        // Add/update in new category
        if (!newInv[newCat]) newInv[newCat] = [];
        const existingIndex = newInv[newCat].findIndex(i => i.id === id);
        const updatedItem: InventoryItem = {
          id,
          name: updates.name || '',
          strength: updates.strength,
          price: updates.price || 0,
          type: updates.type,
          category: newCat,
        };

        if (existingIndex > -1) {
          newInv[newCat][existingIndex] = updatedItem;
        } else {
          newInv[newCat].push(updatedItem);
        }

        saveToStorage(newInv);
        return newInv;
      });

      toast.success('Record updated');
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [saveToStorage]);

  // Delete item
  const deleteItem = useCallback((id: number, category: string) => {
    setIsSyncing(true);
    try {
      setInventory(prev => {
        const newInv = { ...prev };
        if (newInv[category]) {
          newInv[category] = newInv[category].filter(i => i.id !== id);
          if (newInv[category].length === 0) {
            delete newInv[category];
          }
        }
        saveToStorage(newInv);
        return newInv;
      });

      toast.success('Record deleted');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [saveToStorage]);

  // Bulk import
  const bulkImport = useCallback((items: InventoryItem[]) => {
    setIsSyncing(true);
    try {
      const inv: Record<string, InventoryItem[]> = {};
      items.forEach((item, index) => {
        const cat = item.category || 'General';
        if (!inv[cat]) inv[cat] = [];
        inv[cat].push({
          ...item,
          id: item.id || generateId() + index,
          category: cat,
        });
      });
      
      setInventory(inv);
      saveToStorage(inv);
      toast.success('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast.error('Failed to import database');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [saveToStorage]);

  // Export data
  const exportData = useCallback(() => {
    const allItems: InventoryItem[] = [];
    Object.entries(inventory).forEach(([cat, items]) => {
      items.forEach(item => allItems.push({ ...item, category: cat }));
    });
    return allItems;
  }, [inventory]);

  // Seed from JSON
  const seedFromJson = useCallback(async () => {
    try {
      const res = await fetch('/med.json');
      if (res.ok) {
        const data: InventoryItem[] = await res.json();
        bulkImport(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error seeding from JSON:', error);
      return false;
    }
  }, [bulkImport]);

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    isLoading,
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    exportData,
    seedFromJson,
    refetch: fetchInventory,
  };
};
