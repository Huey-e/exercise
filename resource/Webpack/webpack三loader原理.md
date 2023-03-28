- [如何加载CSS文件](#如何加载css文件)
  - [当前](#当前)
  - [目标](#目标)
  - [测试](#测试)
- [创建CSS Loader](#创建css-loader)
  - [loader长什么样子？](#loader长什么样子)
- [发现打包器的问题](#发现打包器的问题)
  - [单一职责原则](#单一职责原则)
- [loader面试题](#loader面试题)
- [系列文章](#系列文章)

## 如何加载CSS文件

当前我们的打包器可以把多个文件打包到一个 `js`文件中去，现在我们要支持当 `import xxx.css`文件要可以生效。先来看一下我们目前的思路。

### 当前

* 当前的 `bundler`只能打包 `js`文件
* 我们想要加载 `css`文件

### 目标

如果我们把 `css`文件变成 `js`，那么是不是可以加载 `css`文件了呢？我们顺着这个思路开始在之前的代码中继续编写。我们只需要在读取到 `css`文件之后修改文件里面的内容如下

```js
 let code = readFileSync(resolve(filepath)).toString()

  if(/\.css$/.test(filepath)){
    code = `
     const str = ${JSON.stringify(code)}
     //如果document存在，就动态创建一个style标签插入到head里面
     if(document){
       const style = document.createElement('style')
       style.innerHTML = str
       document.head.appendChild(style)
     }
     export default str
    `
  }

  const { code: es5Code } = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
复制代码
```

### 测试

在当前项目下面新建 `project-css`

新增 `index.js`

```js
console.log(12342423)
import './style.css'
复制代码
```

新增 `style.css`

```css
body{
  color: rebeccapurple;
}
复制代码
```

新增 `index.html`

```html

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documenttitle>
head>
<body>
  <h1>Css加载成功h1>
  <script src="dist.js">script>
body>
html>
复制代码
```

修改 `bundler_css.ts`里面的 `&#x5165;&#x53E3;&#x6587;&#x4EF6;`和 `&#x51FA;&#x53E3;&#x6587;&#x4EF6;`

```js

const projectRoot = resolve(__dirname, 'project-css')

writeFileSync('./project-css/dist.js', generateCode())
复制代码
```

运行以下命令

```bash
 npx ts-node bundler_css.ts
复制代码
```

会在 `project-css`文件夹下面生成 `dist.js`文件。

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e16e2ac660349c78a92b416ca6de24c~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 我们在浏览查看 `index.html`

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c06080d710243e0a83637bab2e1d5c4~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 如果你看到了当前的效果说明你的打包器现在已经支持打包 `.css`文件啦。

## 创建CSS Loader

首先说一下

### loader长什么样子？

* 一个 `loader`可以是一个普通函数

```js
function transform(code){
  const code2 = doSomething(code)
  return code2
}
module.exports = transform
复制代码
```

* 一个 `loader`也可以是一个异步函数

```js
async function transform(code){
  const code2 = await doSomething(code)
  return code2
}
module.exports = transform

复制代码
```

`-`中划线表示连接, `_`下划线表示间隔。

上面我们已经成功的让打包器支持了 `css`文件，接着我们想，可不可以将处理 `css`代码的这块逻辑分离出去呢？带着这个思路，我们继续开始。

`+`loaders/css-loader.js

```js
const transform = code => `
const str = ${JSON.stringify(code)}
if (document) {
  const style = document.createElement('style')
  style.innerHTML = str
  document.head.appendChild(style)
}
export default str
`

module.exports = transform
复制代码
```

拷贝一份之前的打包器文件,进行修改，如下，同样也可以实现之前的功能，不一样的地方就在于把 `css`转换成 `js`和把 `style`代码加入到 `head`里面的代码与打包器的代码进行了分离。仅此而已

```js
 let code = readFileSync(resolve(filepath)).toString()

  if(/\.css$/.test(filepath)){
    code = require('./loaders/css-loader.js')(code)
  }

  const { code: es5Code } = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
复制代码
```

## 发现打包器的问题

### 单一职责原则

`webpack`里面的 `loader`只做一件事情，现在我们的 `css-loader`做了两件事情

1. 把 `css`转成了 `js`字符串。
2. 把 `js`字符串放到了 `style`标签里面。

所以我们试图把现在的 `css-loader`拆成两个 `css-loader`和 `style-loader`

css-loader

```js
const transform = code => code

module.exports = transform
复制代码
```

style-loader

```js
const transform = code => `
if (document) {
  const style = document.createElement('style')
  style.innerHTML = ${JSON.stringify(code)}
  document.head.appendChild(style)
}
`
module.exports = transform
复制代码
```

我们检测到如果是 `.css`结尾的就把文件内容当做字符串保存起来，接下来调用 `style-loader`把这段字符串插入到页面里面就可以了。

```js
 let code = readFileSync(resolve(filepath)).toString()

  if(/\.css$/.test(filepath)){
    code = require('./loaders/css-loader.js')(code)
    code = require('./loaders/style-loader.js')(code)
  }

  const { code: es5Code } = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
复制代码
```

## loader面试题

`webpack`的 `loader`是什么？

1. `webpack`自带的打包功能支持打包 `js`文件。
2. 在我们项目中要想加载 `css/less/ts/md`文件的时候，就需要用到 `loader`了
3. `loader`的原理就是把文件内容包装成能够运行的 `js` 比如
4. 加载 `css`的时候就需要用到 `css-loader`和 `style-loader`
5. `css-loader`负责把 `css`源代码变成 `export default str`的 `js`代码形式。
6. `style-loader`负责把源码挂载到 `head`里面的 `style`标签里

## 系列文章

[Webpack入门到精通 一（AST、Babel、依赖）](https://juejin.cn/post/6975885302493609991 "https://juejin.cn/post/6975885302493609991")

[Webpack入门到精通 二（核心原理）](https://juejin.cn/post/6978294079360598023 "https://juejin.cn/post/6978294079360598023")

[Webpack入门到精通 三（Loader原理）](https://juejin.cn/post/6980658561718812702 "https://juejin.cn/post/6980658561718812702")

[Webpack入门到精通 四（Plugin原理）](https://juejin.cn/post/7024127150412267556 "https://juejin.cn/post/7024127150412267556")

[Webpack入门到精通 五（常用配置）](https://juejin.cn/post/6981841495338778660 "https://juejin.cn/post/6981841495338778660")
