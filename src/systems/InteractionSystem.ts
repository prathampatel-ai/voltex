// ── INTERACTION SYSTEM ───────────────────────────────────────────────────────
// Manages NPCs, chests, signs, story triggers. WorldScene registers objects here.

import Phaser from 'phaser'
import { dialogueSystem } from './DialogueSystem'
import { inventory } from './InventorySystem'

export type InteractableType = 'npc' | 'chest' | 'sign' | 'trigger' | 'door'

export interface Interactable {
  type: InteractableType
  sprite: Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle
  bounds: Phaser.Geom.Rectangle   // world-space bounds for overlap check
  dialogueKey?: string
  itemId?: string                  // for chest: item to give
  triggered?: boolean              // one-shot triggers won't re-fire
  onInteract?: () => void
  // Door-specific
  targetMap?: string
  spawnX?: number
  spawnY?: number
}

export class InteractionSystem {
  private objects: Interactable[] = []
  private promptSprite!: Phaser.GameObjects.Text
  private scene: Phaser.Scene
  private currentTarget: Interactable | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Floating interaction prompt
    this.promptSprite = scene.add.text(0, 0, '[Z] INTERACT', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#5b8cff',
      backgroundColor: '#0a0c14',
      padding: { x: 6, y: 3 },
    }).setDepth(10).setVisible(false)

    scene.tweens.add({
      targets: this.promptSprite,
      y: '-=4',
      duration: 700,
      yoyo: true,
      repeat: -1,
    })
  }

  register(obj: Interactable) {
    this.objects.push(obj)
  }

  // Call from WorldScene.update() passing player world position
  update(playerX: number, playerY: number, interactPressed: boolean) {
    const range = 40 // pixels

    // Find nearest interactable in range (excluding already-triggered one-shots)
    let nearest: Interactable | null = null
    let nearestDist = Infinity

    for (const obj of this.objects) {
      if (obj.triggered) continue
      const cx = obj.bounds.centerX
      const cy = obj.bounds.centerY
      const dist = Math.hypot(playerX - cx, playerY - cy)
      if (dist < range && dist < nearestDist) {
        nearest = obj
        nearestDist = dist
      }
    }

    this.currentTarget = nearest

    if (nearest) {
      const cam = this.scene.cameras.main
      const sx = nearest.bounds.centerX - cam.scrollX
      const sy = nearest.bounds.top - cam.scrollY - 20
      this.promptSprite.setPosition(sx - this.promptSprite.width / 2, sy).setVisible(true)
    } else {
      this.promptSprite.setVisible(false)
    }

    if (interactPressed && nearest) {
      this.fire(nearest)
    }
  }

  private fire(obj: Interactable) {
    if (dialogueSystem.isActive) return

    if (obj.type === 'trigger') {
      obj.triggered = true
    }

    if (obj.itemId) {
      inventory.add(obj.itemId)
      obj.triggered = true
      // Remove visual
      obj.sprite.setVisible(false)
    }

    if (obj.dialogueKey) {
      // Pause world, launch dialogue overlay
      this.scene.scene.pause('WorldScene')
      if (!this.scene.scene.isActive('DialogueScene')) {
        dialogueSystem.start(obj.dialogueKey, () => {
          // onComplete handled by DialogueScene resuming WorldScene
        })
        this.scene.scene.launch('DialogueScene')
      }
    }

    obj.onInteract?.()
  }

  // Auto-fire story triggers (no keypress needed — on proximity)
  checkAutoTriggers(playerX: number, playerY: number) {
    for (const obj of this.objects) {
      if (obj.triggered || obj.type !== 'trigger') continue
      const cx = obj.bounds.centerX
      const cy = obj.bounds.centerY
      const dist = Math.hypot(playerX - cx, playerY - cy)
      if (dist < 60) {
        this.fire(obj)
        return // one at a time
      }
    }
  }
}