/**
 * @author wws <15123090305@163.com>
 * @todo 待完善
 */
class Util {
  constructor() {}
  /**
   * @description 个性打印
   * @param {string} things 将打印的内容
   * @param {string} color 字体与字体阴影颜色，需要rgb色，目前有cyan，primay，error，warn，dark，success几种默认色
   * @param {string} size 字体大小，默认为2em
   * @param {string} img  图片地址
   * @param {string} paddingLeft 左侧留白
   */
  log(things, color, size = '2em', img, paddingLeft) {
    const config = [
      {desc: 'cyan', color: '96, 125, 139'},
      {desc: 'primay', color: '3, 169, 244'},
      {desc: 'error', color: '255, 70, 70'},
      {desc: 'warn', color: '255, 87, 34'},
      {desc: 'dark', color: '63, 81, 183'},
      {desc: 'success', color: '76, 175, 80'}
    ];
    const Group = config.filter(m => m.desc === color)
    let val = color;
    if (Group.length !== 0) {
      val = Group[0].color;
    }
    console.log(
      `%c ${things}`, `
      text-shadow:
      0 0 5px rgba(${val},.1), 0 1px 3px rgba(${val},.15),
      0 3px 5px rgba(${val},.2), 0 5px 10px rgba(${val},.3),
      0 10px 10px rgba(${val},.2), 0 20px 20px rgba(${val},.15);
      font-size:${size};font-weight:bold;color:rgba(${val}, 1);
      padding-left:${paddingLeft};
      background:url('${img}') no-repeat;
      background-size:contain;
      `
    );
  }

  Format(fmt) { 
    const o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))};
    for (var k in o) {if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))};
    return fmt;
  }

  getNum(Str,isFilter) {
　　//用来判断是否把连续的0去掉
    isFilter = isFilter || false;
    if (typeof Str === "string") {
      // var arr = Str.match(/(0\d{2,})|([1-9]\d+)/g);
      //"/[1-9]\d{1,}/g",表示匹配1到9,一位数以上的数字(不包括一位数).
      //"/\d{2,}/g",  表示匹配至少二个数字至多无穷位数字
      var arr = Str.match( isFilter ? /[1-9]\d{1,}/g : /\d{2,}/g);
      return arr.map(function (item) {
        //转换为整数，
        //但是提取出来的数字，如果是连续的多个0会被改为一个0，如000---->0，
        //或者0开头的连续非零数字，比如015，会被改为15，这是一个坑
        // return parseInt(item);
        //字符串，连续的多个0也会存在，不会被去掉
        return item;
      });
    } else { return []; }
  }

  cleck_unit(str) {       //将rem转为px
    if (typeof str === 'number') {
      return str;
    };
    let key = str.replace(parseFloat(str), '');
    switch (key) {
      case 'rem':
        str = parseFloat(str) * parseFloat(document.getElementsByTagName('html')[0].style.fontSize);
        break;
      case 'px':
        str = parseFloat(str);
        break;
    };
    return `${str}px`;
  };
  /**@description 升序排序 */
  compareUp(arr, propertyName) {
    if ((typeof arr[0][propertyName]) != "number") { // 属性值为非数字
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1.localeCompare(value2);
      }
    }
    else {
      return function(object1, object2) { // 属性值为数字
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value1 - value2;
      }
    }
  };

  /**@description 降序排序 */
  compareDown(arr, propertyName) {
    if ((typeof arr[0][propertyName]) != "number") { // 属性值为非数字
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value2.localeCompare(value1);
      }
    }
    else {
      return function(object1, object2) { // 属性值为数字
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        return value2 - value1;
      }
    };
  }

  /**@description 取整 */
  getNum(num) {
    let rounded = 0;
    rounded = (0.5 + num) | 0;
    rounded = ~~ (0.5 + num);
    rounded = (0.5 + num) << 0;
    return rounded;
  }
}

export const util = new Util();
