import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  private indexText!: Phaser.GameObjects.Text
  private locationText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    // Dark top bar
    const topBar = this.add.rectangle(0, 0, 960, 36, 0x0a0c14, 0.85)
      .setOrigin(0, 0)

    // VOLTEX logo left
    this.add.text(16, 8, 'VOLTEX', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#5b8cff',
      letterSpacing: 6,
    })

    // Location label centre
    this.locationText = this.add.text(480, 8, 'BANDRA WEST', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#6b7a9e',
      letterSpacing: 3,
    }).setOrigin(0.5, 0)

    // Volt Index top right
    this.indexText = this.add.text(944, 8, 'IDX  1', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffc14a',
      letterSpacing: 2,
    }).setOrigin(1, 0)

    // Bottom hint bar
    const bottomBar = this.add.rectangle(0, 624, 960, 16, 0x0a0c14, 0.7)
      .setOrigin(0, 0)

    this.hintText = this.add.text(480, 626, 'WASD / ARROWS — MOVE     B — BATTLE TEST', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#252d4a',
      letterSpacing: 2,
    }).setOrigin(0.5, 0)

    // Make UI scale with the game
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      topBar.setSize(gameSize.width, 36)
      bottomBar.setSize(gameSize.width, 16)
      bottomBar.setY(gameSize.height - 16)
      this.locationText.setX(gameSize.width / 2)
      this.indexText.setX(gameSize.width - 16)
      this.hintText.setX(gameSize.width / 2)
      this.hintText.setY(gameSize.height - 14)
    })
  }

  // Called from WorldScene to update the index display
  setIndex(value: number) {
    this.indexText.setText(`IDX  ${value}`)
  }

  setLocation(name: string) {
    this.locationText.setText(name)
  }
}
