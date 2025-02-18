import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('ground', 'assets/ground.png');
        this.load.image('czbike', 'assets/czbike.png');
        this.load.image('bear', 'assets/bear.png');
        this.load.image('rug', 'assets/rug.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        this.ground = this.add.tileSprite(400, 550, 800, 100, 'ground');
        this.czBike = this.physics.add.sprite(100, 450, 'czbike').setScale(0.5);
        this.czBike.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        this.time.addEvent({ delay: 2000, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1500, callback: this.spawnCoin, callbackScope: this, loop: true });

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
        if (this.cursors.up.isDown && this.czBike.body.touching.down) {
            this.czBike.setVelocityY(-300);
        }

        this.ground.tilePositionX += 5;

        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -obstacle.width) {
                obstacle.destroy();
            }
        });

        this.coins.getChildren().forEach(coin => {
            if (coin.x < -coin.width) {
                coin.destroy();
            }
        });
    }

    spawnObstacle() {
        const x = 800;
        const y = 500;
        const obstacleType = Math.random() > 0.5 ? 'bear' : 'rug';
        let obstacle = this.obstacles.create(x, y, obstacleType);
        obstacle.setVelocityX(-200);
    }

    spawnCoin() {
        const x = 800;
        const y = Phaser.Math.Between(300, 500);
        let coin = this.coins.create(x, y, 'coin');
        coin.setVelocityX(-200);
    }

    hitObstacle(czBike, obstacle) {
        this.physics.pause();
        czBike.setTint(0xff0000);
        this.gameOver();
    }

    collectCoin(czBike, coin) {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    gameOver() {
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#FF0000' }).setOrigin(0.5);
        this.time.addEvent({ delay: 2000, callback: () => { this.scene.restart(); }, callbackScope: this, loop: false });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
