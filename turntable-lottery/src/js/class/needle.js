import { Script } from "./lib/script";
import { MAX_X, orangeX, orangeY } from "./lib/canvas";
import { util } from "../util/lib";

export class Needle extends Script {
  constructor() {
    const h = util.getNum(MAX_X * 0.45);
    super('needle', 'img', {
      url: require('./../../img/script.png'),
      width: util.getNum(h * 0.093),
      height: h,
      x: util.getNum(MAX_X / 2 - h * 0.093 / 2 - orangeX),
      y: util.getNum(MAX_X * 0.13 - orangeY),
      isNeedCut: true,
      spiritWidth:  22,
      spiritHeight: 235,
      top:          0,
      left:         1337
    }, 3);
  }
}