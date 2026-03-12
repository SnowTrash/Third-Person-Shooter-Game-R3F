import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Inventory,
  InventoryItem,
  createInventory,
  addItem as addItemToInventory,
  removeItem as removeItemFromInventory,
  getItemCount,
  getInventoryUsage,
} from '../systems/InventorySystem';

interface InventoryContextType {
  inventory: Inventory;
  addItem: (item: InventoryItem) => { success: boolean; message: string };
  removeItem: (itemId: string, quantity?: number) => { success: boolean; message: string };
  useItem: (itemId: string) => boolean;
  getItemCount: (itemId: string) => number;
  getItemsByType: (type: InventoryItem['type']) => InventoryItem[];
  getUsage: () => { used: number; capacity: number; percentage: number };
  clearInventory: () => void;
  setGold: (amount: number) => void;
  addGold: (amount: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Inventory>(() => createInventory(30));

  const addItem = useCallback(
    (item: InventoryItem): { success: boolean; message: string } => {
      const result = addItemToInventory(inventory, item);
      setInventory(result.inventory);
      return { success: result.success, message: result.message };
    },
    [inventory]
  );

  const removeItem = useCallback(
    (itemId: string, quantity: number = 1): { success: boolean; message: string } => {
      const result = removeItemFromInventory(inventory, itemId, quantity);
      setInventory(result.inventory);
      return { success: result.success, message: result.message };
    },
    [inventory]
  );

  const useItem = useCallback(
    (itemId: string): boolean => {
      const result = removeItem(itemId, 1);
      return result.success;
    },
    [removeItem]
  );

  const getItemCountFn = useCallback(
    (itemId: string): number => getItemCount(inventory, itemId),
    [inventory]
  );

  const getItemsByType = useCallback(
    (type: InventoryItem['type']): InventoryItem[] => {
      return inventory.items.filter(i => i.type === type);
    },
    [inventory]
  );

  const getUsage = useCallback(
    () => getInventoryUsage(inventory),
    [inventory]
  );

  const clearInventory = useCallback(() => {
    setInventory(createInventory(30));
  }, []);

  const setGold = useCallback((amount: number) => {
    setInventory(prev => ({ ...prev, gold: Math.max(0, amount) }));
  }, []);

  const addGold = useCallback((amount: number) => {
    setInventory(prev => ({ ...prev, gold: prev.gold + amount }));
  }, []);

  const value: InventoryContextType = {
    inventory,
    addItem,
    removeItem,
    useItem,
    getItemCount: getItemCountFn,
    getItemsByType,
    getUsage,
    clearInventory,
    setGold,
    addGold,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};
