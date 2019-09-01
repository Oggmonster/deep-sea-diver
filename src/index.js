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
  this.load.image('swim-bar', Images.SwimBar);
  this.load.image('arrow', Images.Arrow);
  this.load.spritesheet('swimmer', Images.Swimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
  this.load.spritesheet('fast-swimmer', Images.FastSwimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
}

let player;
let cursors;

let distanceText;
let airText;
let scoreText;
let arrow;

function create() {
  this.cameras.main.backgroundColor.setTo(11, 89, 126);

  this.cameras.main.setBounds(0, 0, 800, 8024 * 2);
  this.physics.world.setBounds(0, 0, 800, 8024 * 2);

  // graphics = this.add.graphics();

  // graphics.lineGradientStyle(20, 0xff0000, 0xff0000, 0x0000ff, 0x0000ff, 2);
  // graphics.lineBetween(600, 550, 200, 550);
  // graphics.setScrollFactor(0);

  var swimbar = this.add.image(200, 550, 'swim-bar');
  swimbar.setScrollFactor(0);
  arrow = this.add.image(35, 532, 'arrow');
  arrow.setScrollFactor(0);

  this.add.image(400, -280, 'sky');

  player = this.physics.add.sprite(400, 5, 'swimmer');
  player.angle = 75;
  player.flipX = true;

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  distanceText = this.add.text(16, 10, 'depth: 0 m', {
    fontSize: '32px',
    fill: '#000',
    backgroundColor: '#FFF'
  });
  distanceText.setScrollFactor(0);

  airText = this.add.text(16, 60, 'air: ' + air, {
    fontSize: '32px',
    fill: '#000',
    backgroundColor: '#FFF'
  });
  airText.setScrollFactor(0);

  scoreText = this.add.text(220, 500, 'record: 0 m', {
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
let airLimit = 20;
let hasAirBoost = false;
let airCapacity = 10000;
let air = airCapacity;
let maxArrowPosition = 365;
let minArrowPosition = 35;
let arrowPosition = 35;

function update() {
  if (air > 0) {
    air -= 1;
  } else {
    player.setVelocityY(0);
    player.anims.play('idle');
    return;
  }
  airText.text = `air: ${air}`;
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
  distanceText.text = `${distance}m`;

  if (distance > maxDepth) {
    maxDepth = distance;
  }

  if (air % 8 === 0) {
    arrowPosition = arrow.x + getArrowJump(velocity);
    if (arrowPosition < maxArrowPosition) {
      arrow.x = arrowPosition;
    } else {
      arrow.x = minArrowPosition;
    }
  }

  //yellow start 240 - 315
  //green 272-290
  //red 315 uppåt

  scoreText.text = `${arrowPosition}`;

  //check air boost
  if (distance >= airLimit && !hasAirBoost) {
    hasAirBoost = true;
    airLimit += 10;
  }
  if (player.y - 40 === 0) {
    if (hasAirBoost) {
      airCapacity += 200;
      hasAirBoost = false;
    }
    air = airCapacity;
    scoreText.text = `record: ${maxDepth}m`;
  }
  
}

function getArrowJump(velocity) {
  const absVelocity = velocity > 0 ? velocity : velocity * -1;
  if (absVelocity < 100) {
    return 1;
  }
  if (absVelocity < 200) {
    return 2;
  }
  if (absVelocity < 300) {
    return 3;
  }
  if (absVelocity < 500) {
    return 4;
  }
  return 5;
}

const game = new Phaser.Game(config);

window.game = game;
