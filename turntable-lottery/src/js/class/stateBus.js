import { Dial } from "./dial";
import { Needle } from "./needle";
import { Pool, Script } from "./lib/script";

export class StateBus {
  constructor() {
    this.dial = new Dial();
    this.needle = new Needle();
    this.$pool = Pool;
    this.speed = 1;
    this.state = true;
    console.log(this);
  }

  render() {
    Script.render();
  }

  startGame() {
    this.needle.setAngle(this.needle.angle + this.speed);
    Script.render();

    if (this.state) {
      setTimeout(() => {
        this.startGame();
      }, 1000 / 60);
    }
  }
}