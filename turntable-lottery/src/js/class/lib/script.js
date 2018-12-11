import { Canvas, MAX_X, MAX_Y, orangeX, orangeY } from "../lib/canvas";
import { SHA1 } from "crypto-js";
import { util } from "../../util/lib";

// 创建临时canvas
let _dom = document.createElement('canvas');
_dom.style.zIndex = -1;
document.body.appendChild(_dom);
// 精灵编号
let key = 0;

const realCvs = new Canvas('cvs');
const lieCvs  = new Canvas(_dom);
let Pool = [];
const scriptTypeConfig = [
  {type: 'img', foo: 'drawImg'},
  {type: 'rect', foo: 'drawRect'}
]


/**@description 精灵类*/
class Script {
  /**
   * @param {*String} name 精灵名 
   * @param {*String} type 精灵类型--img/rect/round/font 
   * @param {*Object} attrs 精灵绘制所需属性，具体看canvas.js
   * @param {*Number} sort 层级 默认为0 
   */
  constructor(name, type, attrs, sort = 0) {
    this.id = key = SHA1(new Date().getTime() + key).toString();
    this.name = name;
    this.type = type;
    this.attrs = Object.assign({angle: 0}, attrs);
    this.sort = sort;
    Pool.push(this);
    Script.$sort('sort');
  }

  /**
   * @desc 按类型绘制精灵，绘制完成后进行回调方便绘制下一个精灵
   */
  render() {
    return new Promise(reslove => {
      lieCvs.ctx.save();
      // 计算弧度
      lieCvs.ctx.rotate(this.angle * Math.PI / 180);
      const __ = scriptTypeConfig.filter(m => m.type === this.type)[0].foo; 
      lieCvs[__](this.attrs).then(() => {
        lieCvs.ctx.restore();
        reslove();
      });

      // realCvs.ctx.save();
      // // 计算弧度
      // realCvs.ctx.rotate(this.angle * Math.PI / 180);
      // const __ = scriptTypeConfig.filter(m => m.type === this.type)[0].foo; 
      // realCvs[__](this.attrs).then(() => {
      //   realCvs.ctx.restore();
      //   reslove();
      // });
    });
  }

  /**
   * @description 将数组进行排序 方便按层级进行绘制
   * @param {*String} prototypeName 需要排序的属性名 
   */
  static $sort(prototypeName) {
    Pool.sort(util.compareUp(Pool, prototypeName));
  }

  /**
   * @desc 这是一个绘制函数，已实现的功能：按层级进行绘制及双缓冲解决闪屏问题
   * @description 双缓存，即使用临时canvas完成绘制，再输出为图片一次性绘制到画布上，可有效解决闪屏问题, 参考链接【https://www.cnblogs.com/axes/p/3567364.html】
   * @description 问题二： 绘制顺序问题，由于每次绘制的图片大小不尽相同，所以需要确认底层图片绘制完成后才绘制上一层，这里使用了Promise,具体可看【https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/0014345008539155e93fc16046d4bb7854943814c4f9dc2000】
   */
  static render() {
    lieCvs.clear();
    const run = __ => {
      Pool[__].render().then(() => {
        if (__ < Pool.length - 1) run(__ + 1);
        else {
          realCvs.clear();
          // 此处为双缓存解决方案
          const url = lieCvs.cvs.toDataURL('image/png');
          realCvs.drawImg({
            url: url,
            width: MAX_X,
            height: MAX_Y,
            isNeedCut: false,
            x: 0 - orangeX,
            y: 0 - orangeY
          });
          // 此处用于比对
          // realCvs.drawImg(_dom, 0 - orangeX, 0 - orangeY, MAX_X, MAX_Y);
        }
      });
    };
    run(0);
  }

  setAngle(angle) {
    this.attrs.angle = angle;
  }

  get angle() {
    return this.attrs.angle;
  }
}

export { Script, Pool }