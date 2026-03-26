// ── ZONE TRANSITION SYSTEM ───────────────────────────────────────────────────
// Door/exit tiles. WorldScene registers exit zones; walking into them
// triggers a fade + scene restart with the new map key and spawn coords.

import Phaser from 'phaser'

export interface ExitZone {
  bounds: Phaser.Geom.Rectangle   // world-space rect covering the exit tile(s)
  targetMap: string               // map key to load in BootScene / WorldScene
  spawnX: number
  spawnY: number
  label?: string                  // shown briefly on transition: e.g. "KURLA JUNCTION"
}

export class ZoneTransitionSystem {
  private zones: ExitZone[] = []
  private scene: Phaser.Scene
  private transitioning = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  register(zone: ExitZone) {
    this.zones.push(zone)
  }

  update(playerX: number, playerY: number) {
    if (this.transitioning) return

    for (const zone of this.zones) {
      if (zone.bounds.contains(playerX, playerY)) {
        this.transition(zone)
        return
      }
    }
  }

  private transition(zone: ExitZone) {
    this.transitioning = true

    // Fade out, then restart WorldScene with new map data
    this.scene.cameras.main.fadeOut(400, 0, 0, 0)
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      // Pass target map info via scene registry
      this.scene.registry.set('nextMap', zone.targetMap)
      this.scene.registry.set('spawnX', zone.spawnX)
      this.scene.registry.set('spawnY', zone.spawnY)
      this.scene.registry.set('zoneLabel', zone.label ?? '')

      this.scene.scene.stop('UIScene')
      this.scene.scene.restart()
    })
  }
}