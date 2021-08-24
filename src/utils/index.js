// 工具类方法
// 当前数据是不是对象 
export function isObject (data) {
  return typeof data === 'object' && data !== null
}

export function def (data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false, // 不可枚举=>循环
    configurable: false,// 不可修改
    value
  })
}