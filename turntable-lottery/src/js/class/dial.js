import { Script } from "./lib/script";
import { MAX_X, MAX_Y, orangeX, orangeY } from "./lib/canvas";
import { util } from "../util/lib";
class bg extends Script {
  constructor() {
    super('dial-bg', 'img', {
      url: require('./../../img/script.png'),
      width:        MAX_X,
      height:       MAX_X,
      isNeedCut:    true,
      x:            util.getNum(0 - orangeX),
      y:            util.getNum(0 - orangeY),
      spiritWidth:  732,
      spiritHeight: 732,
      top:          0,
      left:         605
    }, 0);
  }
}

class pan extends Script {
  constructor() {
    super('dial-md', 'img', {
      url: require('./../../img/script.png'),
      width: util.getNum(MAX_X * 0.85),
      height: util.getNum(MAX_X * 0.85),
      isNeedCut: true,
      x: util.getNum(MAX_X * 0.075 - orangeX),
      y: util.getNum(MAX_X * 0.075 - orangeY),
      spiritWidth:  605,
      spiritHeight: 605,
      top:          0,
      left:         0
    }, 1);
  }
}

export class Dial {
  constructor() {
    this.bg = new bg();
    this.top = new pan();
  }
}