export class Handler {
  constructor(game) {
    this.game = game;
    this.resetBtn = document.getElementById("resetBtn");
    this.fullScreenBtn = document.getElementById("fullScreenBtn");
    this.fullScreenHandler = (e) => {
      this.toggleFullScreen();
    };
    this.resetHandler = () => {
      this.game.restart();
    };

    // listeners
    this.fullScreenBtn.addEventListener("click", this.fullScreenHandler);
    this.resetBtn.addEventListener("click", this.resetHandler);
    window.addEventListener("resize", () => this.game.resize(window.innerWidth, window.innerHeight));
    window.addEventListener("mousemove", (e) => {
      this.game.mouse.x = e.offsetX;
      this.game.mouse.y = e.offsetY;
    });
    window.addEventListener("mousedown", (e) => {
      this.game.mouse.x = e.offsetX;
      this.game.mouse.y = e.offsetY;
      this.game.player.shoot();
    });
    window.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.game.mouse.x = touch.clientX;
      this.game.mouse.y = touch.clientY;
      this.game.player.shoot();
    }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.game.mouse.x = touch.clientX;
      this.game.mouse.y = touch.clientY;
    }, { passive: false });
    window.addEventListener("keyup", (e) => {
      if (e.key === "d") this.game.debug = !this.game.debug;
      else if (e.key === "1") this.game.player.shoot();
    });
  }
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  }
}
