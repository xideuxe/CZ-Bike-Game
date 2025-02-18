class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // (Optionnel) background
        this.load.image('bg', 'assets/background.png');

        // Sol
        this.load.image('ground', 'assets/ground.png');

        // CZ Bike (statique)
        this.load.image('czbike', 'assets/czbike.png');

        // Obstacles & pièces
        this.load.image('bear', 'assets/bear.png');
        this.load.image('rug', 'assets/rug.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        // (Optionnel) Affiche un background
        this.bg = this.add.image(400, 300, 'bg');
        this.bg.setScale(2);

        // Sol physique
        this.ground = this.physics.add.sprite(400, 580, 'ground');
        this.ground.setImmovable(true);
        this.ground.body.allowGravity = false;
        this.ground.setScale(2);
        this.ground.setOrigin(0.5, 1);

        // CZ Bike
        this.czBike = this.physics.add.sprite(100, 450, 'czbike');
        this.czBike.setCollideWorldBounds(true);
        this.czBike.setScale(0.3);

        // Collision CZ Bike <-> sol
        this.physics.add.collider(this.czBike, this.ground);

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Groupes
        this.obstacles = this.physics.add.group({ allowGravity: false }); 
        this.coins = this.physics.add.group({ allowGravity: false });

        // Collisions & overlaps
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // Timers
        this.time.addEvent({ delay: 2000, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 2000, callback: this.spawnCoin, callbackScope: this, loop: true });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#FFF'
        });
    }

    update() {
        // Saut (flèche haut)
        if (this.cursors.up.isDown && this.czBike.body.touching.down) {
            // On augmente l'impulsion de saut pour que ce soit plus visible
            this.czBike.setVelocityY(-500);
            console.log('Saut !'); // Vérifie la console pour voir si c’est déclenché
        }

        // Se baisser (flèche bas)
        if (this.cursors.down.isDown) {
            // On force le vélo à descendre plus vite
            this.czBike.setVelocityY(300);
        }

        // Nettoyage hors écran
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
        // Ours ou tapis volant
        const x = 900;
        const isBear = Math.random() > 0.5;
        const y = isBear ? 520 : 370;
        let obstacle = this.obstacles.create(x, y, isBear ? 'bear' : 'rug');
        // On rétrécit un peu plus, pour être sûr
        obstacle.setScale(isBear ? 0.2 : 0.3);
        obstacle.setVelocityX(-200);
        obstacle.setCollideWorldBounds(false);
    }

    spawnCoin() {
        const x = 900;
        const y = 520;  // Au sol (si tu veux qu’elles soient en l’air, change la valeur)
        let coin = this.coins.create(x, y, 'coin');
        // Encore plus petit
        coin.setScale(0.1);
        coin.setVelocityX(-200);
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

        // Restart après 2s
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
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
