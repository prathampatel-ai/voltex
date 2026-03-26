import Phaser from 'phaser'

export class BattleScene extends Phaser.Scene {
  private container!: HTMLDivElement
  private encounterId!: string

  constructor() {
    super({ key: 'BattleScene' })
  }

  create(data: any) {
  this.encounterId = data.encounterId

  this.container = document.createElement('div')

  Object.assign(this.container.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '1000',
    background: 'black'
  })

  document.body.appendChild(this.container)

  this.loadBattleEngine(data.enemy)
}

  loadBattleEngine(enemyType: string) {
  const iframe = document.createElement('iframe')

  iframe.src = `/battle/index.html?enemy=${enemyType}`
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'

  this.container.appendChild(iframe)

  window.addEventListener('message', this.handleMessage)
}

  handleMessage = (event: MessageEvent) => {
    if (!event.data) return

    if (event.data.type === 'BATTLE_END') {
      this.endBattle(event.data.result)
    }
  }

  endBattle(result: 'win' | 'lose' | 'fled') {
    window.removeEventListener('message', this.handleMessage)

    this.container.remove()

    this.scene.stop('BattleScene')

    const world = this.scene.get('WorldScene')

    world.events.emit('battleComplete', {
      encounterId: this.encounterId,
      result
    })

    this.scene.resume('WorldScene')
    this.scene.resume('UIScene')
  }
}