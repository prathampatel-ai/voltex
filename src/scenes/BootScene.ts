import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }

  preload() {
    // Loading bar
    const barBg = this.add.rectangle(480, 320, 400, 12, 0x252d4a)
    const bar   = this.add.rectangle(280, 320, 0, 8, 0x5b8cff)
    this.add.text(480, 296, 'LOADING', {
      fontFamily: 'monospace', fontSize: '13px', color: '#6b7a9e', letterSpacing: 4,
    }).setOrigin(0.5)

    this.load.on('progress', (v: number) => {
      bar.width = 396 * v
      bar.x = 280 + (396 * v) / 2
    })

    // Tileset
    this.load.image('tiles', '/assets/tileset.png')

    // All maps
    this.load.tilemapTiledJSON('map-bandra',  '/maps/bandra-west.json')
    this.load.tilemapTiledJSON('map-route',   '/maps/bandra-route.json')
    this.load.tilemapTiledJSON('map-kurla',   '/maps/kurla-junction.json')
  }

  create() {
    this.scene.start('WorldScene')
  }
}