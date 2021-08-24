import { observe } from './observe/index'
export function initState (vm) {
  const opts = vm.$options
  // vue 的数据来源 属性 方法  数据 计算属性 watch
  // console.log(opts)
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }

}
function initProps (vm) {
  // console.log('初始化数据', vm.$options.data)
}
function initMethods (vm) {
  // console.log('初始化数据', vm.$options.data)
}
function initComputed (vm) {
  // console.log('初始化数据', vm.$options.data)
}
function initData (vm) {
  console.log('初始化数据', vm.$options.data)
  // 数据初始化工作
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  // 对象劫持，用户改变数据 我希望可以得到通知-刷新页面
  // mvvm 模式 数据变化可以更新视图
  observe(data) // 响应式原理
}

function initWatch (vm) {
  console.log('初始化数据', vm.$options.data)
}