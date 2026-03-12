/**
 * InventorySystem.ts
 * Lógica pura de inventario (sin React)
 */

export interface InventoryItem {
  id: string;           // Identificador único
  name: string;         // Nombre visible
  description: string;  // Descripción
  quantity: number;     // Cantidad en inventario
  maxStack: number;     // Máximo por stack
  type: 'grenade' | 'consumable' | 'key' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface Inventory {
  items: InventoryItem[];
  capacity: number;     // Slots disponibles
  gold: number;         // Moneda (opcional)
}

/**
 * Crear inventario nuevo
 */
export function createInventory(capacity: number = 20): Inventory {
  return {
    items: [],
    capacity,
    gold: 0,
  };
}

/**
 * Agregar item al inventario
 * Retorna:
 * - success: boolean
 * - inventory: Inventory actualizado
 * - message: string (para UI feedback)
 */
export function addItem(
  inventory: Inventory,
  item: InventoryItem
): { success: boolean; inventory: Inventory; message: string } {
  // Buscar si el item ya existe (para stackear)
  const existingIndex = inventory.items.findIndex(i => i.id === item.id);

  if (existingIndex !== -1) {
    // Item existe, agregar a cantidad
    const existing = inventory.items[existingIndex];
    const canAdd = existing.quantity + item.quantity <= existing.maxStack;

    if (canAdd) {
      const updated = [...inventory.items];
      updated[existingIndex] = {
        ...existing,
        quantity: existing.quantity + item.quantity,
      };
      return {
        success: true,
        inventory: { ...inventory, items: updated },
        message: `${item.name} x${item.quantity} added`,
      };
    } else {
      // Stack lleno
      return {
        success: false,
        inventory,
        message: `${item.name} stack is full`,
      };
    }
  }

  // Item nuevo - verificar capacidad
  if (inventory.items.length >= inventory.capacity) {
    return {
      success: false,
      inventory,
      message: 'Inventory is full',
    };
  }

  // Agregar item nuevo
  return {
    success: true,
    inventory: {
      ...inventory,
      items: [...inventory.items, { ...item }],
    },
    message: `${item.name} added to inventory`,
  };
}

/**
 * Remover item del inventario
 */
export function removeItem(
  inventory: Inventory,
  itemId: string,
  quantity: number = 1
): { success: boolean; inventory: Inventory; message: string } {
  const index = inventory.items.findIndex(i => i.id === itemId);

  if (index === -1) {
    return {
      success: false,
      inventory,
      message: 'Item not found',
    };
  }

  const item = inventory.items[index];

  if (item.quantity < quantity) {
    return {
      success: false,
      inventory,
      message: `Not enough ${item.name}`,
    };
  }

  if (item.quantity === quantity) {
    // Remover completamente
    return {
      success: true,
      inventory: {
        ...inventory,
        items: inventory.items.filter((_, i) => i !== index),
      },
      message: `${item.name} removed`,
    };
  }

  // Solo decrementar
  const updated = [...inventory.items];
  updated[index] = { ...item, quantity: item.quantity - quantity };
  return {
    success: true,
    inventory: { ...inventory, items: updated },
    message: `${item.name} x${quantity} used`,
  };
}

/**
 * Obtener cantidad de item
 */
export function getItemCount(inventory: Inventory, itemId: string): number {
  const item = inventory.items.find(i => i.id === itemId);
  return item ? item.quantity : 0;
}

/**
 * Obtener item por ID
 */
export function getItem(inventory: Inventory, itemId: string): InventoryItem | null {
  return inventory.items.find(i => i.id === itemId) || null;
}

/**
 * Obtener items por tipo
 */
export function getItemsByType(
  inventory: Inventory,
  type: InventoryItem['type']
): InventoryItem[] {
  return inventory.items.filter(i => i.type === type);
}

/**
 * Usar item (remover del inventario)
 */
export function useItem(
  inventory: Inventory,
  itemId: string
): { success: boolean; inventory: Inventory } {
  const result = removeItem(inventory, itemId, 1);
  return { success: result.success, inventory: result.inventory };
}

/**
 * Calcular peso/espacio usado
 */
export function getInventoryUsage(inventory: Inventory): {
  used: number;
  capacity: number;
  percentage: number;
} {
  const used = inventory.items.length;
  const capacity = inventory.capacity;
  return {
    used,
    capacity,
    percentage: (used / capacity) * 100,
  };
}
