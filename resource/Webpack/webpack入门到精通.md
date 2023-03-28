- [babel与AST](#babel与ast)
  - [初始化项目](#初始化项目)
  - [babel以及项目依赖](#babel以及项目依赖)
  - [小试牛刀](#小试牛刀)
  - [把let变成 var](#把let变成-var)
  - [为什么用AST?](#为什么用ast)
  - [把代码转化为ES5](#把代码转化为es5)
  - [分析index.js的依赖](#分析indexjs的依赖)
  - [递归分析嵌套的依赖](#递归分析嵌套的依赖)
  - [什么是循环依赖?](#什么是循环依赖)
  - [静态分析循环依赖](#静态分析循环依赖)
  - [总结](#总结)
    - [AST相关](#ast相关)
    - [工具相关](#工具相关)
    - [代码技巧](#代码技巧)
    - [循环依赖](#循环依赖)
- [系列文章](#系列文章)

## babel与AST

### 初始化项目

```bash
mkdir webpack-study
cd webpack-study
yarn init -y
复制代码
```

此时在package.json里面加入以下依赖

```json
{
  "name": "01",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "@babel/core": "7.12.3",
    "@babel/generator": "7.12.5",
    "@babel/parser": "7.12.5",
    "@babel/preset-env": "7.12.1",
    "@babel/traverse": "7.12.5",
    "ts-node": "9.0.0",
    "typescript": "4.0.5"
  },
  "devDependencies": {
    "@types/babel__core": "7.1.12",
    "@types/babel__generator": "7.6.2",
    "@types/babel__parser": "7.1.1",
    "@types/babel__preset-env": "7.9.1",
    "@types/babel__traverse": "7.0.15",
    "@types/node": "14.14.6"
  }
}
复制代码
```

### babel以及项目依赖

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b97c1e2c3d1349b68131cdbc134a289d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 对使用到的包进行说明 详细内容请参考: [理解babel的基本原理和使用方法](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fweixin_43378716%2Farticle%2Fdetails%2F107603540 "https://blog.csdn.net/weixin_43378716/article/details/107603540")

* @babel/core Babel 是一个 JavaScript 编译器， Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。下面列出的是 Babel 能为你做的事情：

1. 语法转换
2. 通过 Polyfill 方式在目标环境中添加缺失的特性（通过第三方 polyfill 模块，例如 core-js，实现）
3. 源码转换 (codemods)

* @babel/generator 这个过程已经在上面的实例中有所展现，使用的插件是@babel/generator，其作用就是将转换好的ast重新生成代码。这样的代码就就可以安全的在浏览器运行。
* @babel/parser 在babel中编译器插件是@babel/parser，其作用就是将源码转换为AST，
* @babel/preset-env （预设(preset)——babel的插件套装） 那么问题来了新语法新特性那么多，难道我们要挨个去加吗？当然不是，babel已经预设了几套插件，将最新的语法进行转换，可以使用在不同的环境中，如下：

```bash
@babel/preset-env
@babel/preset-flow
@babel/preset-react
@babel/preset-typescript
复制代码
```

从名字上就能看出他们使用的环境了，需要注意的是env，他的作用是将最新js转换为es6代码。预设是babel插件的组合，我们可以看下package.json（截取一部分）：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f65e0862c4e24892b09928dbe61ea2d4~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

* @babel/traverse

ast进行遍历parse

* ts-node 使用.d.ts文件 既然要开发一个项目，显然不会只有这些代码。肯定要用到内建模块和第三方模块。然而，直接导入模块，在.ts文件中是不行的。例如：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c35f595671bf467c87357fbecea34c7b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 这是由于typescript自身的机制，需要一份xx.d.ts声明文件，来说明模块对外公开的方法和属性的类型以及内容。感觉有一些麻烦。好在，官方以及社区已经准备好了方案，来解决这个问题。

在TypeScript 2.0以上的版本，获取类型声明文件只需要使用npm。在项目目录下执行安装:

```bash
npm install --save-dev @types/node
复制代码
```

就可以获得有关node.js v6.x的API的类型说明文件。之后，就可以顺利的导入需要的模块了:

```bash
import * as http from 'http';
复制代码
```

### 小试牛刀

我们安装好依赖之后，编写以下代码

```bash
touch var_to_let.ts
复制代码
```

```typescript
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

let code = `let a = 'str'; let b = 2`

const ast = parse(code, { sourceType: 'module' })

console.log(ast)
复制代码
```

在vscode里面打上断点

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4b05b88e35b41efb63f2e8b390ae573~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 接着我们在终端运行

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2bf3873a2214a94a947225425aa4715~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 就可以进行断点调试了，我们可以看到parse()函数把字符串的代码转换后的结果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e70f825f60da4d519fdaa2333a6349c5~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

我们在这个ast树形结构里面找到以下几个属性，不难发现ats就是把一个字符串代码，表示成一个树形结构。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1dbc025208a6410abf8b7933fa41087d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

### 把let变成 var

```js
traverse(ast, {

  enter: item => {
    if(item.node.type === 'VariableDeclaration') {
      if(item.node.kind === 'let') {
        item.node.kind = 'var'
      }
    }
  }
})

const result = generate(ast, {}, code)
console.log(result)
复制代码
```

看下面的结果，我们修改了ats对象里面的属性的值，最终通过generate函数生成了一个新的字符串代码片段。成功的将原始代码里面的let转化成了var。嗯？Es6转Es5就这么简单？我们继续 ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4c45672c55842ecb743be45f33b35cf~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

### 为什么用AST?

1. 很难用正则表达式来替换，正则表达式很容易把 `let a = 'let'`，替换成 `var a = 'var'`
2. 在修改的时候需要知道每一个单词的意思，才能做到只修改用于 `&#x53D8;&#x91CF;&#x58F0;&#x660E;`的 `let`
3. 而AST能明确的告诉你每个 `let`的意思

### 把代码转化为ES5

```js

import { parse } from '@babel/parser'
import * as babel from '@babel/core'

let code = `let a = 'str'; let b = 2; const c = 100`

const ast = parse(code, { sourceType: 'module' })

const result = babel.transformFromAstSync(ast, code, {
  presets: ['@babel/preset-env']
})

console.log(result)
复制代码
```

得到以下结果，可以看到 `const`和 `let`都被转化成了ES5的代码了。下面我们接着写，我们把code字符串代码放在文件里面，把生成的结果写入到另一个.es5.js结尾的文件中。 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4eca3c5ccdf74e578615231576894dfd~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

```js

import { parse } from '@babel/parser'
import * as babel from '@babel/core'
import * as fs from 'fs'

let code = fs.readFileSync('./test.js').toString()

const ast = parse(code, { sourceType: 'module' })

const result = babel.transformFromAstSync(ast, code, {
  presets: ['@babel/preset-env']
})

let fileName = 'test.es5.js'
fs.writeFileSync(fileName, result.code)
复制代码
```

通过以上代码我们就将一个源文件是 `ES6`的 `js`代码转换成了 `ES6`的代码

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c74b7a09ca58421bb7028c39ee8d2ebb~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

### 分析index.js的依赖

在当前目录下新建project-01目录，新建三个文件 `a.js`, `b.js`, `index.js`分别写下以下内容

a.js

```js
var a = {
  value: 100
}

export default a
复制代码
```

b.js

```js
var b = {
  value : 100
}

export default b
复制代码
```

index.js

```js
import a from './a'
import b from './b'

var sum = a.value + b.value

console.log(sum)
复制代码
```

因为当前我们的环境是 `node`环境，为了在 `node`里面让 `import`生效，我们使用以下方法。

全局安装 babel-cli

```bash
npm install babel-cli -g
复制代码
```

安装 babel-preset-env

```bash
npm install babel-preset-env -D
复制代码
```

然后原来是 node server.js，改为这样调用：babel-node --presets env server.js

> 需要注意的是如果只是为了 babel-node 这一个命令，安装 babel-cli 会加载安装很多资源和模块，出于性能考虑不推荐在生产环境使用。自己在开发调试的时候，可以鼓捣着玩玩

下面我们在命令行执行以下操作，便可以看到结果。呀是不是有点跑偏了的感觉，我们是来分析 `index.js`文件的依赖项的呀，赶紧回到正题。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b710a7762a948648d8788e8faec0374~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

在项目下新建 `deps.ts`文件，在文章最后面我会把完整的代码放上来，一段一段贴代码，太浪费空间了。

最终我们得到了想要的结果。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c90c5e68110b48a29856f870af997ba2~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

### 递归分析嵌套的依赖

下面我们再加一点难度，假如我们的 `a.js`又依赖了其他的文件呢？ `b.js`也同样依赖了其他文件呢？我们又该如何获取到其内部文件依赖的依赖呢？我们继续

```bash
 cp -r project-01/ project-02
复制代码
```

```js
cd project-02

mkdir lib

复制代码
```

a.js

```js
import a1 from "./lib/a1.js"

var a = {
  value: 'a'
}

export default a
复制代码
```

b.js

```js
js
import b1 from "./lib/b1.js"

var b = {
  value : 100
}

export default b

复制代码
```

在之前的 `a.js`和 `b.js`里面分别把这两个文件 `import`进去， 这样就有更深层次的依赖关系了，我们下面只需要在遍历 `AST`语法树的时候，当发现这个节点是 `ImportDeclaration`的时候，再获取这个节点的值，组装一下真实的文件路径，再递归调用把组装好的路径传入 `collectCodeAndDeps`便可以继续分析了。

### 什么是循环依赖?

index.js

```js
import a from './a.js'
import b from './b.js'

console.log(a)
let sum = a.value + b.value

console.log(sum)
复制代码
```

a.js

```js
import b from './b.js'

var a = {
  value: b.value + 1
}

export default a
复制代码
```

b.js

```css
js
import a from './a.js'

var b = {
  value: a.value + 1
}

export default b
复制代码
```

我在node版本为 `v16.3.0`下面测试得到的结果。

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdc15c806dfe42a58515cb7d3870c146~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

如果我们把上面value的值换成一个常量的话，就可以正常执行完代码了。

### 静态分析循环依赖

在遍历 `AST`的时候如果发现在之前的记录里面已经有了，就不再进行遍历了。

```js

import { resolve, relative, dirname } from 'path'
import { readFileSync } from 'fs'

import { parse } from '@babel/parser'
import traverse from '@babel/traverse';

const projectRoot = resolve(__dirname, 'project-02')

var result = {
  'index.js': {
    deps: ['a.js', 'b.js'],
    code: "import a from './a'\r\nimport b from './b'\r\n\r\nvar sum = a.value + b.value \r\n\r\nconsole.log(sum)"
  }
}

type DepRelation = {
  [key: string]: {
    deps: string[],
    code: string
  }
}

interface a {

}

const depRelation: DepRelation = {}

function collectCodeAndDeps(filepath: string) {
  let key = getProjectPath(filepath)
  if (Object.keys(depRelation).includes(key)) {

    return
  }

  let code = readFileSync(resolve(filepath)).toString()

  depRelation[key] = {
    deps: [],
    code
  }

  let ast = parse(code, {
    sourceType: 'module'
  })

  traverse(ast, {
    enter: path => {

      if (path.node.type === 'ImportDeclaration') {

        let depAbsolutePath = resolve(dirname(filepath), path.node.source.value)

        const depProjectPath = getProjectPath(depAbsolutePath)

        depRelation[key].deps.push(depProjectPath)

        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })
}

collectCodeAndDeps(resolve(projectRoot, 'index.js'))

console.log(depRelation)

function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, '/')
}
复制代码
```

### 总结

#### AST相关

1. parse： 把代码转换成AST
2. traverse：遍历AST，并在需要的时候可以进行修改
3. generate：把AST再转换成代码code2

#### 工具相关

1. babel 可以把高级代码转换成ES5代码
2. @babel/parser
3. @babel/traverse
4. @babel/generate
5. @babel/core
6. @babel-preset-env 获取您指定的任何目标环境并根据其映射检查它们以编译插件列表并将其传递给 Babel

#### 代码技巧

用哈希表来存储映射关系 通过检查哈希表的key来检测重复

#### 循环依赖

有的循环依赖可以正常执行 有的循环依赖不可以正常执行 但是两者都可以进行静态分析

## 系列文章

[Webpack入门到精通 一（AST、Babel、依赖）](https://juejin.cn/post/6975885302493609991 "https://juejin.cn/post/6975885302493609991")

[Webpack入门到精通 二（核心原理）](https://juejin.cn/post/6978294079360598023 "https://juejin.cn/post/6978294079360598023")

[Webpack入门到精通 三（Loader原理）](https://juejin.cn/post/6980658561718812702 "https://juejin.cn/post/6980658561718812702")

[Webpack入门到精通 四（Plugin原理）](https://juejin.cn/post/7024127150412267556 "https://juejin.cn/post/7024127150412267556")

[Webpack入门到精通 五（常用配置）](https://juejin.cn/post/6981841495338778660 "https://juejin.cn/post/6981841495338778660")
