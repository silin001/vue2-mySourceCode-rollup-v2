(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  // 工具类方法
  // 当前数据是不是对象 
  function isObject (data) {
    return typeof data === 'object' && data !== null
  }

  function def (data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false, // 不可枚举=>循环
      configurable: false,// 不可修改
      value
    });
  }

  // 重写数组那些方法， 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化

  let oldArrayMethods = Array.prototype; // 保存原理数组的方法
  // 用户使用时： value.__proto__ = arraryMethods   ps：原型链查找概念，会向上查找 先查找我重写的，重写的没有 继续向上查找
  //arrayMethods.__proto__ = oldArrayMethods
  const arrayMethods = Object.create(oldArrayMethods);
  const methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'reverse',
    'sort',
    'splice'
  ];
  // 循环重写7种数组方法
  methods.forEach((method) => {
    arrayMethods[method] = function (...args) {
      console.log('用户调用了push 参数为:', args); // AOP切片过程
      const result = oldArrayMethods[method].apply(this, args); // 用户调用我们方法-> 我们在调用原生方法， 拿到返回值
      console.log('🚀🚀 ~ file: array.js ~ line 20 ~ methods.forEach ~ result', result);
      // 用户使用 push unshift 操作时 值可能是一个对象 对象数据我们需要继续检测! ⭐
      let inserted; // 当前用户插入的元素
      const ob = this.__ob__;  // 拿到Observer 类 监控过的对象添加的__ob__ 属性 里面有observerArray等方法
      // console.log('🚀🚀 ~ file: array.js ~ line 23 ~ methods.forEach ~ ob', ob)
      switch (method) {
        case 'push':
          // inserted = args
          break;
        case 'unshift':
          inserted = args;
          break;
        case 'splice':  // 新增的属性splice有删除，新增功能， arr.splice(0,1,{name:1})
          inserted = args.splice(2);
          break;
      }
      console.log(inserted);
      if (inserted) ob.observerArray(inserted); // ⭐ 调用 observerArray 对新增的数据继续 进行监测
      return result
    };
  });

  // 对象的数据劫持！
  // ⭐定义响应式数据
  function defineReactive (data, key, value) {
    observe(value); //⭐ 递归实现深度监测，层次越深越差
    Object.defineProperty(data, key, {
      get () {
        return value
      },
      set (newVal) {
        if (newVal === value) return
        console.log('值改变了');
        observe(newVal);       // ⭐继续劫持用户设置的值，因为有可以用户设置的值为{}
        value = newVal;
      }
    });
  }
  // 观察数据 类
  class Observer {
    constructor(value) {
      // vue如果数据的层次过多 需要递归去解析对象中的属性,依次添加get, set方法
      // BUG 这样写会死循环
      // value.__ob__ = this // ⭐ 这里给每一个监控过的对象新增一个__ob__ 属性，在数组方法重写时需要用到
      // 使用Object.defineProperty 方法去添加
      def(value, '__ob__', this);
      // 数组数据劫持
      if (Array.isArray(value)) {
        // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
        // 前端开发中很少操作索引，  push unshift unshift
        // 如果数组里放的是对象我在监控
        // console.log(arrayMethods)
        // 2.⭐ 用户可能使用 this.data.arr.push({}) ..等方法 所有要重写这些方法
        value.__proto__ = arrayMethods; // 原型添加我们重写的数组方法
        this.observerArray(value); // 1.数组中每一项进行观测
      } else {
        // 对象数据的劫持观测
        this.walk(value);

      }
    }
    observerArray (data) {
      for (let index = 0; index < data.length; index++) {
        observe(data[index]);
      }
    }
    //循环获取data的key 并且监听
    walk (data) {
      let keys = Object.keys(data); //获取data key值 [name,age,address]
      keys.forEach((key) => {
        defineReactive(data, key, data[key]); // 定义响应式数据
      });
      // for (let index = 0; index < keys.length; index++) {
      //   const key = keys[index]
      //   const value = data[key]
      // defineReactive(data, key, value]) // 定义响应式数据
      // }
    }
  }

  function observe (data) {
    console.log(data, 'observe');
    const isObj = isObject(data);
    if (!isObj) return
    return new Observer(data)  // 用来观测数据
  }

  function initState (vm) {
    const opts = vm.$options;
    // vue 的数据来源 属性 方法  数据 计算属性 watch
    // console.log(opts)
    if (opts.props) ;
    if (opts.methods) ;
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) ;
    if (opts.watch) {
      initWatch(vm);
    }

  }
  function initData (vm) {
    console.log('初始化数据', vm.$options.data);
    // 数据初始化工作
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    // 对象劫持，用户改变数据 我希望可以得到通知-刷新页面
    // mvvm 模式 数据变化可以更新视图
    observe(data); // 响应式原理
  }

  function initWatch (vm) {
    console.log('初始化数据', vm.$options.data);
  }

  // Regular Expressions for parsing tags and attributes
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配属性
  // const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

  //  正则做过修改 不完全是源码的
  // ps: ?: 代表匹配不捕获
  // const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*` // abc-aaa
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // abc-aaa
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //<aaa:dawbdf>
  const startTagOpen = new RegExp(`^<${qnameCapture}`); //标签开头的正则,捕获的内容是标签名
  const startTagClose = /^\s*(\/?)>/; // 匹配标签结束 >
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾</div>

  function chars (text) {
    console.log('文本是', text);
  }
  function start (tagName, attrs) {
    console.log('标签是', tagName, '属性是', attrs);
  }
  function end (endText) {
    console.log('结束标签是 ', endText);
  }

  // AST语法树生成
  function parseHTML (html) {
    // 不停的去解析html字符串
    while (html) {
      console.log('🚀🚀 ~ file: index.js ~ line 30 ~ parseHTML ~ html', html);
      let textEnd = html.indexOf('<');
      console.log('🚀🚀 ~ file: index.js ~ line 31 ~ parseHTML ~ textEnd', textEnd);
      if (textEnd == 0) {
        // 如果为0  当前匹配到是一定是一个标签 开始或者结束
        // 开始标签
        let startTagMatch = parseStartTag(); // 获取匹配结果 tagname attrs
        console.log('🚀🚀 ~ file: index.js ~ line 22 ~ parseHTML ~ startTagMatch', startTagMatch);
        console.log(html);
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue // 如果开始标签匹配完毕 继续下一次匹配
        }
        console.log(html);
        // 结束标签
        let endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          console.log(endTagMatch);
          end(endTagMatch[1]);
          continue
        }
      }
      let text;
      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }
      if (text) {
        advance(text.length);
        chars(text);
      }
      // TODO 返回不完整
      // return html
    }
    // 前进
    function advance (n) {
      html = html.substring(n);
    }
    function parseStartTag () {
      let start = html.match(startTagOpen);
      if (start) {
        const match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 将标签删除
        let end, attr;
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 将属性解析
          advance(attr[0].length); // 属性去掉
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || arrt[5]
          });
        }
        if (end) { // 去掉开始标签的>
          advance(end[0].length);
          return match
        }
      }
    }

  }
  // ⭐ 将tempated模板 编译成 AST 语法树
  // 注意: 固定模版生成的AST是不变的  虚拟DOM是不断变化的
  function compileToFunction (template) {
    let root = parseHTML(template);
    console.log('🚀🚀 ~ file: index.js ~ line 86 ~ compileToFunction ~ root', root);

    return function render () {

    }
  }

  // 在原型上添加一个init方法
  function initMixin (Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      console.log(options);
      // 1.劫持数据
      const vm = this;
      console.log(vm);
      vm.$options = options;
      // 初始化状态
      initState(vm);
      //  如果用户传入了el属性,需要渲染页面\ 实现挂载流程
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    //   实现挂载流程
    Vue.prototype.$mount = function (el) {
      const vm = this;
      const options = vm.$options;
      el = document.querySelector(el);
      // 默认查找有没有render方法, 没有render 会采用template还没有就用el内容
      if (!options.render) {
        // 对模板编译
        let template = options.template;
        if (!template && el) { // 没有模板 直接拿outerHTML
          template = el.outerHTML;
        }
        console.log(template);
        // 把模板编译成render函数方法 - 将模板 编译成 AST 语法树
        const render = compileToFunction(template);
        options.render = render;
      }
    };
  }

  // vue核心 只是vue的一个声明文件


  function Vue (options) {
    //vue 初始化操作
    this._init(options);
  }
  // 通过引入文件方式给vue原型添加方法
  initMixin(Vue); // 给vue原型添加_init方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
