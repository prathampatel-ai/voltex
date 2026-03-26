import Phaser from 'phaser'

// Stat block type
interface Combatant {
  name: string
  hp: number
  maxHp: number
  sta: number
  maxSta: number
  wil: number
  maxWil: number
  atk: number
  def: number
}

export class BattleScene extends Phaser.Scene {
  private encounterId!: string
  private player!: Combatant
  private enemy!: Combatant
  private playerHpBar!: Phaser.GameObjects.Rectangle
  private playerWilBar!: Phaser.GameObjects.Rectangle
  private enemyHpBar!: Phaser.GameObjects.Rectangle
  private enemyWilBar!: Phaser.GameObjects.Rectangle
  private logLines: Phaser.GameObjects.Text[] = []
  private menuButtons: Phaser.GameObjects.Rectangle[] = []
  private playerTurn: boolean = true
  private battleActive: boolean = true
  private round: number = 1
  private roundText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BattleScene' })
  }

  create(data: any) {
    const W = 960

    // Background
    this.add.rectangle(0, 0, W, 640, 0x0a0c14).setOrigin(0)

    // Subtle grid lines for atmosphere
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x252d4a, 0.3)
    for (let x = 0; x < W; x += 32) grid.moveTo(x, 0).lineTo(x, 640)
    for (let y = 0; y < 640; y += 32) grid.moveTo(0, y).lineTo(W, y)
    grid.strokePath()

    // Init combatants
    this.player = { name: 'LUCKYFER', hp: 164, maxHp: 164, sta: 120, maxSta: 120, wil: 170, maxWil: 170, atk: 52, def: 30 }
    this.enemy  = { name: 'ARYAN SOOD', hp: 420, maxHp: 420, sta: 158, maxSta: 158, wil: 280, maxWil: 280, atk: 108, def: 65 }

    this.round = 1
    this.playerTurn = true
    this.battleActive = true
    this.encounterId = data.encounterId

    this.buildUI(W)
    this.log(`══ BATTLE START — Round 1 ══`)
    this.log(`Luckyfer vs Aryan Sood`)
  }

  buildUI(W: number) {
    // ── HEADER ──
    this.add.rectangle(0, 0, W, 40, 0x111525).setOrigin(0)
    this.add.text(16, 10, 'VOLTEX', { fontFamily: 'monospace', fontSize: '16px', color: '#5b8cff', letterSpacing: 6 })
    this.roundText = this.add.text(W / 2, 10, 'ROUND 01', { fontFamily: 'monospace', fontSize: '12px', color: '#6b7a9e', letterSpacing: 3 }).setOrigin(0.5, 0)
    this.add.text(W - 16, 10, 'BATTLE', { fontFamily: 'monospace', fontSize: '12px', color: '#ff4a6e', letterSpacing: 3 }).setOrigin(1, 0)

    // ── PLAYER CARD ──
    this.buildCard(16, 52, true)

    // ── ENEMY CARD ──
    this.buildCard(W / 2 + 8, 52, false)

    // ── COMBAT LOG ──
    this.add.rectangle(16, 260, W - 32, 120, 0x111525).setOrigin(0).setStrokeStyle(1, 0x252d4a)

    // ── ACTION MENU ──
    this.buildMenu(W)
  }

  buildCard(x: number, y: number, isPlayer: boolean) {
    const W = 460
    const c = isPlayer ? this.player : this.enemy
    const accent = isPlayer ? 0x5b8cff : 0xff4a6e

    this.add.rectangle(x, y, W, 196, 0x111525).setOrigin(0).setStrokeStyle(1, 0x252d4a)
    // Accent left border
    this.add.rectangle(x, y, 3, 196, accent).setOrigin(0)

    // Name
    this.add.text(x + 14, y + 12, c.name, { fontFamily: 'monospace', fontSize: '15px', color: '#ffffff' })

    // Element tag
    const tag = isPlayer ? '⚡ LIGHTNING' : '🔥 FIRE'
    const tagColor = isPlayer ? '#5b8cff' : '#ff7b3a'
    this.add.text(x + 14, y + 32, tag, { fontFamily: 'monospace', fontSize: '10px', color: tagColor })

    // HP bar
    this.add.text(x + 14, y + 58, 'HP', { fontFamily: 'monospace', fontSize: '10px', color: '#6b7a9e' })
    this.add.rectangle(x + 40, y + 60, 390, 10, 0x1a1f30).setOrigin(0)
    const hpBar = this.add.rectangle(x + 40, y + 60, 390, 10, 0x3ddc84).setOrigin(0)
    if (isPlayer) this.playerHpBar = hpBar
    else this.enemyHpBar = hpBar

    // WIL bar
    this.add.text(x + 14, y + 82, 'WIL', { fontFamily: 'monospace', fontSize: '10px', color: '#6b7a9e' })
    this.add.rectangle(x + 40, y + 84, 390, 10, 0x1a1f30).setOrigin(0)
    const wilBar = this.add.rectangle(x + 40, y + 84, 390, 10, 0x5b8cff).setOrigin(0)
    if (isPlayer) this.playerWilBar = wilBar
    else this.enemyWilBar = wilBar

    // Stat numbers
    this.add.text(x + 14, y + 108, `HP  ${c.hp} / ${c.maxHp}`, { fontFamily: 'monospace', fontSize: '11px', color: '#3ddc84' })
    this.add.text(x + 14, y + 126, `WIL ${c.wil} / ${c.maxWil}`, { fontFamily: 'monospace', fontSize: '11px', color: '#5b8cff' })
    this.add.text(x + 14, y + 144, `ATK ${c.atk}   DEF ${c.def}`, { fontFamily: 'monospace', fontSize: '11px', color: '#6b7a9e' })
  }

  buildMenu(W: number) {
    this.add.rectangle(16, 392, W - 32, 232, 0x111525).setOrigin(0).setStrokeStyle(1, 0x252d4a)
    this.add.text(28, 400, '⚡ SKILLS', { fontFamily: 'monospace', fontSize: '11px', color: '#5b8cff', letterSpacing: 2 })

    const skills = [
      { id: 'L1',  name: 'Lightning Sparks', wil: 10,  dmg: 20,  fx: '' },
      { id: 'L5',  name: 'Overload',          wil: 60,  dmg: 70,  fx: 'STUN 1' },
      { id: 'L6',  name: 'Thunder Beam',      wil: 50,  dmg: 85,  fx: '' },
      { id: 'L8',  name: 'Arc Chain ×3',      wil: 70,  dmg: 90,  fx: 'CHAIN' },
      { id: 'S1',  name: 'Pressure Tap',      wil: 10,  dmg: 15,  fx: '+PRESS' },
      { id: 'S5',  name: 'Concussion Burst',  wil: 40,  dmg: 55,  fx: 'STUN 1' },
    ]

    skills.forEach((sk, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const bx = 28 + col * 306
      const by = 420 + row * 92

      const btn = this.add.rectangle(bx, by, 294, 80, 0x161c30).setOrigin(0).setInteractive()
        .setStrokeStyle(1, 0x252d4a)
        .on('pointerover', () => btn.setStrokeStyle(1, 0x5b8cff))
        .on('pointerout',  () => btn.setStrokeStyle(1, 0x252d4a))
        .on('pointerdown', () => this.playerAct(sk))

      this.add.text(bx + 10, by + 10, sk.name, { fontFamily: 'monospace', fontSize: '13px', color: '#d0d8f0' })
      this.add.text(bx + 10, by + 34, `WIL ${sk.wil}`, { fontFamily: 'monospace', fontSize: '10px', color: '#5b8cff' })
      this.add.text(bx + 70, by + 34, `DMG ${sk.dmg}`, { fontFamily: 'monospace', fontSize: '10px', color: '#ff4a6e' })
      if (sk.fx) this.add.text(bx + 140, by + 34, sk.fx, { fontFamily: 'monospace', fontSize: '10px', color: '#a855f7' })

      this.menuButtons.push(btn)
    })

    // Guard / Focus buttons
    // These are inline at the bottom of the skill grid area — omitted for brevity, add in Phase 4
  }

  // ── COMBAT LOG ────────────────────────────────────────────────────────────
  log(text: string, color: string = '#6b7a9e') {
    // Shift lines up
    this.logLines.forEach(l => l.setY(l.y - 16))
    this.logLines = this.logLines.filter(l => l.y > 260)
    this.logLines.forEach(l => { if (l.y < 268) l.setAlpha(0.4) })

    const line = this.add.text(28, 348, text, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color,
    })
    this.logLines.push(line)
  }

  // ── DAMAGE CALC ───────────────────────────────────────────────────────────
  calcDamage(atk: number, baseDmg: number, def: number, stab: boolean): { dmg: number, crit: boolean } {
    let base = baseDmg * (atk / 100)
    if (stab) base *= 1.25
    const crit = Math.random() < 0.05
    if (crit) base *= 1.75
    base *= (0.95 + Math.random() * 0.10)
    if (!crit) base = Math.max(1, base - def)
    return { dmg: Math.max(1, Math.round(base)), crit }
  }

  updateBars() {
    this.playerHpBar.setScale(Math.max(0, this.player.hp / this.player.maxHp), 1)
    this.playerWilBar.setScale(Math.max(0, this.player.wil / this.player.maxWil), 1)
    this.enemyHpBar.setScale(Math.max(0, this.enemy.hp / this.enemy.maxHp), 1)
    this.enemyWilBar.setScale(Math.max(0, this.enemy.wil / this.enemy.maxWil), 1)
    this.roundText.setText(`ROUND ${String(this.round).padStart(2, '0')}`)
  }

  // ── PLAYER ACTION ─────────────────────────────────────────────────────────
  playerAct(skill: { name: string, wil: number, dmg: number, fx: string }) {
    if (!this.playerTurn || !this.battleActive) return
    if (this.player.wil < skill.wil) {
      this.log('Not enough WIL!', '#ff4a6e')
      return
    }

    this.player.wil -= skill.wil
    const { dmg, crit } = this.calcDamage(this.player.atk, skill.dmg, this.enemy.def, true)
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg)

    this.log(`⚡ Luckyfer — ${skill.name}`, '#5b8cff')
    this.log(crit ? `💥 CRIT! ${dmg} damage!` : `→ ${dmg} damage to Aryan`, '#ffc14a')

    this.updateBars()

    if (this.enemy.hp <= 0) { this.endBattle(true); return }

    this.playerTurn = false
    this.time.delayedCall(900, () => this.enemyTurn())
  }

  // ── ENEMY AI ──────────────────────────────────────────────────────────────
  enemyTurn() {
    if (!this.battleActive) return

    const skills = [
      { name: 'Ember Shot',  wil: 10, dmg: 18 },
      { name: 'Flame Beam',  wil: 50, dmg: 95 },
      { name: 'Incinerate',  wil: 55, dmg: 88 },
    ]

    const wilPct = this.enemy.wil / this.enemy.maxWil
    if (wilPct < 0.2) {
      this.enemy.wil = Math.min(this.enemy.maxWil, this.enemy.wil + Math.round(this.enemy.maxWil * 0.4))
      this.log(`🔥 Aryan steadies — recovering WIL.`, '#ff4a6e')
      this.endRound()
      return
    }

    const sk = this.enemy.wil >= 50 && Math.random() < 0.4 ? skills[1] : skills[0]
    this.enemy.wil -= sk.wil

    const { dmg, crit } = this.calcDamage(this.enemy.atk, sk.dmg, this.player.def, true)
    this.player.hp = Math.max(0, this.player.hp - dmg)

    this.log(`🔥 Aryan — ${sk.name}`, '#ff4a6e')
    this.log(crit ? `💥 CRIT! ${dmg} damage!` : `→ ${dmg} damage to Luckyfer`, '#ffc14a')

    this.updateBars()

    if (this.player.hp <= 0) { this.endBattle(false); return }
    this.endRound()
  }

  endRound() {
    this.round++
    // Passive WIL regen
    this.player.wil = Math.min(this.player.maxWil, this.player.wil + Math.round(this.player.maxWil * 0.12))
    this.log(`── Round ${this.round} ──`, '#252d4a')
    this.updateBars()
    this.playerTurn = true
  }

  endBattle(win: boolean) {
    this.battleActive = false
    const msg = win ? 'VICTORY' : 'DEFEATED'
    const color = win ? '#3ddc84' : '#ff4a6e'
    this.add.rectangle(480, 320, 400, 160, 0x0a0c14).setStrokeStyle(1, win ? 0x3ddc84 : 0xff4a6e)
    this.add.text(480, 280, msg, { fontFamily: 'monospace', fontSize: '40px', color, letterSpacing: 8 }).setOrigin(0.5)
    this.add.text(480, 340, win ? 'Aryan: "Offer still stands."' : 'Aryan: "You need more time."',
      { fontFamily: 'monospace', fontSize: '13px', color: '#6b7a9e' }).setOrigin(0.5)

    const back = this.add.text(480, 390, '[ RETURN TO WORLD ]', {
      fontFamily: 'monospace', fontSize: '13px', color: '#5b8cff', letterSpacing: 2
    }).setOrigin(0.5).setInteractive()
    back.on('pointerdown', () => {
      this.scene.stop('BattleScene')

      const world = this.scene.get('WorldScene')

      world.events.emit('battleComplete', {
        encounterId: this.encounterId,
        result: win ? 'win' : 'lose'
      })

      this.scene.resume('WorldScene')
      this.scene.resume('UIScene')
    })
  }
}
