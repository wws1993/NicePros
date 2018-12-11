// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
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

function getNum (Str,isFilter) {
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
  } else {
    return [];
  }
}

window.$datePicker = (function () {
  var self = null;
  /**
   * 注册
   * @private {string} container 注册组件根节点，类似jq获取，目前支持的获取有id/className/tagName
   * @private {object} config 配置信息
   * @private {object} data 日期数据 格式为 {date: 1500581005..., data: {...}, price?}
   * @todo 当前根节点获取不能通过自定义属性获取，且id获取时不能多级获取
   */
  function datePicker(container, config) {
    if (this instanceof datePicker === false) {
      return new datePicker(container, config);
    };
    // this全局化，用于解决this指向问题
    self = this;
    // 默认配置，除callback外均为选填
    var defaultConfig = {
      startTime: new Date().Format('yyyy-MM-dd'), //起始时间，默认当前月
      renderNum: 1,                               //渲染月数, 默认渲染一个月
      className: 'date-picker',                   //类名，便于编写样式
      topColor: '#999',                           //顶部字体颜色
      bottomColor: '#0f9',                        //底部字体颜色
      isNeedTopTip: false,                        //是否需要顶部提示字体
      fomatTime: 'yyyy-MM-dd',                    //返回的日期格式
      callback: null                              //选取日期之后调用本函数，必传, 返回两个值，格式化日期/时间戳
    }
    
    this.root = container;                        //跟节点
    this.$data = [];                              //数据包，后台导入
    this.DATE = [];                               //日历书，用于渲染
    this.$config = Object.assign(defaultConfig, config);

    // 日期格式化
    this.$config.startTime += ' 00:00:00';
    this.install();
  };

  datePicker.prototype = {
    /**@description 插件初始化 包括样式及dom获取 */
    install: function () {
      this.root = this.getDom(this.root);
      this.pushStyle();
    },
    /**@description 样式植入 */
    pushStyle: function() {
      var name = this.$config.className;
      // 顶部样式 非必选
      var topStyle = this.$config.isNeedTopTip ? '.'+name+' .view span:before {content:attr(data-top); width:100%; font-size:12px; font-weight:normal; color:'+this.$config.bottomColor+'}' : '';
      // 填充样式
      var css = '.'+name+' {text-align:center; line-height:40px; color:#666; padding-top:50px; position:relative; height:100%;}'+
        '.'+name+' .container {height:100%; width:100%; padding-top:40px}'+
        '.'+name+' .type {border-top:1px solid #eaeaea; border-bottom:1px solid #eaeaea; box-sizing:border-box; position:absolute; top:50px; width:100%}'+
        '.'+name+' .view {width:100%; height:100%; display:flex; flex-wrap:wrap; align-content:space-between; padding:10px 0; overflow-y:scroll}'+
        '.'+name+' .type:after, .'+name+' .view:after {content:""; display:block; clear:both;}'+
        '.'+name+' em {float:left; width:14.27%; font-size:12px; font-weight:600; display:block; height:40px; font-style:normal}'+
        '.'+name+' .view span {float:left; width:14.27%; font-size:12px; display:flex; justify-content:center; align-content:space-around; flex-wrap:wrap; line-height:130%; margin:5px 0}'+
        '.'+name+' .view span:after {content:attr(data-bottom); width:100%; font-size:12px; font-weight:normal; color:'+this.$config.topColor+'}'+
        topStyle+
        '.'+name+' .header {position:absolute; top:0; width:100%; line-height:50px; font-size:16px; font-weight:bold; display:flex; justify-content:space-between; border-bottom:1px solid #eaeaea; box-sizing:border-box; padding:0 15px}'+
        '.'+name+' .header i {width:10%; font-style:normal; font-size:12px}'+
        '.'+name+' .header span {flex: 3}'+
        '.'+name+' .month-picker {display:flex; align-content:space-between; justify-content:space-between; flex-wrap:wrap; height:100%; padding:15px;}'+
        '.'+name+' .month-picker span {width:50px; line-height:50px; border-radius:3px; border:1px solid #999; color:#333; margin:0 5%; font-size:12px;}';
      var style = document.createElement('style');
      style.innerHTML = css;
      document.getElementsByTagName('head')[0].appendChild(style);
    },
    /**@description 数据导入 */
    setData: function(data) {
      this.$data = data;
      this.render();
    },
    /**@description 更新配置 */
    setConfig: function(obj) {
      this.$config = Object.assign(this.$config, obj);
    },
    /**@description dom获取 */
    getDom: function (str) {
      // 多级获取
      var doms = str.split(' ');
      // 从document开始获取
      var result = document;
      // 递归出所需节点
      function getIt(doms, idx) {
        if (!idx) idx = 0;

        if (idx < doms.length) {
          var key = doms[idx];
          if (/^\#/.test(key)) {
            result = result.getElementById(key.replace('#', ''));
          } else if (/^\./.test(key)) {
            result = result.getElementsByClassName(key.replace('.', '')).item(0);
          } else {
            result = result.getElementsByTagName(key).item(0);
          }

          return getIt(doms, idx + 1);
        } else return result;
      };

      return getIt(doms);
    },
    /**@description 计算月份，初始化日历 */
    render: function() {
      // 每次渲染需要重置数据
      this.DATE = [];
      // 获取默认年、月
      var defaultDate = new Date(this.$config.startTime);
      var year = defaultDate.getFullYear();
      var month = defaultDate.getMonth() + 1;
      // 获取月历
      for (var i = 0; i < this.$config.renderNum; i++) {
        month = month + 1;
        if (month > 12) { year++; month = 1; }
        this.fomatMonthData(year, month);
      };
      // 填充数据
      for (var i = 0; i < this.$data.length; i++) {
        var item = this.$data[i];
        var tmpOfItem = new Date(item.tmp);
        var monthOfItem = tmpOfItem.getFullYear() + '年' + (tmpOfItem.getMonth() + 1) + '月';
        var lib = this.DATE.filter(function(m) {return m.header === monthOfItem});
        if (lib.length !== 0) {
          var key = lib[0].month.filter(function(m) {return m.tmp === item.tmp})[0];
          // 找到该日期，挂载数据
          Object.assign(key, item);
        }
      };
      console.log(this.DATE);
      // 数据整理完毕，开始渲染节点
      this.addDom();
    },
    /**@description 穷举数据，将其铺设到对应日历中 */
    fomatMonthData: function(year, month) {
      // 当前月份天数
      var thisMonthDates = new Date(year, month, 0).getDate();
      var firstDayWeek = new Date(year, month - 1, 1).getDay();
      // 循环出月历
      var arr = [];
      for (var i = 0; i < thisMonthDates; i++ ) {
        var _date = new Date(year, month - 1, i + 1);
        arr.push({
          tmp: _date.getTime(),
          day: i + 1
        });
      };
      // 为保证星期统一，头部添加空格
      for (var i = 0; i < firstDayWeek; i++) {
        arr.unshift('');
      }
      // 数据流填充
      this.DATE.push({
        header: year + '年' + month + '月',
        month: arr 
      });
    },
    /**@description 渲染日历 可以进行月份、日期选择 */
    addDom: function() {
      var _html = '';
      var idx = 0;
      this.DATE.map(function(item) {
        // 添加头部
        _html += '<div class="'+self.$config.className+'" data-key="'+idx+'">'+
                  '<div class="header">'+
                  '<i data-month-prev><</i><span class="monthPicker">'+
                  item.header+
                  '</span><i data-month-next>></i></div>'+
                  '<div class="container">'+
                  '<div class="type">'+
                    '<em>日</em><em>一</em><em>二</em>'+
                    '<em>三</em><em>四</em><em>五</em><em>六</em>'+
                  '</div>'+
                  '<div class="view">';
        // 添加日历
        item.month.map(function(childItem) {
          if (childItem !== '') {
            var price = !childItem.data ? self.$config.price : childItem.data.price;
            var inventory = !childItem.data ? self.$config.inventory : childItem.data.inventory;
            var dataTop = self.$config.isNeedTopTip ? 'data-top="'+inventory+'"' : '';
            _html += '<span data-bottom="￥'+price+'" '+dataTop+'>'+childItem.day+'</span>';
          } else {_html += '<span></span>'}
        });
        // 收尾
        _html += '</div></div></div>';
        idx++;
      });
      this.root.innerHTML = _html;
      this.root.removeEventListener('click', self.addListenSelectDate);
      this.root.addEventListener('click', self.addListenSelectDate);
    },
    /**@description 渲染月份 可以进行月份、年份选择 */
    renderMonth: function(year) {
      this.root.innerHTML = '';
      var html = '';
      html += '<div class="xixi">'+
                '<div class="header">'+
                  '<i data-year-prev-pro><<</i><i data-year-prev><</i><span>'+
                  +year+'年'+
                  '</span><i data-year-next>></i><i data-year-next-pro>>></i>'+
                '</div>'+
                '<div class="month-picker">';
      for(var i = 0; i < 12; i++) {
        html+='<span class="month">'+(i+1)+'月</span>';
      };
      html+='</div></div>';
      this.root.innerHTML = html;
    },
    /**@description 监听日历点击 包括日期选择，月份选择及年份选择*/
    addListenSelectDate: function(e) {
      var event = e.target;
      if (event.className === 'monthPicker') {
        // 选择月份
        self.renderMonth(self.$config.startTime.substring(0, 4));
      } else if (typeof event.dataset.top !== 'undefined') {
        // 选择日期，并返回
        /**@todo <待优化>*/
        var idx = Number(event.parentElement.parentElement.parentElement.dataset.key);
        var childIdx = event.innerText;
        var tmp = self.DATE[idx].month.filter(function(m) { return m.day === Number(childIdx)})[0].tmp;
        self.$config.callback(new Date(tmp).Format(self.$config.fomatTime), tmp);
      } else if (event.className === 'month') {
        var month = parseInt(event.innerText);
        var _year = event.parentElement.previousElementSibling.innerText;
        var year = getNum(_year);
        self.$config.startTime = year[0] + '-' + month + '-01';
        self.render();
      } else if (typeof event.dataset.yearPrev !== 'undefined') {
        // 上一年
        var y = event.nextElementSibling.innerText;
        event.nextElementSibling.innerText = parseInt(y) - 1 + '年';
      } else if (typeof event.dataset.yearNext !== 'undefined') {
        // 下一年
        var y = event.previousElementSibling.innerText;
        event.previousElementSibling.innerText = parseInt(y) + 1 + '年';
      } else if (typeof event.dataset.yearPrevPro !== 'undefined') {
        // 上一年
        var y = event.nextElementSibling.nextElementSibling.innerText;
        event.nextElementSibling.nextElementSibling.innerText = parseInt(y) - 5 + '年';
      } else if (typeof event.dataset.yearNextPro !== 'undefined') {
        // 下一年
        var y = event.previousElementSibling.previousElementSibling.innerText;
        event.previousElementSibling.previousElementSibling.innerText = parseInt(y) + 5 + '年';
      } else if (typeof event.dataset.monthPrev !== 'undefined') {
        // 上一月
        const time = self.$config.startTime;
        let y = parseInt(time.substring(0, 4));
        let m = parseInt(time.substring(5, 7));
        y = m === 1 ? y - 1 : y;
        m = m === 1 ? 12 : m - 1;
        m = m < 10 ? '0' + m : m;
        self.$config.startTime = `${y}-${m}-01 00:00:00`;
        self.render();
      } else if (typeof event.dataset.monthNext !== 'undefined') {
        // 下一月
        const time = self.$config.startTime;
        let y = parseInt(time.substring(0, 4));
        let m = parseInt(time.substring(5, 7));
        y = m === 12 ? y + 1 : y;
        m = m === 12 ? 1 : m + 1;
        m = m < 10 ? '0' + m : m;
        self.$config.startTime = `${y}-${m}-01 00:00:00`;
        self.render();
      }
    }
  };

  return datePicker;
})();
