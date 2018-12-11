import { util } from "../../util/lib";

let MAX_X   = 0;
let MAX_Y   = 0;
let orangeX = 0;
let orangeY = 0; 


class Canvas {
  constructor(id) {
    this.cvs = typeof id === 'string' ? document.getElementById(id) : id ;
    this.cvs.width  = MAX_X = this.cvs.clientWidth;
    this.cvs.height = MAX_Y = this.cvs.clientHeight;
    this.ctx = this.cvs.getContext('2d');
    this.ctx.translate(orangeX = util.getNum(MAX_X / 2), orangeY = util.getNum(MAX_X / 2));
  }

  drawImg(obj) {
    return new Promise(reslove => {
      let imgs = new Image();
      imgs.src = obj.url;
      imgs.onload = () => {
        if (obj.isNeedCut === true) this.ctx.drawImage(imgs, obj.left, obj.top, obj.spiritWidth, obj.spiritHeight, obj.x, obj.y, obj.width, obj.height);
        else this.ctx.drawImage(imgs, obj.x, obj.y, obj.width, obj.height);
        reslove();
      }
    })
  }

  write(str, size = '40px', y = 30, color = '#fff', x = util.getNum(MAX_X / 2)) {
    this.ctx.font = `${util.cleck_unit(size)} Microsoft Yahei`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(str, x, y);
  }

  /**
   * @param {number} x x轴位置
   * @param {number} y y轴位置
   * @param {number} w 宽 
   * @param {number} h 高
   * @param {number} radius 圆角
   * @param {string} color 颜色
   * @param {boolean} isFill 是否填充
   */
  drawRect({x, y, width, height, radius, color, isFill}) {
    return new Promise(reslove => {
      isFill = isFill ? 'fill' : 'stroke';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y+radius);
      this.ctx.lineTo(x, y+height-radius);
      this.ctx.quadraticCurveTo(x, y+height, x+radius, y+height);
      this.ctx.lineTo(x+width-radius, y+height);
      this.ctx.quadraticCurveTo(x+width, y+height, x+width, y+height-radius);
      this.ctx.lineTo(x+width, y+radius);
      this.ctx.quadraticCurveTo(x+width, y, x+width-radius, y);
      this.ctx.lineTo(x+radius, y);
      this.ctx.quadraticCurveTo(x, y, x, y+radius);
      this.ctx[isFill + 'Style'] = color || params.color;
      this.ctx.closePath();
      this.ctx[isFill]();
      reslove();
    })
  }

  clear() {
    this.ctx.clearRect(0 - orangeX, 0 - orangeY, MAX_X, MAX_Y);
  }
}

export {Canvas, MAX_X, MAX_Y, orangeX, orangeY};