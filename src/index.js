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
      gravity: { y: 5 },
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
let speedText;
let arrow;
let highScoreText;

function create() {
  this.cameras.main.backgroundColor.setTo(11, 89, 126);

  this.cameras.main.setBounds(0, 0, 800, 8024 * 2);
  this.physics.world.setBounds(0, 0, 800, 8024 * 2);

  var swimbar = this.add.image(400, 450, 'swim-bar');
  swimbar.setScrollFactor(0);
  arrow = this.add.image(350, 431, 'arrow');
  arrow.setScrollFactor(0);

  this.add.image(400, -280, 'sky');

  player = this.physics.add.sprite(400, 5, 'swimmer');
  player.angle = 75;
  player.flipX = true;

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  distanceText = this.add.text(400, 470, 'depth: 0 m', {
    fontSize: '12px',
    fill: '#fff'
  });
  distanceText.setScrollFactor(0);

  airText = this.add.text(470, 460, 'O2: ' + air, {
    fontSize: '12px',
    fill: '#fff'
  });
  airText.setScrollFactor(0);

  speedText = this.add.text(470, 443, 'record: 0 m', {
    fontSize: '12px',
    fill: '#fff'
  });
  speedText.setScrollFactor(0);

  highScoreText = this.add.text(400, 530, 'record: 0 m', {
    fontSize: '12px',
    fill: '#fff'
  });
  highScoreText.setScrollFactor(0);

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
let direction = 'DOWN';
let maxDepth = 0;
let distance = 0;
let airLimit = 5;
let hasAirBoost = false;
let airCapacity = 1200;
let air = airCapacity;
let maxArrowPosition = 450;
let minArrowPosition = 350;
let arrowPosition = 350;

function update() {
  if (air > 0) {
    air -= 1;
  } else {
    player.setVelocityY(0);
    player.anims.play('idle');
    return;
  }

  airText.text = `air: ${air}`;
  if (cursors.down.isDown) {
    swim();
    arrowPosition = minArrowPosition;
    arrow.x = arrowPosition;
    player.setVelocityY(velocity);
  }

  if (cursors.up.isDown) {
    direction = 'UP';
    velocity = -5;
    player.setVelocityY(velocity);
  }

  if (direction !== 'DOWN') {
    if (velocity < -300) {
      player.anims.play('fast-swim', true);
    } else {
      player.anims.play('swim', true);
    }
    player.angle = 75;
  } else {
    if (velocity > 300) {
      player.anims.play('fast-swim', true);
    } else {
      player.anims.play('swim', true);
    }
    player.angle = -105;
  }
  distance = Math.round((player.y - 40) / 100);
  distanceText.text = `${distance}m`;

  if (distance > maxDepth) {
    maxDepth = distance;
  }

  if (air % getArrowSpeed(velocity) === 0) {
    arrowPosition = arrow.x + getArrowJump(velocity);
    if (arrowPosition < maxArrowPosition) {
      arrow.x = arrowPosition;
    } else {
      arrow.x = minArrowPosition;
    }
  }

  speedText.text = `${velocity}`;

  //check air boost
  if (distance >= airLimit && !hasAirBoost) {
    hasAirBoost = true;
    airLimit += 5;
  }
  if (player.y - 40 === 0) {
    if (hasAirBoost) {
      airCapacity += 500;
      hasAirBoost = false;
    }
    air = airCapacity;
    highScoreText.text = `record: ${maxDepth}m`;
    direction = 'DOWN';
    velocity = 5;
    player.setVelocityY(velocity);
  }
}

var base = 350;
var fastSpeed = 50;
var normalSpeed = 25;
var badSpeed = 40;
var greenStart = base + 72;
var greenEnd = base + 79;
var yellowStart = base + 62;
var yellowEnd = base + 87;

function swim() {
  var isDown = direction === 'DOWN';

  //yellow start 240 - 315
  //green 272-290
  //red 315 uppåt
  //green
  if (arrowPosition >= greenStart && arrowPosition <= greenEnd) {
    velocity = isDown ? velocity + fastSpeed : velocity - fastSpeed;
    return;
  } else if (arrowPosition > yellowStart && arrowPosition < yellowEnd) {
    velocity = isDown ? velocity + normalSpeed : velocity - normalSpeed;
    return;
  } else if (arrowPosition >= yellowEnd) {
    velocity = isDown ? velocity - badSpeed : velocity + badSpeed;
    return;
  }
}

function getArrowJump(velocity) {
  const absVelocity = velocity > 0 ? velocity : velocity * -1;
  if (absVelocity < 300) {
    return 1;
  }
  return 2;
}

function getArrowSpeed(velocity) {
  const absVelocity = velocity > 0 ? velocity : velocity * -1;
  if (absVelocity < 100) {
    return 2;
  }
  return 1;
}

const game = new Phaser.Game(config);

window.game = game;
