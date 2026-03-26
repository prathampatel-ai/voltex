import Phaser from 'phaser'
import { BootScene }      from './scenes/BootScene'
import { WorldScene }     from './scenes/WorldScene'
import { UIScene }        from './scenes/UIScene'
import { BattleScene }    from './scenes/BattleScene'
import { DialogueScene }  from './scenes/DialogueScene'
import { InventoryScene } from './scenes/InventoryScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  backgroundColor: '#0a0c14',
  
  // ── ADD THIS ──
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 640,
  },
  // ─────────────
  
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [
    BootScene,
    WorldScene,
    UIScene,
    BattleScene,
    DialogueScene,
    InventoryScene,
  ],
  parent: 'app',
}

new Phaser.Game(config)