import Phaser from 'phaser'

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: any

  constructor() {
    super({ key: 'WorldScene' })
  }

  preload() {
    this.load.image('tiles', '/assets/tileset.png')
    this.load.tilemapTiledJSON('map', '/maps/bandra-west.json')
  }

  create() {
    const map = this.make.tilemap({ key: 'map' })
    const tileset = map.addTilesetImage('voltex-tiles', 'tiles')!

    const _groundLayer = map.createLayer('Ground', tileset, 0, 0)!
    const collisionLayer = map.createLayer('Collision', tileset, 0, 0)!

    collisionLayer.setCollisionByProperty({ collides: true })
    collisionLayer.setAlpha(0)

    const g = this.add.graphics()
    g.fillStyle(0x5b8cff)
    g.fillRect(0, 0, 20, 28)
    g.generateTexture('player', 20, 28)
    g.destroy()

    this.player = this.physics.add.sprite(
      map.widthInPixels / 2,
      map.heightInPixels / 2,
      'player'
    )
    this.player.setCollideWorldBounds(true)

    this.physics.add.collider(this.player, collisionLayer)

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any
  }

  update() {
    const speed = 160
    this.player.setVelocity(0)

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed)
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed)
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed)
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed)
    }
  }
}