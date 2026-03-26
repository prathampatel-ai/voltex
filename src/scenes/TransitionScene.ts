import Phaser from 'phaser';

export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super('TransitionScene');
  }

  create(data: any) {
    const { payload } = data;

    const cam = this.cameras.main;

    // Flash effect
    cam.flash(300, 255, 255, 255);
    cam.shake(300, 0.01);

    this.time.delayedCall(400, () => {
      this.scene.stop('TransitionScene');

      this.scene.launch('BattleScene', {
        enemy: payload.enemy,
        encounterId: payload.id
      });
    });
  }
}