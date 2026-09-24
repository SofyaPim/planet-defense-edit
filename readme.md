# проект в разработке
## https://sofyapim.github.io/planet-defense-edit/

Пошаговые инструкции для тестированияПошаговые инструкции
## Шаг 1 — Вынести Game в отдельный модуль
### 1. Создай файл scripts/game.js:
Скопируй в него дословно класс Game из script.js (строки 14–172), а сверху поставь импорты — но уже без ./scripts/, потому что файл лежит сам в scripts/:
```
import { Asteroid, Beetlemorph, Lobstermorph, Rhinomorph } from "./enemies.js";
import { Planet } from "./planet.js";
import { Projectile } from "./projectile.js";
import { Player } from "./player.js";
import { Handler } from "./handler.js";
import { UI } from "./ui.js";

export class Game {
  // ... дословно всё тело класса из script.js, без изменений
}
```
### 2. Упрости script.js до такого:

```
import { Game } from "./scripts/game.js";

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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
```
### 3. Проверь: открой index.html в браузере — игра должна запускаться как раньше, в консоли не должно быть ошибок (особенно Failed to resolve module).
## Шаг 2 — Установка Vitest
В папке planet-defense-edit выполни:
```
npm init -y
npm i -D vitest jsdom
```
В package.json замени секцию "scripts" на:
```
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```
И добавь поле (на той же уровне, что "scripts"):
```
"type": "module"
```
Создай файл .gitignore со содержимым:
```
node_modules/
```
## Шаг 3 — Конфиг Vitest
Создай vitest.config.js в корне проекта:
```
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
```
Проверка: создай пустой tests/smoke.test.js:
```
import { it, expect } from "vitest";
import { Planet } from "../scripts/planet.js";

it("smoke: модули импортируются", () => {
  expect(typeof Planet).toBe("function");
});
```
Запусти:
```
npm test
```
Должно пройти 1 тест. Если упал импорт — вернись к шагу 1.
## Шаг 4 — Мок игры для тестов
Создай tests/helpers.js — фабрика минимального объекта game:
```
export function makeGame(overrides = {}) {
  const game = {
    width: 800,
    height: 600,
    ratio: 1,
    baseHeight: 1000,
    debug: false,
    gameOver: false,
    score: 0,
    winningScore: 5,
    lives: 5,
    mouse: { x: 0, y: 0 },
    projectilePool: [],
    enemyPool: [],
    enemyTimer: 0,
    enemyInterval: 1200,
    spriteUpdate: false,
    spriteTimer: 0,
    spriteInterval: 150,
    ...overrides,
  };
  return game;
}
```
## Шаг 5 — Тесты
tests/aim.test.js — calcAim
Нужен реальный Game, но его конструктор трогает DOM и создаёт пулы. Поэтому тестируй метод через прототип, не создавая экземпляр:
```
import { it, expect } from "vitest";
import { Game } from "../scripts/game.js";

const calcAim = Game.prototype.calcAim;

it("направление от игрока к цели — единичный вектор", () => {
  const [aimX, aimY] = calcAim({ x: 0, y: 0 }, { x: 10, y: 0 });
  expect(aimX).toBeCloseTo(-1); // a к b: движемся влево
  expect(aimY).toBeCloseTo(0);
  expect(Math.hypot(aimX, aimY)).toBeCloseTo(1);
});

it("возвращает dx, dy между точками", () => {
  const [, , dx, dy] = calcAim({ x: 30, y: 40 }, { x: 0, y: 0 });
  expect(dx).toBe(30);
  expect(dy).toBe(40);
});
tests/collision.test.js — checkCollision
import { it, expect } from "vitest";
import { Game } from "../scripts/game.js";

const checkCollision = Game.prototype.checkCollision;

it("пересечение: центры ближе суммы радиусов", () => {
  expect(checkCollision({ x: 0, y: 0, radius: 10 }, { x: 15, y: 0, radius: 10 })).toBe(true);
});

it("касание ровно по сумме радиусов — ещё не столкновение", () => {
  expect(checkCollision({ x: 0, y: 0, radius: 10 }, { x: 20, y: 0, radius: 10 })).toBe(false);
});

it("далеко — нет столкновения", () => {
  expect(checkCollision({ x: 0, y: 0, radius: 10 }, { x: 100, y: 0, radius: 10 })).toBe(false);
});
tests/pools.test.js — пулы (через прототип + фейковый this)
import { it, expect } from "vitest";
import { Game } from "../scripts/game.js";
import { Projectile } from "../scripts/projectile.js";

it("createProjectilePool создаёт 25 снарядов", () => {
  const fake = { projectilePool: [], numberOfProjectiles: 25 };
  Game.prototype.createProjectilePool.call(fake);
  expect(fake.projectilePool).toHaveLength(25);
  expect(fake.projectilePool[0]).toBeInstanceOf(Projectile);
});

it("getProjectile возвращает свободный снаряд", () => {
  const p1 = { free: false };
  const p2 = { free: true };
  const fake = { projectilePool: [p1, p2] };
  expect(Game.prototype.getProjectile.call(fake)).toBe(p2);
});

it("getProjectile возвращает undefined, когда всё занято", () => {
  const fake = { projectilePool: [{ free: false }, { free: false }] };
  expect(Game.prototype.getProjectile.call(fake)).toBeUndefined();
});
tests/projectile.test.js
import { it, expect } from "vitest";
import { Projectile } from "../scripts/projectile.js";
import { makeGame } from "./helpers.js";

it("start активирует снаряд и задаёт скорость с учётом множителя", () => {
  const p = new Projectile(makeGame());
  p.start(100, 200, 1, 0);
  expect(p.free).toBe(false);
  expect(p.x).toBe(100);
  expect(p.speedX).toBe(5); // 1 * speedModifier
});

it("update двигает снаряд", () => {
  const p = new Projectile(makeGame());
  p.start(100, 100, 1, 0);
  p.update();
  expect(p.x).toBe(105);
});

it("снаряд за пределами экрана сбрасывается", () => {
  const p = new Projectile(makeGame());
  p.start(799, 100, 1, 0);
  p.update(); // x = 804 > width 800
  expect(p.free).toBe(true);
});

it("reset возвращает free = true", () => {
  const p = new Projectile(makeGame());
  p.start(0, 0, 1, 1);
  p.reset();
  expect(p.free).toBe(true);
});
tests/enemy.test.js
import { it, expect, vi, beforeEach } from "vitest";
import { Asteroid } from "../scripts/enemies.js";
import { makeGame } from "./helpers.js";

// jsdom: картинки в index.html нет — подставляем заглушку
beforeEach(() => {
  document.body.innerHTML = `<img id="asteroid">`;
  vi.spyOn(Math, "random").mockReturnValue(0.3);
});

it("hit уменьшает lives", () => {
  const game = makeGame();
  const e = new Asteroid(game);
  e.lives = 4;
  e.hit(1);
  expect(e.lives).toBe(3);
});

it("reset делает врага свободным", () => {
  const e = new Asteroid(makeGame());
  e.free = false;
  e.reset();
  expect(e.free).toBe(true);
});

it("start активирует врага и задаёт lives = maxLives", () => {
  const game = makeGame();
  game.planet = { x: 400, y: 300, radius: 100 };
  game.calcAim = GameCalcAimStub;
  const e = new Asteroid(makeGame());
  e.game.planet = { x: 400, y: 300 };
  e.start();
  expect(e.free).toBe(false);
  expect(e.lives).toBe(e.maxLives);
  expect(e.collided).toBe(false);
});
Для start нужен calcAim — проще всего в тесте подменить:
game.calcAim = () => [1, 0, -1, 0];
(вставь это вместо строки game.calcAim = GameCalcAimStub — там опечатка-заглушка, правильный вариант выше).
tests/win-lose.test.js — условия победы/поражения
Логика win/lose живёт внутри render, который рисует на канвасе. Тестируй условие отдельно, не вызывая render:
import { it, expect } from "vitest";
import { makeGame } from "./helpers.js";

function isGameOver(game) {
  return game.score >= game.winningScore || game.lives < 1;
}

it("победа при winningScore", () => {
  const g = makeGame({ score: 5, winningScore: 5 });
  expect(isGameOver(g)).toBe(true);
});

it("поражение при 0 жизней", () => {
  const g = makeGame({ lives: 0 });
  expect(isGameOver(g)).toBe(true);
});

it("игра продолжается", () => {
  const g = makeGame({ score: 4, lives: 1 });
  expect(isGameOver(g)).toBe(false);
});


```
Важно: это тест ожидаемого поведения (дубль условия из render). Он зафиксирует правило, но не свяжет его с кодом render — если кто-то поменяет условие в render, тест не упадёт. Полноценная проверка связи — уже e2e или вынос условия в отдельный метод (можно потом).
## Шаг 6 — Финальная проверка
```
npm test
```
Затем открой index.html — игра работает, консоль чистая.
Если коммитишь — в коммит попадают: scripts/game.js, изменённый script.js, package.json, package-lock.json, vitest.config.js, .gitignore, tests/. Страница на GitHub Pages не изменится (логика та же, index.html не трогали).
