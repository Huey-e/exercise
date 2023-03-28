- [前言](#前言)
- [前置问题](#前置问题)
- [插件的基本结构](#插件的基本结构)
  - [使用插件](#使用插件)
  - [定义插件](#定义插件)
- [插件是如何工作的？](#插件是如何工作的)
- [node events \&\& tabable](#node-events--tabable)
  - [node](#node)
  - [tapable](#tapable)
  - [实现一个简单的tapable](#实现一个简单的tapable)
  - [理解Sync类型的钩子](#理解sync类型的钩子)
    - [1、SyncHook](#1synchook)
  - [理解Async类型的钩子](#理解async类型的钩子)
    - [1、AsyncSeriesHook](#1asyncserieshook)
  - [tapable和webpack是如何关联起来的](#tapable和webpack是如何关联起来的)
- [webpack构建流程](#webpack构建流程)
- [compiler(负责编译)](#compiler负责编译)
- [compilation(负责创建bundles)](#compilation负责创建bundles)
- [常用API](#常用api)
- [系列文章](#系列文章)

## 前言

前面我们学习了 `webpack`的核心功能如何实现源代码的转换以及打包。

1. 基于 `@babel/parser`把字符串转换成 `AST`抽象语法树。
2. 对 `AST`进行修改，既对源代码的修改。
3. 使用 `babel`的 `API`再把修改后的 `AST`转换成新的字符串（期望的代码）。
4. 以及了解了 `css-loader`和 `style-loader`的基本实现。

下面我们学习一下 `plugin`的使用场景以及工作原理。

## 前置问题

1. 一个插件的基本代码结构
2. webpack的构建流程
3. Tapable自身有什么作用，以及如何把webpack的各个插件串联起来的？
4. `compiler`以及 `compilation`对象的作用以及主要的API

## 插件的基本结构

这里写的是一个简版的 `md`文件转换成 `html`文件的一个案例

### 使用插件

```js
const {resolve} = require('path')
const MdToHtmlPlugin = require('./plugins/md-to-html-plugin')

module.exports = {
  mode: 'development',
  entry: resolve(__dirname, 'src/app.js'),
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  plugins: [
    new MdToHtmlPlugin({
      template: resolve(__dirname, 'test.md'),
      filename: 'test.html'
    })
  ]
}
复制代码
```

### 定义插件

```js
const fs = require('fs')
const path = require('path')

function mdToHtml(mdStr) {
  let html = ''

  let mdArrTemp = mdStr.split('\n').filter(item => item !== "")

  let olReg = /\d\.\s/,
      ulReg = /\-\s/,
      h2Reg = /\#{2}\s/

  mdArrTemp.forEach((item, index) => {

    let prev = mdArrTemp[index - 1];
    let next = mdArrTemp[index + 1];

    if (h2Reg.test(item)) {
      html += item.replace(h2Reg, "");
      html += "\n";
    } else if (ulReg.test(item)) {
      if (!prev || !ulReg.test(prev)) {
        html += "\n";
      }
      html += item.replace(ulReg, "  ");
      html += "\n";
      if (!next || !ulReg.test(next)) {
        html += "\n";
      }
    } else if (olReg.test(item)) {
      if (!prev || !olReg.test(prev)) {
        html += "\n";
      }
      html += item.replace(olReg, "  ");
      html += "\n";
      if (!next || !olReg.test(next)) {
        html += "\n";
      }
    }
  })
  return html
}

class MdToHtmlPlugin {

  constructor({template, filename}) {
    if(!template) {
      throw new Error('"template" must be configured')
    }
    this.template = template
    this.filename = filename
  }

  apply(compiler) {
    compiler.hooks.emit.tap("md-to-html-plugin", (compilation) => {
      let _assets = compilation.assets

      let mdContent = fs.readFileSync(this.template, "utf-8");
      let htmlTemplateContent = fs.readFileSync(path.resolve(__dirname, './template.html')).toString()
      let html = mdToHtml(mdContent)

      let genHtml = htmlTemplateContent.replace("", html);
      fs.writeFileSync(path.resolve(__dirname, '../../dist/'+this.filename), genHtml, 'utf-8')
    });
  }
}

module.exports = MdToHtmlPlugin;
复制代码
```

## 插件是如何工作的？

1. 在读取webpack配置的过程中我们先使用 `new MdToHtmlPlugin(options)` 初始化了一个 `MdToHtmlPlugin`实例
2. 也在其他代码中初始化了 `compiler`对象，调用了 `MdToHtmlPlugin.apply(compiler)`方法，给插件传入 `compiler`对象。
3. 插件获取到 `compiler`对象，就可以通过调用 `compiler.hooks.<hook name>.call</hook>`。具体的事件在文档中有体现。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7581bbfd4cab4e7a9981177ff4556bf1~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

## node events && tabable

### node

events 模块只提供了一个对象： events.EventEmitter。EventEmitter 的核心就是事件触发与事件监听器功能的封装。

```js
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
event.on('some_event', function() {
    console.log('some_event 事件触发');
});
setTimeout(function() {
    event.emit('some_event');
}, 1000);
复制代码
```

### tapable

[github tapable](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Ftapable%23tapable "https://github.com/webpack/tapable#tapable")

```js
const {
SyncHook,
SyncBailHook,
SyncWaterfallHook,
SyncLoopHook,
AsyncParallelHook,
AsyncParallelBailHook,
AsyncSeriesHook,
AsyncSeriesBailHook,
AsyncSeriesWaterfallHook
} = require("tapable");

复制代码
```

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b7068f04a664907a8bb82c72352fe15~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

### 实现一个简单的tapable

```js
class Hook{
    constructor(args){
        this.taps = []
        this._args = args
    }
    tap(name,fn){
        this.taps.push({name,fn})
    }
}
class SyncHook extends Hook{
    call(name,fn){
        try {
            this.taps.forEach(tap => tap.fn(name))
            fn(null,name)
        } catch (error) {
            fn(error)
        }

    }
}

let $ = new SyncHook()
$.tap('xx', () => {console.log('xx')})
$.call('xx', () => {console.log('xx called')})
复制代码
```

### 理解Sync类型的钩子

#### 1、SyncHook

```js
const {SyncHook} = require('tapable')

const syncHook = new SyncHook(['name', 'age'])

syncHook.tap('1', (name, age) => {
  console.log('1' ,name , age)
})

syncHook.tap("2", (name, age) => {
  console.log("2", name, age);
});

syncHook.tap("3", (name, age) => {
  console.log("3", name, age);
});

syncHook.call('天明', 10)
复制代码
```

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a137b6051b96461eba328bc3f70607cb~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

### 理解Async类型的钩子

#### 1、AsyncSeriesHook

```js
const { AsyncSeriesHook } = require("tapable");

const asyncSeriesHook = new AsyncSeriesHook(["name", "age"]);

asyncSeriesHook.tapAsync("1", (name, age, done) => {
  setTimeout(() => {
    console.log("1", name, age, new Date());
    done();
  }, 1000);
});

asyncSeriesHook.tapAsync("2", (name, age, done) => {
  setTimeout(() => {
    console.log("2", name, age, new Date());
    done();
  }, 2000);
});

asyncSeriesHook.tapAsync("3", (name, age, done) => {
  setTimeout(() => {
    console.log("3", name, age, new Date());
    done();
  }, 3000);
});

asyncSeriesHook.callAsync("月儿", 10, () => {
  console.log("执行完成");
});
复制代码
```

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec5d656e31d14a749dece0f8e57c6aba~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

### tapable和webpack是如何关联起来的

Compiler.js

```js
const { AsyncSeriesHook ,SyncHook } = require("tapable");

class Compiler {
  constructor(options) {

    this.hooks = {
      run: new SyncHook(["run"]),
      compile: new AsyncSeriesHook(["name", "age"]),
      done: new SyncHook(['done'])
    };
    options.plugins[0].apply(this);
  }
  run() {

    this.hooks.run.call();
    this.compile()
  }
  compile() {

    this.hooks.compile.callAsync("月儿", 10, (err) => {
      this.done();
    });
  }
  done() {
    this.hooks.done.call();
  }
}
module.exports = Compiler
复制代码
```

* MyPlugin.js

```js
const Compiler = require("./Compiler");

class MyPlugin {
  apply(compiler) {

    compiler.hooks.run.tap("MyPlugin", () => console.log("开始编译..."));

    compiler.hooks.compile.tapAsync("MyPlugin", (name, age, done) => {
      setTimeout(() => {
        console.log(`编译中...收到参数name：${name}-age:${age}编译中...`);
        done();
      }, 3000);
    });

    compiler.hooks.done.tap("MyPlugin", () => console.log("结束编译..."));
  }
}

const myPlugin = new MyPlugin();

const options = {
  plugins: [myPlugin],
};
let compiler = new Compiler(options);
compiler.run();

复制代码
```

运行完上面这段代码，会得到以下的输出。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9cea850c69f14b628ef3539e03388f59~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?) 顺便吐槽一下原文中的代码，看了好几个版本的代码。 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f0a3f1510a84c0f89a6b129e9139359~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b062f4f703364565b8d618ac9b157c65~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

## webpack构建流程

1. 校验配置文件 ：读取命令行传入或者 `webpack.config.js`文件，初始化本次构建的配置参数
2. 生成 `Compiler`对象：执行配置文件中的插件实例化语句 `new MyWebpackPlugin()`，为 `webpack`事件流挂上自定义 `hooks`
3. 进入 `entryOption`阶段： `webpack`开始读取配置的 `Entries`，递归遍历所有的入口文件
4. `run/watch`：如果运行在 `watch`模式则执行 `watch`方法，否则执行 `run`方法
5. `compilation`：创建 `Compilation`对象回调 `compilation`相关钩子，依次进入每一个入口文件(`entry`)，使用loader对文件进行编译。通过 `compilation`我可以可以读取到 `module`的 `resource`（资源路径）、 `loaders`（使用的loader）等信息。再将编译好的文件内容使用 `acorn`解析生成AST静态语法树。然后递归、重复的执行这个过程， 所有模块和和依赖分析完成后，执行 `compilation` 的 `seal` 方法对每个 chunk 进行整理、优化、封装 `__webpack_require__`来模拟模块化操作.

6. `emit`：所有文件的编译及转化都已经完成，包含了最终输出的资源，我们可以在传入事件回调的 `compilation.assets`上拿到所需数据，其中包括即将输出的资源、代码块Chunk等等信息。

```js

compilation.assets['new-file.js'] = {
  source() {
    return 'var a=1';
  },
  size() {
    return this.source().length;
  }
};
复制代码
复制代码
```

1. `afterEmit`：文件已经写入磁盘完成
2. `done`：完成编译 还是的配一张图![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bc6da21395c44229ca8637de1570649~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

## compiler(负责编译)

`Compiler` 模块是 webpack 的主要引擎，它通过 [CLI](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fcli "https://webpack.docschina.org/api/cli") 或者 [Node API](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fnode "https://webpack.docschina.org/api/node") 传递的所有选项创建出一个 compilation 实例。 它扩展（extends）自 `Tapable` 类，用来注册和调用插件。 大多数面向用户的插件会首先在 `Compiler` 上注册。

在为 webpack 开发插件时，你可能需要知道每个钩子函数是在哪里调用的。想要了解这些内容，请在 webpack 源码中搜索 `hooks.<hook name>.call</hook>`。 [参考webpack中文文档plugins](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fcompiler-hooks%2F "https://webpack.docschina.org/api/compiler-hooks/")

## compilation(负责创建bundles)

简单来说, `Compilation`的职责就是构建模块和Chunk，并利用插件优化构建过程。

## 常用API

```js
compilation.hooks.optimizeChunkAssets.tapAsync(
  'MyPlugin',
  (chunks, callback) => {
    chunks.forEach((chunk) => {
      chunk.files.forEach((file) => {
        compilation.assets[file] = new ConcatSource(
          '/**Sweet Banner**/',
          '\n',
          compilation.assets[file]
        );
      });
    });

    callback();
  }
);
复制代码
```

[webpack 文档链接](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fcompilation-hooks%2F%23optimizechunkassets "https://webpack.docschina.org/api/compilation-hooks/#optimizechunkassets")

参考文献

[cnblogs](https://link.juejin.cn?target=https%3A%2F%2Fwww.cnblogs.com%2Ftugenhua0707%2Fp%2F11317557.html "https://www.cnblogs.com/tugenhua0707/p/11317557.html") [掘金](https://juejin.cn/post/6844904161515929614#heading-14 "https://juejin.cn/post/6844904161515929614#heading-14")

## 系列文章

[Webpack入门到精通 一（AST、Babel、依赖）](https://juejin.cn/post/6975885302493609991 "https://juejin.cn/post/6975885302493609991")

[Webpack入门到精通 二（核心原理）](https://juejin.cn/post/6978294079360598023 "https://juejin.cn/post/6978294079360598023")

[Webpack入门到精通 三（Loader原理）](https://juejin.cn/post/6980658561718812702 "https://juejin.cn/post/6980658561718812702")

[Webpack入门到精通 四（Plugin原理）](https://juejin.cn/post/7024127150412267556 "https://juejin.cn/post/7024127150412267556")

[Webpack入门到精通 五（常用配置）](https://juejin.cn/post/6981841495338778660 "https://juejin.cn/post/6981841495338778660")
