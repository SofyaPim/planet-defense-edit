import { Asteroid, Beetlemorph, Lobstermorph, Rhinomorph } from "./scripts/enemies.js";
import { Planet } from "./scripts/planet.js";
import { Projectile } from "./scripts/projectile.js";
import { Player } from "./scripts/player.js";
import { Handler } from "./scripts/handler.js";
import { UI } from "./scripts/ui.js";

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.baseHeight = 1000;
      this.ratio = this.height / this.baseHeight;
      this.smallFont;
      this.largeFont;

      this.planet = new Planet(this);
      this.player = new Player(this);
      this.handler = new Handler(this);
      this.ui = new UI(this);
      this.debug = true;
      this.gameOver = true;

      this.projectilePool = [];
      this.numberOfProjectiles = 25;
      this.createProjectilePool();

      this.enemyPool = [];
      this.numberOfEnemies = 10;
      this.createEnemyPool();
      this.enemyPool[0].start();
      this.enemyTimer = 0;
      this.enemyInterval = 1200;

      this.spriteUpdate = false;
      this.spriteTimer = 0;
      this.spriteInterval = 150;

      this.score = 0;
      this.winningScore = 5;
      this.lives = 5;
      this.resize(window.innerWidth, window.innerHeight);
      this.mouse = {
        x: 0,
        y: 0,
      };
    }
    restart() {
          


      this.score = 0;
      this.winningScore = 5;
      this.lives = 5;
      this.gameOver = false;

      this.spriteUpdate = false;
      this.spriteTimer = 0;
      this.enemyPool.forEach((enemy) => {
        enemy.restart();
      });
    }
    resize(width, height) {
      this.ratio = this.height / this.baseHeight;
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.smallFont = Math.ceil(24 * this.ratio);
      this.largeFont = Math.ceil(50 * this.ratio);

      this.planet.resize();
      this.player.resize();

      this.enemyPool.forEach((enemy) => {
        enemy.resize();
      });
    }

    render(context, delaTime) {
      
      this.planet.draw(context);
      this.player.draw(context);
      this.player.update();
      this.projectilePool.forEach((projectile) => {
        projectile.draw(context);
        projectile.update();
      });
      this.enemyPool.forEach((enemy) => {
        enemy.draw(context);
        enemy.update();
      });
      //  periodically activate an enemy
      if (!this.gameOver) {
        if (this.enemyTimer < this.enemyInterval) {
          this.enemyTimer += delaTime;
        } else {
          this.enemyTimer = 0;
          const enemy = this.getEnemy();
          if (enemy) enemy.start();
        }
      }
      // periodically update sprites
      if (this.spriteTimer < this.spriteInterval) {
        this.spriteTimer += delaTime;
        this.spriteUpdate = false;
      } else {
        this.spriteTimer = 0;
        this.spriteUpdate = true;
      }
      // win/lose condition
      if (this.score >= this.winningScore || this.lives < 1) {
        this.gameOver = true;
      }
        this.ui.draw(context);
      if (this.gameOver) {
        this.ui.drawGameStatus(context);
      }
    }

    calcAim(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      const aimX = (dx / distance) * -1;
      const aimY = (dy / distance) * -1;
      return [aimX, aimY, dx, dy];
    }
    checkCollision(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      const sumOfRadii = a.radius + b.radius;
      return distance < sumOfRadii;
    }
    createProjectilePool() {
      for (let i = 0; i < this.numberOfProjectiles; i++) {
        this.projectilePool.push(new Projectile(this));
      }
    }
    getProjectile() {
      for (let i = 0; i < this.projectilePool.length; i++) {
        if (this.projectilePool[i].free) return this.projectilePool[i];
      }
    }
    createEnemyPool() {
      for (let i = 0; i < this.numberOfEnemies; i++) {
        let randomNumber = Math.random();
        if (randomNumber < 0.25) {
          this.enemyPool.push(new Asteroid(this));
        } else if (randomNumber < 0.5) {
          this.enemyPool.push(new Beetlemorph(this));
        } else if (randomNumber < 0.75) {
          this.enemyPool.push(new Rhinomorph(this));
        } else {
          this.enemyPool.push(new Lobstermorph(this));
        }
      }
    }
    getEnemy() {
      for (let i = 0; i < this.enemyPool.length; i++) {
        if (this.enemyPool[i].free) return this.enemyPool[i];
      }
    }
  }

  const game = new Game(canvas);

  let lastTime = 0;
  function animate(timeStamp) {
    const delaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, delaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
// test