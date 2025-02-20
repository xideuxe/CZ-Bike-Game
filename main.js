class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.canJump = true;  // Gestion du saut
    }

    preload() {
        // Background
        this.load.image('bg', 'assets/background.png');

        // Sol
        this.load.image('ground', 'assets/ground.png');

        // CZ Bike
        this.load.image('czbike', 'assets/czbike.png');

        // Obstacles & pièces
        this.load.image('bear', 'assets/bear.png');
        this.load.image('rug', 'assets/rug.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        // **Ajout du background**
        this.bg = this.add.image(400, 300, 'bg');
        if (this.bg) this.bg.setScale(2);

        // **Sol physique + scrolling**
        this.ground = this.add.tileSprite(400, 580, 800, 100, 'ground');
        this.physics.add.existing(this.ground, true);

        // **CZ Bike**
        this.czBike = this.physics.add.sprite(100, 450, 'czbike');
        this.czBike.setCollideWorldBounds(true);
        this.czBike.setScale(0.3);

        // **Collision CZ Bike <-> sol**
        this.physics.add.collider(this.czBike, this.ground, () => {
            this.canJump = true; // ✅ On autorise le saut uniquement si le vélo touche bien le sol
        });

        // **Contrôles**
        this.cursors = this.input.keyboard.createCursorKeys();

        // **Groupes pour les obstacles et pièces**
        this.obstacles = this.physics.add.group({ allowGravity: false });
        this.coins = this.physics.add.group({ allowGravity: false });

        // **Collisions & overlaps**
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // **Apparition des obstacles et pièces**
        this.spawnObstacle();
        this.time.addEvent({ delay: 3000, callback: this.spawnCoin, callbackScope: this, loop: true });

        // **Score**
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
        // **Fait défiler le sol**
        this.ground.tilePositionX += 5;

        // **Vérification du saut**
        if (this.cursors.up.isDown && this.czBike.body.blocked.down) {
            this.czBike.setVelocityY(-500);
            this.canJump = false;
        }

        // **Se baisser**
        if (this.cursors.down.isDown && this.czBike.body.blocked.down) {
            this.czBike.y = 480;
        } else if (this.czBike.body.blocked.down) {
            this.czBike.y = 450;
        }

        // **Nettoyage hors écran**
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -obstacle.displayWidth) {
                obstacle.destroy();
            }
        });
        this.coins.getChildren().forEach(coin => {
            if (coin.x < -coin.displayWidth) {
                coin.destroy();
            }
        });
    }

    spawnObstacle() {
        // **Délai entre 2s et 4s pour plus de variation**
        let delay = Phaser.Math.Between(2000, 4000);
        this.time.addEvent({ delay: delay, callback: this.spawnObstacle, callbackScope: this, loop: false });

        const x = 900;
        const y = 520;  // ✅ Tous les obstacles sont au sol
        const key = Math.random() > 0.5 ? 'bear' : 'rug';

        let obstacle = this.obstacles.create(x, y, key);
        obstacle.setScale(0.2);
        obstacle.setVelocityX(-300);  // ✅ Augmentation de la vitesse de déplacement
        obstacle.setCollideWorldBounds(false);
    }

    spawnCoin() {
        const x = 900;
        const y = 500; // ✅ Pièces légèrement au-dessus du sol
        let coin = this.coins.create(x, y, 'coin');
        coin.setScale(0.05); // Pièce plus petite
        coin.setVelocityX(-300);  // ✅ Augmentation de la vitesse des pièces
        coin.setCollideWorldBounds(false);
    }

    hitObstacle(czBike, obstacle) {
        this.physics.pause();
        czBike.setTint(0xff0000);

        let message = obstacle.texture.key === 'bear' ? 'Bear Market' : 'Rug!';
        this.add.text(400, 300, message, { fontSize: '64px', fill: '#FF0000' }).setOrigin(0.5);

        this.time.addEvent({ delay: 2000, callback: () => { this.scene.restart(); }, callbackScope: this, loop: false });
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
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 500 }, debug: true }  // Debug activé pour voir les hitboxes
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
