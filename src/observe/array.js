// 重写数组那些方法， 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化

let oldArrayMethods = Array.prototype // 保存原理数组的方法
// 用户使用时： value.__proto__ = arraryMethods   ps：原型链查找概念，会向上查找 先查找我重写的，重写的没有 继续向上查找
//arrayMethods.__proto__ = oldArrayMethods
export const arrayMethods = Object.create(oldArrayMethods)
const methods = [
  'push',
  'shift',
  'unshift',
  'pop',
  'reverse',
  'sort',
  'splice'
]
// 循环重写7种数组方法
methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    console.log('用户调用了push 参数为:', args) // AOP切片过程
    const result = oldArrayMethods[method].apply(this, args) // 用户调用我们方法-> 我们在调用原生方法， 拿到返回值
    console.log('🚀🚀 ~ file: array.js ~ line 20 ~ methods.forEach ~ result', result)
    // 用户使用 push unshift 操作时 值可能是一个对象 对象数据我们需要继续检测! ⭐
    let inserted // 当前用户插入的元素
    const ob = this.__ob__  // 拿到Observer 类 监控过的对象添加的__ob__ 属性 里面有observerArray等方法
    // console.log('🚀🚀 ~ file: array.js ~ line 23 ~ methods.forEach ~ ob', ob)
    switch (method) {
      case 'push':
        // inserted = args
        break;
      case 'unshift':
        inserted = args
        break;
      case 'splice':  // 新增的属性splice有删除，新增功能， arr.splice(0,1,{name:1})
        inserted = args.splice(2)
        break;
      default:
        break;
    }
    console.log(inserted)
    if (inserted) ob.observerArray(inserted) // ⭐ 调用 observerArray 对新增的数据继续 进行监测
    return result
  }
})
