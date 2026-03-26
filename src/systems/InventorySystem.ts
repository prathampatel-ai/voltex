// ── INVENTORY SYSTEM ─────────────────────────────────────────────────────────
// Simple item bag. Shared singleton, used by WorldScene + BattleScene.

export interface Item {
  id: string
  name: string
  description: string
  quantity: number
  combatUse?: {
    stat: 'hp' | 'sta' | 'wil'
    amount: number      // flat value
    percent: boolean    // if true, amount is a percentage of max
    endExhaustion?: boolean
  }
}

const ITEM_DEFS: Record<string, Omit<Item, 'quantity'>> = {
  spark_charge_s: {
    id: 'spark_charge_s', name: 'Spark Charge (S)', description: 'Restores 20% WIL in combat.',
    combatUse: { stat: 'wil', amount: 20, percent: true },
  },
  spark_charge_m: {
    id: 'spark_charge_m', name: 'Spark Charge (M)', description: 'Restores 40% WIL in combat.',
    combatUse: { stat: 'wil', amount: 40, percent: true },
  },
  stamina_pack_s: {
    id: 'stamina_pack_s', name: 'Stamina Pack (S)', description: 'Restores 25% STA in combat.',
    combatUse: { stat: 'sta', amount: 25, percent: true },
  },
  stabiliser: {
    id: 'stabiliser', name: 'Stabiliser', description: 'Ends Will Exhaustion immediately. Restores 10% WIL.',
    combatUse: { stat: 'wil', amount: 10, percent: true, endExhaustion: true },
  },
  recovery_tab: {
    id: 'recovery_tab', name: 'Recovery Tab', description: 'Restores 15% HP (1-turn delay).',
    combatUse: { stat: 'hp', amount: 15, percent: true },
  },
  antidote: {
    id: 'antidote', name: 'Antidote', description: 'Removes all Poison stacks.',
  },
  coolant: {
    id: 'coolant', name: 'Coolant', description: 'Removes all Burn stacks.',
  },
}

class InventorySystem {
  private bag: Map<string, Item> = new Map()

  add(itemId: string, qty = 1) {
    const def = ITEM_DEFS[itemId]
    if (!def) { console.warn(`[Inventory] Unknown item: ${itemId}`); return }
    const existing = this.bag.get(itemId)
    if (existing) {
      existing.quantity += qty
    } else {
      this.bag.set(itemId, { ...def, quantity: qty })
    }
    this.emit()
  }

  remove(itemId: string, qty = 1): boolean {
    const item = this.bag.get(itemId)
    if (!item || item.quantity < qty) return false
    item.quantity -= qty
    if (item.quantity <= 0) this.bag.delete(itemId)
    this.emit()
    return true
  }

  has(itemId: string): boolean {
    return (this.bag.get(itemId)?.quantity ?? 0) > 0
  }

  getAll(): Item[] {
    return [...this.bag.values()].filter(i => i.quantity > 0)
  }

  getCount(itemId: string): number {
    return this.bag.get(itemId)?.quantity ?? 0
  }

  // Simple event emitter for UI updates
  private listeners: (() => void)[] = []
  onChange(fn: () => void) { this.listeners.push(fn) }
  private emit() { this.listeners.forEach(fn => fn()) }
}

export const inventory = new InventorySystem()

// Starter items for testing — remove before ship
inventory.add('spark_charge_s', 2)
inventory.add('stamina_pack_s', 1)