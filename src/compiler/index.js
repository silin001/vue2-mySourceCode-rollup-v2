// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/  // 匹配属性
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

//  正则做过修改 不完全是源码的
// ps: ?: 代表匹配不捕获
// const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*` // abc-aaa
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //<aaa:dawbdf>
const startTagOpen = new RegExp(`^<${qnameCapture}`) //标签开头的正则,捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束 >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾</div>
// const doctype = /^<!DOCTYPE [^>]+>/i
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // 匹配{{aaa}}

function chars (text) {
  console.log('文本是', text)
}
function start (tagName, attrs) {
  console.log('标签是', tagName, '属性是', attrs)
}
function end (endText) {
  console.log('结束标签s ', endText)
}

// AST语法树生成
function parseHTML (html) {
  // 不停的去解析html字符串
  while (html) {
    let textEnd = html.indexOf('<')
    if (textEnd == 0) {
      // 如果为0  当前匹配到是一定是一个标签 开始或者结束
      let startTagMatch = parseStartTag() // 获取匹配结果 tagname attrs
      // console.log('🚀🚀 ~ file: index.js ~ line 22 ~ parseHTML ~ startTagMatch', startTagMatch)
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue // 如果开始标签匹配完毕 继续下一次匹配
      }
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    let text
    if (textEnd >= 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text)
    }

    return html
  }
  // 前进
  function advance (n) {
    html = html.substring(n)
  }
  function parseStartTag () {
    let start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length) // 将标签删除
      let end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // 将属性解析
        advance(attr[0].length) // 属性去掉
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || arrt[5]
        })
      }
      if (end) { // 去掉开始标签的>
        advance(end[0].length)
        return match
      }
    }
  }

}
// ⭐ 将tempated模板 编译成 AST 语法树
// 注意: 固定模版生成的AST是不变的  虚拟DOM是不断变化的
export function compileToFunction (template) {
  let root = parseHTML(template)
  console.log('🚀🚀 ~ file: index.js ~ line 86 ~ compileToFunction ~ root', root)

  return function render () {

  }
}