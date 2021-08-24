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
      this.walk(value);
    }
    walk (data) {
      let keys = Object.keys(data); //获取data key值 [name,age,address]
      console.log('🚀🚀 ~ file: index.js ~ line 11 ~ Observer ~ walk ~ keys', keys);
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
