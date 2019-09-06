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
  this.load.image('sha1', Images.Sha1);
  this.load.image('sha2', Images.Sha2);
  this.load.image('sha3', Images.Sha3);
  this.load.image('sha4', Images.Sha4);
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
let cursors;

let distanceText;
let airText;
let arrow;
let highScoreText;
let bubbleGroup;
let sharks;

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

  player = this.physics.add.sprite(400, 40, 'swimmer');
  player.angle = 75;
  player.flipX = true;

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setSize(20, 40);

  this.anims.create({
    key: 'bubble',
    frames: this.anims.generateFrameNumbers('bubbles', { start: 4, end: 0 }),
    frameRate: 3,
    repeat: -1
  });

  bubbleGroup = this.physics.add.group();
  for (var i = 0; i < 50; i++) {
    var x = Phaser.Math.RND.between(5, 795);
    var y = Phaser.Math.RND.between(80, 16000);
    var bubble = this.physics.add.sprite(x, y, 'bubbles').play('bubble');
    bubble.flipY = true;
    bubbleGroup.add(bubble);
  }

  this.anims.create({
    key: 'shark1',
    frames: [
      { key: 'sha1' },
      { key: 'sha2' },
      { key: 'sha3' },
      { key: 'sha4' }
    ],
    frameRate: 6,
    repeat: -1
  });

  sharks = this.physics.add.group();
  for (var i = 0; i < 15; i++) {
    var x = Phaser.Math.RND.between(5, 795);
    var y = Phaser.Math.RND.between(300, 16000);
    var shark = this.physics.add
      .sprite(x, y, 'sha1')
      .play('shark1')
      .setScale(0.5);
    if (i % 2 === 0) {
      shark.flipX = true;
      shark.direction = 'right';
    } else {
      shark.direction = 'left';
    }
    shark.setBounce(0.5);
    shark.setCollideWorldBounds(true);
    sharks.add(shark);
  }

  var swimbar = this.add.image(400, 550, 'swim-bar');
  swimbar.setScrollFactor(0);
  arrow = this.add.image(350, 531, 'arrow');
  arrow.setScrollFactor(0);

  this.physics.add.overlap(player, bubbleGroup, collectBubble, null, this);
  this.physics.add.overlap(player, sharks, sharkAttack, null, this);

  distanceText = this.add.text(350, 570, 'depth: 0 m', {
    fontSize: '12px',
    fill: '#fff'
  });
  distanceText.setScrollFactor(0);

  airText = this.add.text(400, 570, 'O2: ' + air, {
    fontSize: '12px',
    fill: '#fff'
  });
  airText.setScrollFactor(0);

  highScoreText = this.add.text(100, 570, 'record: 0 m', {
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
let airCapacity = 1000;
let air = airCapacity;
let maxArrowPosition = 450;
let minArrowPosition = 350;
let arrowPosition = 350;
let isArrowDirectionRight = true;
let maxX = 795;
let minX = 5;

function collectBubble(player, bubble) {
  bubble.disableBody(true, true);
  air += 500;
}

function sharkAttack(player, shark) {
  shark.disableBody(true, true);
  velocity = 0;
  player.setVelocityY(velocity);
  player.setTint(0xff0000);
  air -= 1000;
}

function moveSharks(shark) {
  if (shark.direction === 'left') {
    if (shark.x > minX) {
      shark.x -= 2;
    } else {
      shark.direction = 'right';
      shark.flipX = true;
    }
  } else {
    if (shark.x < maxX) {
      shark.x += 2;
    } else {
      shark.direction = 'left';
      shark.flipX = false;
    }
  }
}

function update() {
  airText.text = `air: ${air}`;
  if (air > 0) {
    air -= 1;
  } else {
    player.setVelocityY(0);
    player.anims.play('idle');
    return;
  }
  if (cursors.down.isDown) {
    swim();
    player.setVelocityY(velocity);
  }

  sharks.children.each(moveSharks);

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

  //bubbles.anims.play('bubble', true);
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
  distance = Math.round(player.y / 40);
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

  //check air boost
  if (distance >= airLimit && !hasAirBoost) {
    hasAirBoost = true;
    airLimit += 5;
  }
  if (player.y < 40) {
    if (hasAirBoost) {
      airCapacity += 200;
      hasAirBoost = false;
    }
    player.y = 40;
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
