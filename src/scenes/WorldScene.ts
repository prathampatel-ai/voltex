// ── WORLD SCENE — Phase 3 ────────────────────────────────────────────────────
// Multi-map, NPC system, interactions, inventory, zone transitions.

import Phaser from 'phaser'
import { InteractionSystem } from '../systems/InteractionSystem'
import { ZoneTransitionSystem } from '../systems/ZoneTransition'
import { dialogueSystem } from '../systems/DialogueSystem'

// Map configs — add more as Tiled maps are built
const MAP_CONFIGS: Record<string, {
  mapKey: string
  tileKey: string
  bgColour: number
  label: string
  music?: string
}> = {
  'bandra-west': {
    mapKey: 'map-bandra',
    tileKey: 'tiles',
    bgColour: 0x080c18,
    label: 'BANDRA WEST',
  },
  'bandra-route': {
    mapKey: 'map-route',
    tileKey: 'tiles',
    bgColour: 0x060a14,
    label: 'BANDRA → KURLA CORRIDOR',
  },
  'kurla-junction': {
    mapKey: 'map-kurla',
    tileKey: 'tiles',
    bgColour: 0x0c0806,
    label: 'KURLA JUNCTION',
  },
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private interactKey!: Phaser.Input.Keyboard.Key
  private inventoryKey!: Phaser.Input.Keyboard.Key
  private mapWidth = 0
  private mapHeight = 0
  private interactions!: InteractionSystem
  private transitions!: ZoneTransitionSystem
  private currentMapId = 'bandra-west'

  constructor() { super({ key: 'WorldScene' }) }

  create() {
    // Read map from registry (set by ZoneTransitionSystem on zone entry)
    const nextMap = this.registry.get('nextMap') as string | undefined
    if (nextMap && MAP_CONFIGS[nextMap]) {
      this.currentMapId = nextMap
    }

    const cfg = MAP_CONFIGS[this.currentMapId]
    this.cameras.main.setBackgroundColor(cfg.bgColour)

    // ── BUILD TILEMAP ──────────────────────────────────────────────────────
    const map = this.make.tilemap({ key: cfg.mapKey })
    const tileset = map.addTilesetImage('voltex-tiles', cfg.tileKey)!

    map.createLayer('Ground', tileset, 0, 0)!
    const collisionLayer = map.createLayer('Collision', tileset, 0, 0)!
    collisionLayer.setCollisionByProperty({ collides: true })

    this.mapWidth  = map.widthInPixels
    this.mapHeight = map.heightInPixels

    // ── PLAYER ────────────────────────────────────────────────────────────
    const g = this.add.graphics()
    g.fillStyle(0x5b8cff)
    g.fillCircle(10, 10, 10)
    g.fillStyle(0x3b6cd4)
    g.fillRect(4, 10, 12, 10)
    g.generateTexture('player', 20, 24)
    g.destroy()

    const spawnX = (this.registry.get('spawnX') as number | undefined) ?? this.mapWidth / 2
    const spawnY = (this.registry.get('spawnY') as number | undefined) ?? this.mapHeight / 2
    this.registry.remove('nextMap')
    this.registry.remove('spawnX')
    this.registry.remove('spawnY')

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player')
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, collisionLayer)

    // ── CAMERA ────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)

    // ── INPUT ─────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any
    this.interactKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.inventoryKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I)

    // ── SYSTEMS ───────────────────────────────────────────────────────────
    this.interactions = new InteractionSystem(this)
    this.transitions  = new ZoneTransitionSystem(this)

    // Populate NPCs / objects / exits for this map
    this.buildMapObjects(this.currentMapId, map)
    // ── ENCOUNTER EVENTS ─────────────────────────
    this.events.on('startEncounter', (data: any) => {
      this.startEncounter(data)
    })

    this.events.on('battleComplete', (data: any) => {
      this.onBattleComplete(data)
    })

    // ── UI OVERLAY ────────────────────────────────────────────────────────
    this.scene.launch('UIScene', { worldScene: this, mapLabel: cfg.label })

    // Fade in
    this.cameras.main.fadeIn(400)

    // Zone label flash
    const zoneLabel = this.registry.get('zoneLabel') as string | undefined
    if (zoneLabel) {
      this.registry.remove('zoneLabel')
      this.time.delayedCall(200, () => {
        const lbl = this.add.text(
          this.cameras.main.scrollX + this.cameras.main.width / 2,
          this.cameras.main.scrollY + 60,
          zoneLabel,
          { fontFamily: 'monospace', fontSize: '13px', color: '#d0d8f0', letterSpacing: 4 }
        ).setOrigin(0.5).setAlpha(0).setDepth(20)
        this.tweens.add({
          targets: lbl,
          alpha: 1, duration: 300, yoyo: true, hold: 1200,
          onComplete: () => lbl.destroy(),
        })
      })
    }

    // ── BATTLE SHORTCUT (dev) ──────────────────────────────────────────────
    this.input.keyboard!.once('keydown-B', () => {
      this.scene.pause('WorldScene')
      this.scene.pause('UIScene')
      this.scene.launch('BattleScene')
    })
  }

  // ── MAP OBJECT BUILDER ───────────────────────────────────────────────────
  private buildMapObjects(mapId: string, _map: Phaser.Tilemaps.Tilemap) {
    const TS = 32 // tile size

    if (mapId === 'bandra-west') {
      // Story trigger — fires once on arrival
      this.interactions.register({
        type: 'trigger',
        sprite: this.add.rectangle(0, 0, 0, 0).setVisible(false),
        bounds: new Phaser.Geom.Rectangle(200, 200, 80, 80),
        dialogueKey: 'story_bandra_start',
      })

      // Priya NPC
      this.addNPC(7 * TS, 9 * TS, '🌊', '#22d3ee', 'priya_first_contact', 'priya_subsequent')

      // Zara NPC
      this.addNPC(20 * TS, 14 * TS, '🪨', '#3ddc84', 'zara_bandra')

      // Civilians
      this.addNPC(3 * TS, 2 * TS, '🧔', '#d0d8f0', 'civilian_shop_owner')
      this.addNPC(18 * TS, 3 * TS, '👩', '#d0d8f0', 'civilian_student')

      // NEXUS scout
      this.addNPC(25 * TS, 8 * TS, '🕴', '#ff7b3a', 'nexus_scout')

      // BSC patrol
      this.addNPC(12 * TS, 7 * TS, '🪪', '#ffc14a', 'bsc_patrol')

      // Sign
      this.addSign(14 * TS, 5 * TS, 'sign_bandra_west')

      // Chest
      this.addChest(22 * TS, 2 * TS, 'spark_charge_s', 'chest_spark_charge')

      // Exit door → route
      this.addDoor(28 * TS, 10 * TS, 'bandra-route', 2 * TS, 10 * TS, 'BANDRA → KURLA CORRIDOR')

    } else if (mapId === 'bandra-route') {
      // Route NPCs
      this.addNPC(5 * TS, 10 * TS, '🧳', '#d0d8f0', 'route_traveller')
      this.addNPC(15 * TS, 7 * TS, '⚡', '#22d3ee', 'circuit_runner')

      // Sign
      this.addSign(10 * TS, 5 * TS, 'sign_route_connector')

      // Chest mid-route
      this.addChest(20 * TS, 12 * TS, 'stamina_pack_s', 'chest_stamina_pack')

      // Exits
      this.addDoor(1 * TS, 10 * TS, 'bandra-west', 27 * TS, 10 * TS, 'BANDRA WEST')
      this.addDoor(28 * TS, 10 * TS, 'kurla-junction', 2 * TS, 10 * TS, 'KURLA JUNCTION')

    } else if (mapId === 'kurla-junction') {
      // Story trigger — fires once on arrival
      this.interactions.register({
        type: 'trigger',
        sprite: this.add.rectangle(0, 0, 0, 0).setVisible(false),
        bounds: new Phaser.Geom.Rectangle(3 * TS, 8 * TS, 5 * TS, 5 * TS),
        dialogueKey: 'story_kurla_arrival',
      })

      // Kurla NPCs
      this.addNPC(8 * TS, 9 * TS, '🧑', '#d0d8f0', 'kurla_survivor')
      this.addNPC(15 * TS, 13 * TS, '🔍', '#a855f7', 'kurla_investigator')

      // Signs
      this.addSign(5 * TS, 3 * TS, 'sign_kurla_restricted')

      // Chest — stabiliser hidden in the rubble
      this.addChest(24 * TS, 14 * TS, 'stabiliser', 'chest_stabiliser')

      // Exit back
      this.addDoor(1 * TS, 10 * TS, 'bandra-route', 27 * TS, 10 * TS, 'BANDRA → KURLA CORRIDOR')
      // ── ENCOUNTERS ─────────────────────────

      // First enemy
      this.interactions.register({
        type: 'encounter',
        sprite: this.add.rectangle(10 * TS, 10 * TS, 20, 20, 0xff0000, 0.3),
        bounds: new Phaser.Geom.Rectangle(10 * TS - 16, 10 * TS - 16, 32, 32),
        encounterId: 'veil_1',
        enemy: 'veil_scout'
      })

      // Second enemy
      this.interactions.register({
        type: 'encounter',
        sprite: this.add.rectangle(18 * TS, 10 * TS, 20, 20, 0xff0000, 0.3),
        bounds: new Phaser.Geom.Rectangle(18 * TS - 16, 18 * TS - 16, 32, 32),
        encounterId: 'veil_2',
        enemy: 'veil_scout'
      })
    }
  }
  startEncounter(data: any) {
  this.scene.pause('WorldScene')
  this.scene.pause('UIScene')

  this.scene.launch('BattleScene', {
    encounterId: data.encounterId,
    enemy: data.enemy
  })
}

onBattleComplete({ encounterId, result }: any) {
  console.log('Battle finished:', result)

  if (result === 'win') {
    // Hide encounter zone (enemy cleared)
    const obj = (this.interactions as any).objects.find(
      (o: any) => o.encounterId === encounterId
    )

    if (obj?.sprite) obj.sprite.setVisible(false)
  }
}
  // ── HELPERS ───────────────────────────────────────────────────────────────

  private addNPC(
    x: number, y: number,
    emoji: string, colour: string,
    dialogueKey: string,
    subsequentKey?: string
  ) {
    // Visual marker
    const circle = this.add.circle(x, y, 14, 0x161c30)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(colour).color)
      .setDepth(2)
    const icon = this.add.text(x, y, emoji, { fontSize: '18px' }).setOrigin(0.5).setDepth(3)

    // Gentle bob
    this.tweens.add({
      targets: [circle, icon],
      y: '-=3',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    let hasSpoken = false
    this.interactions.register({
      type: 'npc',
      sprite: icon,
      bounds: new Phaser.Geom.Rectangle(x - 16, y - 16, 32, 32),
      dialogueKey: dialogueKey,
      onInteract: () => {
        if (hasSpoken && subsequentKey) {
          // Swap key after first conversation
          const obj = this.interactions['objects'].find(
            (o: any) => o.sprite === icon
          )
          if (obj) obj.dialogueKey = subsequentKey
        }
        hasSpoken = true
      },
    })
  }

  private addSign(x: number, y: number, dialogueKey: string) {
    const sign = this.add.text(x, y, '📋', { fontSize: '20px' }).setOrigin(0.5).setDepth(2)
    this.interactions.register({
      type: 'sign',
      sprite: sign,
      bounds: new Phaser.Geom.Rectangle(x - 12, y - 12, 24, 24),
      dialogueKey,
    })
  }

  private addChest(x: number, y: number, itemId: string, dialogueKey: string) {
    const chest = this.add.text(x, y, '📦', { fontSize: '20px' }).setOrigin(0.5).setDepth(2)
    // Subtle pulse
    this.tweens.add({
      targets: chest,
      scaleX: 1.1, scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })
    this.interactions.register({
      type: 'chest',
      sprite: chest,
      bounds: new Phaser.Geom.Rectangle(x - 12, y - 12, 24, 24),
      itemId,
      dialogueKey,
    })
  }

  private addDoor(x: number, y: number, targetMap: string, spawnX: number, spawnY: number, label: string) {
    // Visual exit marker
    const door = this.add.text(x, y, '🚪', { fontSize: '22px' }).setOrigin(0.5).setDepth(2)
    this.interactions.register({
      type: 'door',
      sprite: door,
      bounds: new Phaser.Geom.Rectangle(x - 16, y - 16, 32, 32),
      targetMap,
      spawnX,
      spawnY,
    })

    // Register in transition system for walk-through
    this.transitions.register({
      bounds: new Phaser.Geom.Rectangle(x - 20, y - 20, 40, 40),
      targetMap,
      spawnX,
      spawnY,
      label,
    })
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  update() {
    if (dialogueSystem.isActive) {
      this.player.setVelocity(0)
      return
    }

    const speed = 160
    let vx = 0, vy = 0

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -speed
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  speed
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -speed
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  speed

    // Diagonal normalise
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }

    this.player.setVelocity(vx, vy)

    const px = this.player.x
    const py = this.player.y
    const justZ = Phaser.Input.Keyboard.JustDown(this.interactKey)

    // Interaction system
    this.interactions.update(px, py, justZ)
    // Auto story triggers (no key needed)
    this.interactions.checkAutoTriggers(px, py)
    // Zone transitions (walk-through)
    this.transitions.update(px, py)

    // Inventory toggle
    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      if (this.scene.isActive('InventoryScene')) {
        this.scene.stop('InventoryScene')
        this.scene.resume('WorldScene')
      } else {
        this.scene.pause('WorldScene')
        this.scene.launch('InventoryScene')
      }
    }
  }
}