// ── INVENTORY SCENE ─────────────────────────────────────────────────────────
// Overlay scene — press I to open/close from WorldScene.

import Phaser from 'phaser'
import { inventory } from '../systems/InventorySystem'

const W = 960
const H = 640
const PANEL_W = 420
const PANEL_H = 480
const PX = (W - PANEL_W) / 2
const PY = (H - PANEL_H) / 2

export class InventoryScene extends Phaser.Scene {
  private itemTexts: Phaser.GameObjects.Text[] = []
  private closeKey!: Phaser.Input.Keyboard.Key

  constructor() { super({ key: 'InventoryScene' }) }

  create() {
    // Dim background
    this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0)

    // Panel
    this.add.rectangle(PX, PY, PANEL_W, PANEL_H, 0x0d1220).setOrigin(0)
      .setStrokeStyle(1, 0x252d4a)
    this.add.rectangle(PX, PY, PANEL_W, 2, 0x5b8cff).setOrigin(0) // accent top

    // Header
    this.add.text(PX + 20, PY + 18, 'INVENTORY', {
      fontFamily: 'monospace', fontSize: '14px', color: '#5b8cff', letterSpacing: 4,
    })

    this.add.text(PX + PANEL_W - 20, PY + 18, '[ I ] CLOSE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#252d4a', letterSpacing: 2,
    }).setOrigin(1, 0)

    // Divider
    this.add.rectangle(PX + 20, PY + 44, PANEL_W - 40, 1, 0x252d4a).setOrigin(0)

    // Items
    this.renderItems()

    // Input
    this.closeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I)
    inventory.onChange(() => this.renderItems())
  }

  renderItems() {
    this.itemTexts.forEach(t => t.destroy())
    this.itemTexts = []

    const items = inventory.getAll()

    if (items.length === 0) {
      const t = this.add.text(PX + PANEL_W / 2, PY + PANEL_H / 2, 'No items.', {
        fontFamily: 'monospace', fontSize: '12px', color: '#252d4a',
      }).setOrigin(0.5)
      this.itemTexts.push(t)
      return
    }

    items.forEach((item, i) => {
      const rowY = PY + 62 + i * 54
      const row = this.add.rectangle(PX + 16, rowY, PANEL_W - 32, 44, 0x111525).setOrigin(0)
        .setStrokeStyle(1, 0x1a2040)
      this.itemTexts.push(row as any)

      const name = this.add.text(PX + 30, rowY + 8, item.name, {
        fontFamily: 'monospace', fontSize: '12px', color: '#d0d8f0',
      })
      this.itemTexts.push(name)

      const desc = this.add.text(PX + 30, rowY + 26, item.description, {
        fontFamily: 'monospace', fontSize: '9px', color: '#6b7a9e',
      })
      this.itemTexts.push(desc)

      const qty = this.add.text(PX + PANEL_W - 32, rowY + 16, `×${item.quantity}`, {
        fontFamily: 'monospace', fontSize: '13px', color: '#ffc14a',
      }).setOrigin(1, 0.5)
      this.itemTexts.push(qty)
    })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.closeKey)) {
      this.scene.stop('InventoryScene')
      if (this.scene.isPaused('WorldScene')) this.scene.resume('WorldScene')
    }
  }
}