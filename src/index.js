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
      gravity: { y: 0 },
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
  this.load.image('bg1', Images.Bg1);
  this.load.image('bg2', Images.Bg2);
  this.load.image('bg3', Images.Bg3);
  this.load.spritesheet('swimmer', Images.Swimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
  this.load.spritesheet('fast-swimmer', Images.FastSwimmer, {
    frameWidth: 80,
    frameHeight: 80
  });
  this.load.spritesheet('bubbles', Images.Bubbles, {
    frameWidth: 23,
    frameHeight: 40
  });
}

let player;
let bubbles;
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

  this.add.image(400, -270, 'sky');
  this.add.image(400, 875, 'bg1');
  let bg1b = this.add.image(400, 2585, 'bg1');
  bg1b.flipY = true;
  this.add.image(400, 4295, 'bg1');
  let bg1c = this.add.image(400, 6005, 'bg1');
  bg1c.flipY = true;
  this.add.image(400, 7715, 'bg1');
  this.add.image(400, 9425, 'bg2');
  let bg2b = this.add.image(400, 11178, 'bg2');
  bg2b.flipY = true;
  this.add.image(400, 12931, 'bg2');
  this.add.image(400, 14593, 'bg3');
  let bg3 = this.add.image(400, 16165, 'bg3');
  bg3.flipY = true;

  bubbles = this.physics.add.sprite(200, 200, 'bubbles');
  bubbles.flipY = true;


  var swimbar = this.add.image(400, 450, 'swim-bar');
  swimbar.setScrollFactor(0);
  arrow = this.add.image(350, 431, 'arrow');
  arrow.setScrollFactor(0);

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

  this.anims.create({
    key: 'bubble',
    frames: this.anims.generateFrameNumbers('bubbles', { start: 4, end: 0 }),
    frameRate: 3,
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
let airCapacity = 1000;
let air = airCapacity;
let maxArrowPosition = 450;
let minArrowPosition = 350;
let arrowPosition = 350;
let isArrowDirectionRight = true;
let maxX = 700;
let minX = 100;

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
    player.setVelocityY(velocity);
  }

  if (cursors.up.isDown) {
    if (direction === 'DOWN') {
      velocity = -5;
      direction = 'UP';
    }
    swim();
    player.setVelocityY(velocity);
  }

  if (cursors.left.isDown) {
    if (player.x > minX) {
      player.x = player.x - 2;
    }
  }

  if (cursors.right.isDown) {
    if (player.x < maxX) {
      player.x = player.x + 2;
    }
  }

  bubbles.anims.play('bubble', true);
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
  distance = Math.round((player.y - 40) / 50);
  distanceText.text = `${distance}m`;

  if (distance > maxDepth) {
    maxDepth = distance;
  }

  if (air % getArrowSpeed(velocity) === 0) {
    arrowPosition = arrow.x + (isArrowDirectionRight ? 1 : -1);
    if (isArrowDirectionRight) {
      if (arrowPosition < maxArrowPosition) {
        arrow.x = arrowPosition;
      } else {
        isArrowDirectionRight = false;
      }
    } else {
      if (arrowPosition > minArrowPosition) {
        arrow.x = arrowPosition;
      } else {
        isArrowDirectionRight = true;
      }
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
      airCapacity += 200;
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

var greenRightStart = base + 87;
var greenRightEnd = base + 92;
var yellowRightStart = base + 83;
var yellowRightEnd = base + 96;

function checkRightArrowPostion(isDown) {
  if (arrowPosition >= greenRightStart && arrowPosition <= greenRightEnd) {
    velocity = isDown ? velocity + fastSpeed : velocity - fastSpeed;
    return true;
  } else if (
    arrowPosition >= yellowRightStart &&
    arrowPosition <= yellowRightEnd
  ) {
    velocity = isDown ? velocity + normalSpeed : velocity - normalSpeed;
    return true;
  } else if (arrowPosition > yellowRightEnd) {
    velocity = isDown ? velocity - badSpeed : velocity + badSpeed;
    return true;
  }
  return false;
}

var greenLeftStart = base + 9;
var greenLeftEnd = base + 14;
var yellowLeftStart = base + 5;
var yellowLeftEnd = base + 18;

function checkLeftArrowPostion(isDown) {
  if (arrowPosition >= greenLeftStart && arrowPosition <= greenLeftEnd) {
    velocity = isDown ? velocity + fastSpeed : velocity - fastSpeed;
    return true;
  } else if (
    arrowPosition >= yellowLeftStart &&
    arrowPosition <= yellowLeftEnd
  ) {
    velocity = isDown ? velocity + normalSpeed : velocity - normalSpeed;
    return true;
  } else if (arrowPosition < yellowLeftStart) {
    velocity = isDown ? velocity - badSpeed : velocity + badSpeed;
    return true;
  }
  return false;
}

function swim() {
  const isDown = direction === 'DOWN';
  let isHit = false;
  if (isArrowDirectionRight) {
    isHit = checkRightArrowPostion(isDown);
  } else {
    isHit = checkLeftArrowPostion(isDown);
  }
  if (isHit) {
    isArrowDirectionRight = !isArrowDirectionRight;
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
