# vue2-mySourceCode-rollup-v2
vue2 源码解析  开发环境基于rollup 
# 问题:
serve 服务无法自动打开浏览器, 访问路径http://localhost:3100/public/index.html

# 实现流程
1.模块拆分
2.observe- 实现数据的劫持监听
3.如何解析模板 AST实现(抽象语法树)-简易版  --实现中