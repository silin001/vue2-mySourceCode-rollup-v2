import { initState } from './initState'
import { compileToFunction } from './compiler/index'
// 在原型上添加一个init方法
export function initMixin (Vue) {
  // 初始化流程
  Vue.prototype._init = function (options) {
    console.log(options)
    // 1.劫持数据
    const vm = this
    console.log(vm)
    vm.$options = options
    // 初始化状态
    initState(vm)
    //  如果用户传入了el属性,需要渲染页面\ 实现挂载流程
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  //   实现挂载流程
  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    // 默认查找有没有render方法, 没有render 会采用template还没有就用el内容
    if (!options.render) {
      // 对模板编译
      let template = options.template
      if (!template && el) { // 没有模板 直接拿outerHTML
        template = el.outerHTML
      }
      console.log(template)
      // 把模板编译成render函数方法 - 将模板 编译成 AST 语法树
      const render = compileToFunction(template)
      options.render = render
    }
  }
}