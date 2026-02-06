export class UI {
  constructor(game) {
    this.game = game;
    this.message1;
    this.message2;
  }
  draw(context) {
    context.save();
    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.font = this.game.smallFont + "px Impact";
    context.fillText("Score " + this.game.score, this.game.smallFont, this.game.smallFont);
    for (let i = 0; i < this.game.lives; i++) {
      context.fillRect(this.game.smallFont + 15 * i, this.game.largeFont, 10, this.game.smallFont);
    }
    context.restore();
  }
  drawGameStatus(context) {
    context.save();
   
    context.textAlign = "center";
    context.fillStyle = "white";

    if (this.game.score >= this.game.winningScore ) {
      this.message1 = "You win!";
      this.message2 = `Your score is ${this.game.score}. Play again press  R`;
    } else if (this.game.lives <= 0 ) {
      this.message1 = "You lose!";
      this.message2 = "Try again press R";
    } else {
      this.message1 = "Lets play!";
      this.message2 = "Press R to start!";
    }
    context.font = this.game.largeFont + "px Impact";
    context.fillText(this.message1, this.game.width * 0.5, this.game.height * 0.33);
    context.font = this.game.smallFont + "px Impact";
    context.fillText(this.message2, this.game.width * 0.5, this.game.height * 0.65);
    context.restore();
   
    
  }
}
