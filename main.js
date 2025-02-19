class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.canJump = true;  // Variable pour empêcher les sauts en l'air
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('czbike', 'assets/czbike.png');
        this.load.image('bear', 'assets/bear.png');
        this.load.image('rug', 'assets/rug.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        // ✅ Ajout du background
        this.bg = this.add.image(400, 300, 'bg').setScale(2);

        // ✅ Correction de la position du sol
        this.ground = this.physics.add.staticSprite(400, 600, 'ground').setScale(2);

        // ✅ Ajustement du placement du vélo
        this.czBike = this.physics.add.sprite(100, 500, 'czbike').setScale(0.3);
        this.czBike.setCollideWorldBounds(true);

        // ✅ Réduction de la hitbox du vélo
        this.czBike.body.setSize(50, 50);
        this.czBike.body.setOffset(10, 10);

        // ✅ Activation des collisions avec le sol
        this.physics.add.collider(this.czBike, this.ground, () => {
            this.canJump = true;
        });

        // ✅ Contrôles clavier
        this.cursors = this.input.keyboard.createCursorKeys();

        // ✅ Groupes pour obstacles et pièces
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // ✅ Gestion des collisions
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // ✅ Apparition des obstacles
        this.spawnObstacle();
        this.time.addEvent({ delay: 3000, callback: this.spawnCoin, callbackScope: this, loop: true });

        // ✅ Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
        // ✅ Saut ajusté
        if (this.cursors.up.isDown && this.canJump) {
            this.czBike.setVelocityY(-500);
            this.canJump = false;
        }

        // ✅ Se baisser (en changeant la hitbox)
        if (this.cursors.down.isDown && this.czBike.body.touching.down) {
            this.czBike.body.setSize(50, 30);  // Réduit la hitbox en se baissant
        } else {
            this.czBike.body.setSize(50, 50);
        }

        // ✅ Nettoyage des éléments hors écran
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -obstacle.displayWidth) obstacle.destroy();
        });

        this.coins.getChildren().forEach(coin => {
            if (coin.x < -coin.displayWidth) coin.destroy();
        });
    }

    spawnObstacle() {
        let delay = Phaser.Math.Between(3000, 5000);
        this.time.addEvent({ delay: delay, callback: this.spawnObstacle, callbackScope: this });

        const x = 900;
        const isBear = Math.random() > 0.5;
        const y = isBear ? 520 : 270;
        const key = isBear ? 'bear' : 'rug';

        let obstacle = this.obstacles.create(x, y, key);
        obstacle.setScale(isBear ? 0.2 : 0.3).setVelocityX(-200);

        // ✅ Ajustement des hitboxes
        if (isBear) {
            obstacle.body.setSize(40, 80);
            obstacle.body.setOffset(10, 0);
        } else {
            obstacle.body.setSize(100, 30);
            obstacle.body.setOffset(0, 10);
        }
    }

    spawnCoin() {
        const x = 900;
        const y = 520;
        let coin = this.coins.create(x, y, 'coin').setScale(0.05).setVelocityX(-200);
    }

    hitObstacle(czBike, obstacle) {
        this.physics.pause();
        czBike.setTint(0xff0000);

        let message = obstacle.texture.key === 'bear' ? 'Bear Market' : 'Rug!';
        this.add.text(400, 300, message, { fontSize: '64px', fill: '#FF0000' }).setOrigin(0.5);

        this.time.addEvent({ delay: 2000, callback: () => this.scene.restart(), callbackScope: this });
    }

    collectCoin(czBike, coin) {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 500 }, debug: true } },
    scene: GameScene
};

const game = new Phaser.Game(config);
