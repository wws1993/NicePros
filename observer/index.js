// Dep...
var Dep = (function () {
  var __ = function () {
    if (!this instanceof __) return new __();
    this.subs = [];
  }
  __.prototype = {
    addSub: function (sub) {
      this.subs.push(sub);
    },
    notify: function () {
      this.subs.forEach(function (sub) {
        sub.update();
      });
    }
  };

  return __;
})();

// watcher...
var Watcher = (function () {
  function __(vm, exp, callback) {
    if (!this instanceof __) return new __(vm, exp, callback);
    this.callback = callback;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get(); // 将自己添加到订阅器的操作
  }

  __.prototype = {
    update: function () {
      this.run();
    },
    run: function () {
      var oldVal = this.value;
      var value = this.getter();
      if (value !== oldVal || Array.isArray(value)) {
        this.value = value;
        this.callback.call(this.vm, value, oldVal);
      }
    },
    get: function () {
      Dep.target = this; // 缓存自己
      var value = this.getter(); // 强制执行监听器里的get函数
      Dep.target = null; // 释放自己
      return value;
    },
    getter: function () {
      var value = null;
      var lib = this.exp.split('.');
      if (lib.length !== 1) {
        var __ = this.vm.data;
        for (var i of lib) {
          __ = __[i];
        }
        value = __;
      } else value = this.vm.data[this.exp]
      return value;
    }
  };

  return __;
})();

// observe...
function observe(data) {
  if (!data || typeof data !== 'object') {
    return;
  };
  
  Object.keys(data).forEach(function (key) {
    defineReactive(data, key, data[key]);
  });

  function defineReactive(vm, key, val) {
    var obFun = Array.isArray(val) ? obArray : observe; // 递归遍历所有子属性
    obFun(val);
    var dep = new Dep();
    Object.defineProperty(vm, key, {
      get: function () {
        if (Dep.target) { // 判断是否需要添加订阅者
          dep.addSub(Dep.target); // 在这里添加一个订阅者
        }
        return val;
      },
      set: function (newVal) {
        if (val === newVal) return;
        val = newVal;
        dep.notify(); // 如果数据变化，通知所有订阅者
      }
    });

    function obArray(_arr) {
      var arrayMethod = Object.create(Array.prototype);
      var listenedArrMethods = ['push','pop','shift','unshift','splice','sort','reverse'];
      listenedArrMethods.forEach(function (method) {
        Object.defineProperty(arrayMethod, method, {
          value: function () {
            var i = arguments.length;
            var args = new Array(i);
            while (i--) {
              args[i] = arguments[i];
            }
            var original = Array.prototype[method];
            var result = original.apply(this, args);
            // console.log(result);
            // TODO: 数组变化通知
            dep.notify();
            return result;
          },
          enumerable: true,
          writable: true,
          configurable: true
        });
      });

      _arr.__proto__ = arrayMethod;
    }
  };
};

// ob...
var Ober = (function () {
  function __(vm) {
    if (!this instanceof __) return new __(vm);
    if (vm.beforeCreate) vm.beforeCreate();
    this.init(vm);
  };

  __.prototype = {
    init: function (vm) {
      this.data = vm.data || {};
      observe(vm.data);
      this.addWatcher(vm);
    },
    addWatcher: function (vm) {
      for (const key in vm.watch) {
        new Watcher(this, key, vm.watch[key]);
      }
    }
  }

  return __;
})();

/**@example 使用方法 */
// var obObj = new Ober({
//   data: {
//     book: {
//       name: 'vue权威指南',
//       price: [20, 21, 22]
//     }
//   },
//   watch: {
//     'book.name': function (to, from) {
//       console.log(from, to);
//     },
//     'book.price': function (price) {
//       console.log(price);
//     }
//   }
// });

// obObj.data.book.name = '红与黑';
// obObj.data.book.price.splice(0, 3, 11, 22, 33);
// obObj.data.book.price.push(1);
// obObj.data.book.price.shift(1);