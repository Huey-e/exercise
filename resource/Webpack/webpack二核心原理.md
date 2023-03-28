- [webpack 要解决的两个问题](#webpack-要解决的两个问题)
  - [怎样在浏览器中运行import/export?](#怎样在浏览器中运行importexport)
  - [兼容策略](#兼容策略)
- [编译import和export关键字（问题一）](#编译import和export关键字问题一)
  - [分析转换后的ES5代码](#分析转换后的es5代码)
  - [答疑](#答疑)
- [把多个文件打成一个包（问题二）](#把多个文件打成一个包问题二)
  - [把code字符串改成函数](#把code字符串改成函数)
- [打包器完成](#打包器完成)
- [目前还存在的问题](#目前还存在的问题)
- [总结](#总结)
- [系列文章](#系列文章)

## webpack 要解决的两个问题

假设现在我们有以下代码

index.js

```js
import a from './a.js'
import b from './b.js'

console.log(a.getA())

console.log(b.getB())
复制代码
```

a.js

```js
import b from './b.js'

const a = {
  value: 'a',
  getA: () => b.value + 'from a.js'
}

export default a
复制代码
```

b.js

```js
import a from './a.js'

const b = {
  value: 'b',
  getB: () => a.value + 'from b.js'
}

export default b
复制代码
```

很遗憾，在浏览器中不能直接运行，带有 `import`和 `export`关键字的代码，那我们想要，并且必须要在浏览器中运行这些代码应该怎么办呢？

### 怎样在浏览器中运行import/export?

现代浏览器可以通过 `<script type="module"></script>`来支持 `import`和 `export` ie就不再这里提了，明年就跟他说拜拜了。

### 兼容策略

* 激进的策略：把代码全部放在 `<script type="module"></script>`里面，缺点：会导致请求的文件数量过多。
* 平稳兼容的策略：把关键字转换成普通代码，并把所有文件打包成一个文件，缺点：需要编写一些复杂的代码才能够做到这件事情。

## 编译import和export关键字（问题一）

在上篇文章的基础上进行改动，

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72b0e8c671c4457aa9d6558ac5a2e8a7~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

再来看一下得到的依赖结果，主要的变化就是依赖里面的 `code`从之前的 `es6`代码变成了 `es5`代码里面没有了 `import`和 `export`

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f39bfc1a569b461dab658893d19bcaeb~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

### 分析转换后的ES5代码

我们在来仔细的观察一下 `a.js`变成 `es5`之后的代码

```js
;
Object.defineProperty(exports, "__esModule", {value: true});
exports["default"] = void 0;
var _b = _interopRequireDefault(require("./b.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { "default": obj };
}
var a = {
  value: 'a',
  getB: function getB() {
    return _b["default"].value + ' from a.js';
  }
};
var _default = a;
exports["default"] = _default;

复制代码
```

### 答疑

```js

Object.defineProperty(exports, "__esModule", {value: true});

Object.defineProperty(exports, "__esModule", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: true
});

exports.__esModule = true
复制代码
```

这个是给 `exports`对象添加一个 `__esModule`的一个属性值为 `true`,那问什么不写成下面这一种呢？我本人的分析（注释）

```js
exports["default"] = void 0;
复制代码
```

1. void 0 等价于 undefined，老 JSer 的常见过时技巧
2. 这句话是为了强制清空 exports['default'] 的值

```js
import a from './a.js' 变成了
var _a = _interopRequireDefault(require("./a.js"));
a.getA() 变成了
__a["default"].getA()
复制代码
```

_interopRequireDefault(module)函数

1. `_`下划线前缀是为了避免与其他变量重名
2. 该函数的意图是给模块添加 `'default'`
3. 为什么要加 `default&#xFF1A;CommonJS` 模块没有默认导出，加上方便兼容
4. 内部实现： `return m && m.__esModule ? m : { "default": m }`
5. 其他 `_interop `开头的函数大多都是为了兼容旧代码

```js
export default 变成了
 var a = {
  value: 'a',
  getA: function getA() {
    return _b["default"].value + 'from a.js';
  }
};
var _default = a;
exports["default"] = _default;

export {c} 变成了
var c = {
  value: 'c'
};
exports.c = c;
复制代码
```

## 把多个文件打成一个包（问题二）

我们先来想一想这个文件具有哪些功能？肯定包含所有的模块，然后能够执行所有模块。我们先来写一段伪代码来描述我们期待的结果。

```js

var depRelation = [
  {
    key: 'index.js',
    deps: ['a.js', 'b.js'],
    code: function().....

  },
  {
    key: 'a.js',
    deps: [],
    code: function().....

  }
]

execute(depRelation[0].key)

function exection(key) {
  var item = depRelation.find(i => key === i.key)
  item.code()  ?
}
复制代码
```

下面我们开始对之前构建依赖关系的代码进行改造。我们目前主要有三个问题

1. 之前构建的 `depRelation`是一个对象，现在我要把它变成一个函数，为什么要变成数组呢？因为我们要把入口文件的依赖关系放在第一个位置。
2. 之前的 `code`还是一个字符串，需要把字符串变成函数。
3. `execute`函数待完善。

### 把code字符串改成函数

1. 在 `code`字符串外面包一个 `function(require,module,exports){....}`。
2. 把 `code`写到文件里面，引号就不会出现在文件中。 就想下面这样

```js
code = `
import a from './a.js'
import b from './b.js'
console.log(a.getA())
console.log(b.getB())
`
code2 = function(require,module,exports){
 ${code}
}

复制代码
```

## 打包器完成

```js
import * as babel from '@babel/core';

import { resolve, relative, dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { parse } from '@babel/parser'
import traverse from '@babel/traverse';

const projectRoot = resolve(__dirname, 'project-03')

type DepRelation = { key: string, deps: string[], code: string }[]

const depRelation: DepRelation = []

function collectCodeAndDeps(filepath: string) {
  let key = getProjectPath(filepath)
  if (depRelation.find(item => key === item.key)) {

    return
  }

  let code = readFileSync(resolve(filepath)).toString()

  const { code: es5Code } = babel.transform(code, {
    presets: ['@babel/preset-env']
  })

  let item = {
    key,
    deps: [],
    code: es5Code
  }
  depRelation.push(item)

  let ast = parse(code, {
    sourceType: 'module'
  })

  traverse(ast, {
    enter: path => {

      if (path.node.type === 'ImportDeclaration') {

        let depAbsolutePath = resolve(dirname(filepath), path.node.source.value)

        const depProjectPath = getProjectPath(depAbsolutePath)

        item.deps.push(depProjectPath)

        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })
}

collectCodeAndDeps(resolve(projectRoot, 'index.js'))

writeFileSync('dist.js', generateCode())

function generateCode() {
  let code = ''

  code += 'var depRelation = [' + depRelation.map(item => {
    let { key, deps, code } = item
    return `{
      key: ${JSON.stringify(key)},
      deps: ${JSON.stringify(deps)},
      code: function(require, module, exports) {
        ${code}
      }
    }`
  }).join(',') + '];\n'

  code += 'var modules = {};\n'
  code += `execute(depRelation[0].key)\n`
  code += `
  function execute(key) {
    if (modules[key]) { return modules[key] }
    var item = depRelation.find(i => i.key === key)
    if (!item) { throw new Error(\`\${item} is not found\`) }
    //把./b.js 转成 b.js
    var pathToKey = (path) => {
      var dirname = key.substring(0, key.lastIndexOf('/') + 1)
      var projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
      return projectPath
    }
    //执行code函数的时候内部如何处理require的逻辑，其实就是再把当前require的模块再执行一次
    var require = (path) => {
      return execute(pathToKey(path))
    }
    modules[key] = { __esModule: true }
    var module = { exports: modules[key] }
    item.code(require, module, module.exports)
    return modules[key]
  }
  `
  return code
}

function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, '/')
}
复制代码
```

现在我们进行以下操作，当然把这个文件用 `script`的方式引入到 `html`文件中也完全没有问题，打印的是 `modules `这个用于缓存代码执行过程中所加载过的模块。

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe6b1e7a7d9e422eaf4784b39b41a67a~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 目前还存在的问题

1. 生成的代码中有多个重复的 `_interopRequireDefault` 函数
2. 只能引入和运行 `JS `文件，不能引入 `css`
3. 只能理解 `import`，无法理解 `require`
4. 不支持插件
5. 不支持配置入口文件和 `dist `文件名

源码查看[源码链接](https://link.juejin.cn?target=https%3A%2F%2Fgitee.com%2Fxiuxiuyifan%2Fwebpack-theory%2Ftree%2Fmaster%2F01 "https://gitee.com/xiuxiuyifan/webpack-theory/tree/master/01")

## 总结

1. 上一篇文章主要做的事情就是找出一段代码在执行的时候的依赖关系图。
2. 这一篇文章主要做的事情就是，把找到的所有依赖，放到一个文件中，然后从入口文件开始执行完所有代码。

## 系列文章

[Webpack入门到精通 一（AST、Babel、依赖）](https://juejin.cn/post/6975885302493609991 "https://juejin.cn/post/6975885302493609991")

[Webpack入门到精通 二（核心原理）](https://juejin.cn/post/6978294079360598023 "https://juejin.cn/post/6978294079360598023")

[Webpack入门到精通 三（Loader原理）](https://juejin.cn/post/6980658561718812702 "https://juejin.cn/post/6980658561718812702")

[Webpack入门到精通 四（Plugin原理）](https://juejin.cn/post/7024127150412267556 "https://juejin.cn/post/7024127150412267556")

[Webpack入门到精通 五（常用配置）](https://juejin.cn/post/6981841495338778660 "https://juejin.cn/post/6981841495338778660")
