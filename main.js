// Configuration Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 500 }, debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player, cursors;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('cz_bike', 'assets/cz_bike.png');
    this.load.image('bear', 'assets/bear.png');
    this.load.image('rug', 'assets/rug.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('ground', 'assets/ground.png');
}

function create() {
    this.add.image(400, 300, 'ground');
    player = this.physics.add.sprite(100, 450, 'cz_bike').setScale(0.5);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
}
// ??
function update() {
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }
}
