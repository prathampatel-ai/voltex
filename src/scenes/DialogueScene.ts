// ── DIALOGUE SCENE ──────────────────────────────────────────────────────────
// Overlay scene. Launched on top of WorldScene when dialogue is active.
// Reads from dialogueSystem singleton.

import Phaser from 'phaser'
import { dialogueSystem } from '../systems/DialogueSystem'

const W = 960
const PANEL_H = 160
const PANEL_Y = 640 - PANEL_H      // sits at screen bottom

export class DialogueScene extends Phaser.Scene {
  private panel!: Phaser.GameObjects.Rectangle
  private portraitBg!: Phaser.GameObjects.Rectangle
  private portraitText!: Phaser.GameObjects.Text
  private speakerText!: Phaser.GameObjects.Text
  private bodyText!: Phaser.GameObjects.Text
  private promptText!: Phaser.GameObjects.Text
  private accentBar!: Phaser.GameObjects.Rectangle
  private confirmKey!: Phaser.Input.Keyboard.Key
  private spaceKey!: Phaser.Input.Keyboard.Key
  private justOpened = false

  constructor() { super({ key: 'DialogueScene' }) }

  create() {
    // Semi-transparent backdrop strip
    this.add.rectangle(0, PANEL_Y - 1, W, 1, 0x5b8cff, 0.25).setOrigin(0)

    // Main panel
    this.panel = this.add.rectangle(0, PANEL_Y, W, PANEL_H, 0x0d1220, 0.96).setOrigin(0)
    this.add.rectangle(0, PANEL_Y, W, PANEL_H, 0x0d1220).setOrigin(0)
      .setStrokeStyle(1, 0x252d4a)

    // Accent top bar (recoloured per speaker)
    this.accentBar = this.add.rectangle(0, PANEL_Y, W, 2, 0x5b8cff).setOrigin(0)

    // Portrait circle
    this.portraitBg = this.add.rectangle(28, PANEL_Y + 20, 52, 52, 0x161c30)
      .setOrigin(0).setStrokeStyle(1, 0x252d4a)
    this.portraitText = this.add.text(54, PANEL_Y + 46, '⚡', {
      fontSize: '26px',
    }).setOrigin(0.5)

    // Speaker name
    this.speakerText = this.add.text(96, PANEL_Y + 20, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#5b8cff',
      letterSpacing: 2,
    })

    // Body text — main dialogue
    this.bodyText = this.add.text(96, PANEL_Y + 42, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#d0d8f0',
      wordWrap: { width: W - 140 },
      lineSpacing: 6,
    })

    // Advance prompt (blinking)
    this.promptText = this.add.text(W - 24, PANEL_Y + PANEL_H - 20, '▶ SPACE', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#252d4a',
      letterSpacing: 2,
    }).setOrigin(1, 1)

    this.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    // Input
    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.spaceKey   = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Slight delay so the key that opened dialogue doesn't immediately advance it
    this.justOpened = true
    this.time.delayedCall(120, () => { this.justOpened = false })

    this.renderCurrent()

    // Slide in
    this.panel.setAlpha(0)
    this.tweens.add({ targets: [this.panel, this.speakerText, this.bodyText, this.portraitBg, this.portraitText, this.accentBar, this.promptText], alpha: 1, duration: 180 })
  }

  renderCurrent() {
    const beat = dialogueSystem.currentBeat
    if (!beat) return

    const colour = beat.colour || '#d0d8f0'
    this.accentBar.setFillStyle(Phaser.Display.Color.HexStringToColor(colour).color)
    this.portraitBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(colour).color)
    this.portraitText.setText(beat.portrait)
    this.speakerText.setText(beat.speaker).setStyle({ color: colour })
    this.bodyText.setText(dialogueSystem.currentPage)
    this.promptText.setText(dialogueSystem.hasMore ? '▶ SPACE' : '■ SPACE')
  }

  update() {
    if (this.justOpened) return
    if (!dialogueSystem.isActive) { this.closeScene(); return }

    const pressed = Phaser.Input.Keyboard.JustDown(this.confirmKey) ||
                    Phaser.Input.Keyboard.JustDown(this.spaceKey)

    if (pressed) {
      const still = dialogueSystem.advance()
      if (still) {
        this.renderCurrent()
      } else {
        this.closeScene()
      }
    }
  }

  closeScene() {
    this.scene.stop('DialogueScene')
    // Resume world if it was paused for this dialogue
    if (this.scene.isPaused('WorldScene')) {
      this.scene.resume('WorldScene')
    }
  }
}