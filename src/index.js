import Phaser from 'phaser';
import Images from './assets';
window.Phaser = Phaser;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 10 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  this.load.image('sky', Images.Sky);
  this.load.spritesheet('swimmer', Images.Swimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
  this.load.spritesheet('fast-swimmer', Images.FastSwimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
}

var player;
var cursors;
var score = 0;
var scoreText;

function create() {
  this.cameras.main.backgroundColor.setTo(11, 89, 126);

  this.cameras.main.setBounds(0, 0, 800, 8024 * 2);
  this.physics.world.setBounds(0, 0, 800, 8024 * 2);
  this.add.image(400, -280, 'sky');

  player = this.physics.add.sprite(400, 5, 'swimmer');
  player.angle = 75;
  player.flipX = true;

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  scoreText = this.add.text(16, 10, 'depth: 0 m', {
    fontSize: '32px',
    fill: '#000',
    backgroundColor: '#FFF'
  });
  scoreText.setScrollFactor(0);

  this.cameras.main.startFollow(player, true);

  this.anims.create({
    key: 'swim',
    frames: this.anims.generateFrameNumbers('swimmer', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'fast-swim',
    frames: this.anims.generateFrameNumbers('fast-swimmer', {
      start: 0,
      end: 7
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('swimmer', { start: 7, end: 0 }),
    frameRate: 20,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
}

let velocity = 0;
let maxDepth = 0;
let distance = 0;
function update() {
  if (cursors.up.isDown) {
    if (velocity > -500) {
      velocity -= 2;
    }
    player.setVelocityY(velocity);
    if (velocity < -300) {
      player.anims.play('fast-swim', true);
    } else {
      player.anims.play('swim', true);
    }
    player.angle = 75;
  } else if (cursors.down.isDown) {
    if (velocity < 500) {
      velocity += 2;
    }
    player.setVelocityY(velocity);
    if (velocity > 300) {
      player.anims.play('fast-swim', true);
    } else {
      player.anims.play('swim', true);
    }
    player.angle = -105;
  } else {
    velocity = 5;
    player.setVelocityY(velocity);
    player.anims.play('idle');
  }
  distance = Math.round((player.y - 40) / 100);
  scoreText.text = `${distance}m`;
}

const game = new Phaser.Game(config);

window.game = game;
