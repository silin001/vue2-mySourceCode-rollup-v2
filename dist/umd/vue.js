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
          inserted = args;
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
      if (Array.isArray(value)) {
        // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
        // 前端开发中很少操作索引，  push unshift unshift
        // 如果数组里放的是对象我在监控
        // console.log(arrayMethods)
        // 2.⭐ 用户可能使用 this.data.arr.push({}) ..等方法 所有要重写这些方法
        value.__proto__ = arrayMethods; // 原型添加我们重写的数组方法
        this.observerArray(value); // 1.数组中每一项进行观测
      } else {
        this.walk(value); // 对象的进行观测

      }
    }
    observerArray (data) {
      for (let index = 0; index < data.length; index++) {
        observe(data[index]);
      }
    }
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
