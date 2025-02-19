class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.canJump = true;  // Variable pour empêcher le double saut
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
        // (Optionnel) Affiche un background
        this.bg = this.add.image(400, 300, 'bg');
        if (this.bg) this.bg.setScale(2);

        // Sol physique
        this.ground = this.physics.add.sprite(400, 580, 'ground');
        this.ground.setImmovable(true);
        this.ground.body.allowGravity = false;
        this.ground.setScale(2);
        this.ground.setOrigin(0.5, 1);

        // CZ Bike avec une hitbox ajustée
        this.czBike = this.physics.add.sprite(100, 400, 'czbike');
        this.czBike.setCollideWorldBounds(true);
        this.czBike.setScale(0.3);

        // Ajuste la hitbox du vélo (ex: réduit la hauteur)
        this.czBike.body.setSize(50, 60);
        this.czBike.body.setOffset(10, 10);

        // Collision CZ Bike <-> sol
        this.physics.add.collider(this.czBike, this.ground, () => {
            this.canJump = true; // On autorise un nouveau saut quand on touche le sol
        });

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Groupes
        this.obstacles = this.physics.add.group({ allowGravity: false });
        this.coins = this.physics.add.group({ allowGravity: false });

        // Collisions & overlaps
        this.physics.add.collider(this.czBike, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.czBike, this.coins, this.collectCoin, null, this);

        // Première apparition d'obstacle, puis enchaînement
        this.spawnObstacle();

        // Pièces toutes les 3 secondes
        this.time.addEvent({ delay: 3000, callback: this.spawnCoin, callbackScope: this, loop: true });

        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#FFF'
        });
    }

    update() {
        // Saut
        if (this.cursors.up.isDown && this.canJump) {
            this.czBike.setVelocityY(-600);  // Augmente la puissance du sau
