class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // (Optionnel) Image de fond
        this.load.image('bg', 'assets/background.png');

        // Sol
        this.load.image('ground', 'assets/ground.png');

        // CZ Bike en image statique
        this.load.image('czbike', 'assets/czbike.png');

        // Obstacles & pièces
        this.load.image('bear', 'assets/bear.png');
        this.load.image('rug', 'assets/rug.png');
        this.load.image('coin', 'assets/coin.png');
    }

    create() {
        // (Optionnel) Affiche un fond
        // Ajuste .setScale(...) si l'image est trop petite
        this.bg = this.add.image(400, 300, 'bg');
        this.bg.setScale(2); 

        // Créer un sol physique pour le personnage
        // On place le sprite vers le bas (580) et on l'agrandit
        this.ground = this.physics.add.sprite(400, 580, 'ground');
        this.ground.setImmovable(true);   // Ne bouge pas sous l'impact
        this.ground.body.allowGravity = false;
        this.ground.setScale(2);         // Agrandir le sol
        this.ground.setOrigin(0.5, 1);   // Origine en bas au centre (facilite le positionnement)

        // CZ Bike
        this.czBike = this.physics.add.sprite(100, 450, 'czbike');
        this.czBike.setCollideWorldBounds(true);
        this.czBike.setScale(0.3);       // Réduit la taille de CZ Bike

        // Collision entre CZ Bike et le sol
        this.physics.add.collider(this.czBike, this.ground);

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Groupes d'obstacles et de pièces
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // Collisions & overlaps
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // Timers pour spawn obstacles et pièces
        this.time.addEvent({ delay: 2000, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1500, callback: this.spawnCoin, callbackScope: this, loop: true });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#FFF'
        });
    }

    update() {
        // Saut quand la flèche haut est enfoncée et qu'on est sur le sol
        if (this.cursors.up.isDown && this.czBike.body.touching.down) {
            this.czBike.setVelocityY(-300);
        }

        // (Facultatif) Se baisser
        if (this.cursors.down.isDown) {
            // exemple : on peut descendre un peu plus vite
            this.czBike.setVelocityY(200);
        }

        // On détruit les obstacles hors écran
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -obstacle.width) {
                obstacle.destroy();
            }
        });

        // Idem pour les pièces
        this.coins.getChildren().forEach(coin => {
            if (coin.x < -coin.width) {
                coin.destroy();
            }
        });
    }

    spawnObstacle() {
        // Ours ou tapis volant
        const x = 900; // spawn légèrement hors écran
        const isBear = Math.random() > 0.5;
        // On place l'ours au sol, le tapis en l'air
        const y = isBear ? 520 : 350;

        let obstacle = this.obstacles.create(x, y, isBear ? 'bear' : 'rug');

        // Échelle pour éviter qu'ils soient trop grands
        obstacle.setScale(0.3);

        // Vitesse vers la gauche
        obstacle.setVelocityX(-200);
    }

    spawnCoin() {
        const x = 900;
        const y = Phaser.Math.Between(300, 500);

        let coin = this.coins.create(x, y, 'coin');
        coin.setScale(0.3); // réduire la pièce
        coin.setVelocityX(-200);
    }

    hitObstacle(czBike, obstacle) {
        // Game Over
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
    width: 800,    // Largeur du canvas
    height: 600,   // Hauteur du canvas
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
