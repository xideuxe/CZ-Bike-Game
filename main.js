class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.canJump = true;  // Variable pour gérer le saut
    }

    preload() {
        // (Optionnel) background
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
        // ✅ Ajoute un background
        this.bg = this.add.image(400, 300, 'bg');
        if (this.bg) this.bg.setScale(2);

        // ✅ Création du sol en tant qu'objet statique
        this.ground = this.physics.add.staticGroup();
        let groundSprite = this.ground.create(400, 580, 'ground');  // 580 = bien au sol
        groundSprite.setScale(2).refreshBody(); // Ajuste la taille

        // ✅ Création du vélo bien positionné
        this.czBike = this.physics.add.sprite(100, 500, 'czbike');  // 500 pour qu'il repose bien sur le sol
        this.czBike.setCollideWorldBounds(true);
        this.czBike.setScale(0.3);

        // ✅ Ajout d'une hitbox plus petite
        this.czBike.body.setSize(50, 50);
        this.czBike.body.setOffset(10, 10);

        // ✅ Collision du vélo avec le sol
        this.physics.add.collider(this.czBike, this.ground, () => {
            this.canJump = true; // Réactive le saut après avoir touché le sol
        });

        // ✅ Gestion des contrôles
        this.cursors = this.input.keyboard.createCursorKeys();

        // ✅ Groupes pour obstacles et pièces
        this.obstacles = this.physics.add.group({ allowGravity: false });
        this.coins = this.physics.add.group({ allowGravity: false });

        // ✅ Collisions & interactions
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // ✅ Premiers spawns
        this.spawnObstacle();
        this.time.addEvent({ delay: 3000, callback: this.spawnCoin, callbackScope: this, loop: true });

        // ✅ Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#FFF'
        });
    }

    update() {
        // ✅ Correction du saut (le joueur peut sauter uniquement s'il touche le sol)
        if (this.cursors.up.isDown && this.canJump) {
            this.czBike.setVelocityY(-500);
            this.canJump = false;
        }

        // ✅ Réactive le saut quand il retouche le sol
        if (this.czBike.body.touching.down) {
            this.canJump = true;
        }

        // ✅ Nettoyage des obstacles et pièces hors écran
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
        // ✅ Délai entre 2.5s et 4.5s
        let delay = Phaser.Math.Between(2500, 4500);
        this.time.addEvent({
            delay: delay,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: false
        });

        // ✅ Position et type d'obstacle
        const x = 900;
        const isBear = Math.random() > 0.5;
        const y = 520; // Tous les obstacles sont au sol désormais
        const key = isBear ? 'bear' : 'rug';

        let obstacle = this.obstacles.create(x, y, key);
        obstacle.setScale(isBear ? 0.2 : 0.3);
        obstacle.setVelocityX(-300); // ✅ Accélération des obstacles
        obstacle.setCollideWorldBounds(false);

        // ✅ Ajustement des hitboxes
        if (isBear) {
            obstacle.body.setSize(40, 80);  // Ours → rectangle vertical
            obstacle.body.setOffset(10, 0);
        } else {
            obstacle.body.setSize(100, 30);  // Tapis → rectangle horizontal
            obstacle.body.setOffset(0, 10);
        }
    }

    spawnCoin() {
        const x = 900;
        const y = 520; // Pièce au sol
        let coin = this.coins.create(x, y, 'coin');
        coin.setScale(0.05); // ✅ Pièce plus petite
        coin.setVelocityX(-300); // ✅ Accélération des pièces
        coin.setCollideWorldBounds(false);
    }

    hitObstacle(czBike, obstacle) {
        this.physics.pause();
        czBike.setTint(0xff0000);

        let message = obstacle.texture.key === 'bear' ? 'Bear Market' : 'Rug!';
        this.add.text(400, 300, message, {
            fontSize: '64px',
            fill: '#FF0000'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.scene.restart();
            },
            callbackScope: this,
            loop: false
        });
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
        arcade: { gravity: { y: 500 }, debug: true }  // ✅ Debug activé pour voir les hitboxes
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
