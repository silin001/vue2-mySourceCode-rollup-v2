import { initState } from './initState'
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
  }
}