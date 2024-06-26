- [1.什么是静态资源](#1什么是静态资源)
- [2. 为什么动态添加的src会被当做的静态的资源？](#2-为什么动态添加的src会被当做的静态的资源)
- [3. 没有进行编译，是指的是什么没有被编译？](#3-没有进行编译是指的是什么没有被编译)
- [4. 加上require为什么能正确的引入资源，是因为加上require就能编译了？](#4-加上require为什么能正确的引入资源是因为加上require就能编译了)
  - [4.1 require是什么: 是一个node方法，用于引入模块，JSON或本地文件](#41-require是什么-是一个node方法用于引入模块json或本地文件)
  - [4.2 调用require方法引入一张图片之后发生了什么：](#42-调用require方法引入一张图片之后发生了什么)
- [6. 问题3中，静态的引入一张图片，没有使用require，为什么返回的依然是编译过后的文件地址？](#6-问题3中静态的引入一张图片没有使用require为什么返回的依然是编译过后的文件地址)
- [7. 按照问题6中所说，那么动态添加src的时候也会使用require引入，为什么src编译过后的地址，与图片资源编译过后的资源地址不一致](#7-按照问题6中所说那么动态添加src的时候也会使用require引入为什么src编译过后的地址与图片资源编译过后的资源地址不一致)
- [8.据说public下面的文件不会被编译，那我们使用静态路径去引入资源的时候，也会默认的使用require引入吗？](#8据说public下面的文件不会被编译那我们使用静态路径去引入资源的时候也会默认的使用require引入吗)
- [9.为什么使用public下的资源一定要绝对路径](#9为什么使用public下的资源一定要绝对路径)
- [10.上文件中提到的webpack，为什么引入资源的时候要有base64和打包到dist目录下两种的方式，全部打包到的dist目录下，他不香吗？](#10上文件中提到的webpack为什么引入资源的时候要有base64和打包到dist目录下两种的方式全部打包到的dist目录下他不香吗)

```
link: https://juejin.cn/post/7159921545144434718
title: vue中动态引入图片为什么要是require， 你不知道的那些事
description: 相信用过vue的小伙伴，肯定被面试官问过这样一个问题：在vue中动态的引入图片为什么要使用require 有些小伙伴，可能会轻蔑一笑：呵，就这，因为动态添加src被当做静态资源处理了，没有进行编译，所
keywords: 前端,Vue.js
author: 首页 首页 沸点 课程 直播 活动 竞赛 商城 App 插件 搜索历史 清空 创作者中心 写文章发沸点写笔记写代码草稿箱 会员 登录
date: 2022-10-29T13:13:04.000Z
publisher: 稀土掘金
stats: paragraph=91 sentences=64, words=180
```
相信用过vue的小伙伴，肯定被面试官问过这样一个问题： **在vue中动态的引入图片为什么要使用require**

有些小伙伴，可能会轻蔑一笑：呵，就这， **因为动态添加src被当做静态资源处理了，没有进行编译，所以要加上require，** 我倒着都能背出来......

emmm... 乍一看好像说的很有道理啊，但是仔细一看，这句话说的到底是个啥？针对上面的回答，我不禁有如下几个疑问：

1. 什么是静态资源？
2. 为什么动态添加的src会被当做的静态的资源？
3. 没有进行编译，是指为是什么没有被编译？
4. 加上require为什么能正确的引入资源，是因为加上require就能编译了？

当我产生最后一个疑问的时候，发现上面的答案看似说了些啥，但好像又什么都没说...... 如果各位看官老爷也有如上几个疑问，那就让我给大家一一解惑

## 1.什么是静态资源

与静态资源相对应的还有一个动态资源，先让我们看看网上的各位大佬们怎么解释的。

> 静态资源：一般客户端发送请求到web服务器，web服务器从内存在取到相应的文件，返回给客户端，客户端解析并渲染显示出来。
动态资源：一般客户端请求的动态资源，先将请求交于web容器，web容器连接数据库，数据库处理数据之后，将内容交给web服务器，web服务器返回给客户端解析渲染处理。

其实上面的总结已经很清晰了。站在一个vue项目的角度，我们可以简单的理解为：

**静态资源就是直接存放在项目中的资源，这些资源不需要我们发送专门的请求进行获取**。比如assets目录下面的图片，视频，音频，字体文件，css样式表等。

**动态资源就是需要发送请求获取到的资源**。比如我们刷淘宝的时候，不同的商品信息是发送的专门的请求获取到的，就可以称之为动态资源。

## 2. 为什么动态添加的src会被当做的静态的资源？

回答这个问题之前，我们需要了解一下，浏览器是怎么能运行一个vue项目的。

我们知道浏览器打开一个网页，实际上运行的是html，css，js三种类型的文件。当我们本地启动一个vue项目的时候，实际上是先将vue项目进行打包，打包的过程就是将项目中的一个个vue文件转编译成html，css，js文件的过程，而后再在浏览器上运行的。

那动态添加的src如果我们没有使用require引入，最终会打包成什么样子呢，我带大家实验一波。

```js

  <div class="home">

    <img :src="'../assets/logo.png'" alt="logo">
  div>
template>

<img src="../assets/logo.png" alt="logo">
复制代码
```

我们可以看出， **动态添加的src最终会编译成一个静态的字符串地址。程序运行的时候，会按照这个地址去项目目录中引入资源。而 去项目目录中引入资源的这种方式，就是将该资源当成了静态资源**。所以这也就回答了我们的问题2。

看到这里估计就有小伙伴疑惑了，这个最终被编译的地址有什么问题吗？我项目中的图片就是这个地址，为什么无法引入？别急，我们继续往下看。

## 3. 没有进行编译，是指的是什么没有被编译？

没有进行编译。这半句话，就听得很让人懵逼了。按照问题2我们知道这个动态引入的图片最终是被编译了，只是被编译之后无法正确的引入图片资源而已。所以这句话本来就是错的。针对于我们的标准答案，我在这里进行改写：

**因为动态添加src被当做静态资源处理了，而被编译过后的静态路径无法正确的引入资源，所以要加上require**

那这里就诞生了一个新的疑问： **被编译过后的静态路径为什么无法正确的引入资源？**

想得到这个问题的答案，我们得先从正常的引入一张图片开始。在项目中我们静态的引入一张图片肯定是可以引入成功的，而引用图片所在的vue文件肯定也是被编译的，那静态引入图片最终会被编译成什么样呢，模拟一波：

```js

  <div class="home">

    <img src="../assets/logo.png" alt="logo">
  div>
template>

<img src="/img/logo.6c137b82.png" alt="logo">
复制代码
```

根据上面的测试，我们发现，使用静态的地址去引入一张图片，图片的路径和图片的名称已经发生了改变，并且编译后过后的静态地址是可以成功的引入资源的。这是因为，在默认情况下，src目录下面的所有文件都会被打包，src下面的图片也会被打包在新的文件夹下并生成新的文件名。编译过后的静态地址引入的是打包过后的图片地址，从而可以正确的引用资源

事实确实是这样吗？我们可以执行打包命令（npm run build）进行验证

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61b062abbeca41629336ed3b792e0f39~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

可以发现，编译过后的静态地址确实是和dist下编译后图片地址是一致的，从而验证我们的想法。

到这里我们其实就可以解释上面的问题了：动态添加的src，被编译过后的静态路径为什么无法正确的引入资源？

**因为动态的添加的src编译过后的地址，与图片资源编译过后的资源地址不一致， 导致无法正确的引入资源**

```bash
  编译过后的src地址：../assets/logo.png
  编译过后的图片资源地址：/img/logo.6c137b82.png
复制代码
```

那要怎么解决上述的问题呢，答案就是：require

## 4. 加上require为什么能正确的引入资源，是因为加上require就能编译了？

针对这个问题，首先就要否定后半句，无论加不加require，vue文件中引入一张图片都会被编译。

接着我们再来好好了解一下，require。

### 4.1 require是什么: 是一个node方法，用于引入模块，JSON或本地文件

### 4.2 调用require方法引入一张图片之后发生了什么：

在回答这个问题之前，容我先对问题3中的内容进行一定的补充。其实如果真的有小伙伴跟着问题三中的操作进行验证，估计就要开喷了：为什么我静态引入的图片最终编译的地址和你的不一样，是个base64，而且打包之后dist下面也没有生成新的图片。大概就是下面这样的情况。

```js

<div class="home">

  <img src="../assets/logo.png" alt="logo">
div>
template>

<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk2QkI4RkE3NjE2MTFFNUE4NEU4RkIxNjQ5MTYyRDgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk2QkI4Rjk3NjE2MTFFNUE4NEU4RkIxNjQ5MTYyRDgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjU2QTEyNzk3NjkyMTFFMzkxODk4RDkwQkY4Q0U0NzYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjU2QTEyN0E3NjkyMTFFMzkxODk4RDkwQkY4Q0U0NzYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5WHowqAAAXNElEQVR42uxda4xd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" alt="logo">
复制代码
```

先别急着喷，实际上造成这种差异的原因，是因为我改了一下webpack中的配置。接下来涉及少量webpack代码，不了解webpack的小伙伴也没关系，了解原理即可。

在上文中的我们提到，vue项目最终会被打包成一个dist目录，那么是什么帮我们完成这个打包的呢，没错，就是webpack。在vue项目中的引入一张图片的时候，细心的同学会发现，有的时候，浏览器上显示图片地址是一个base64，有的时候，是一个被编译过后的文件地址。也就是上述描述的差异。

之所以会造成这种差异，是webpack打包的时候，对图片资源进行了相关的配置。我们可以通过如下命令生成vue项目中的webpack配置文件，进行验证：

> _npx vue-cli-service inspect --mode development >> webpack.config.development.js_

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8300369c4b404e838bc5be25149965bb~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

上图就是vue中webpack默认的图片打包规则。设置 type: 'asset'，默认的，对于小于8k的图片，会将图片转成base64 直接插入图片，不会再在dist目录生成新图片。对于大于8k的图片，会打包进dist目录，之后将新图片地址返回给src。

而我在上述测试中使用的图片，是vue-cli自带的一张logo图片，大小是6.69k。按照默认的打包规则，是会转成base64，嵌入图片中的。所以为了讲述方便，我在vue.config.js中修改了其默认的配置，配置如下：

```scss
module.exports = {

  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {

              maxSize: 1024 * 6
            }
          }
        }
      ]
    }
  }
}
复制代码
```

那上面说了这么多，和require有啥关系，自然是有滴。

我们现在知道vue最终是通过webpack打包，并且会在webpack配置文件中编写一系列打包规则。而webpack中的打包规则，针对的其实是一个一个模块，换而言之webpack只会对模块进行打包。那webpack怎么将图片当成一个模块呢，这就要用到我们的正主require。

当我们使用require方法引入一张图片的时候，webpack会将这张图片当成一个模块，并根据配置文件中的规则进行打包。 **我们可以将require当成一个桥梁，使用了require方法引入的资源，该资源就会当成模块并根据配置文件进行打包，并返回最终的打包结果。**

回到问题4.2：调用require方法引入一张图片之后发生了什么

**1.如果这张图片小于项目中设置的资源限制大小，则会返回图片的base64插入到require方法的调用处**

**2.如果这张图片大于项目中设置的资源限制大小，则会将这个图片编译成一个新的图片资源。require方法返回新的图片资源路径及文件名**

回到问题4：为什么加上require能正确的引入资源

**因为通过require方法拿到的文件地址，是资源文件编译过后的文件地址（dist下生成的文件或base64文件），因此可以找对应的文件，从而成功引入资源。**

答案就是这么简单，来验证一波

```js

  <div class="home">

      <img :src="require('../assets/logo.png')" alt="logo">
  div>
template>

<img src="/img/logo.6c137b82.png" alt="logo">
复制代码
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c8ee365c90a4653a1d7eb381fb071e9~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image?)

有问题吗，没有问题。到这里，不妨再对我们的标准答案进行一次优化：

**因为动态添加的src，编译过后的文件地址和被编译过后的资源文件地址不一致，从而无法正确引入资源。而使用require，返回的就是资源文件被编译后的文件地址，从而可以正确的引入资源**

看到这，估计还是有一些小伙伴有一些疑问，我再扩展一波：

## 6. 问题3中，静态的引入一张图片，没有使用require，为什么返回的依然是编译过后的文件地址？

答：在webpack编译的vue文件的时候，遇见src等属性会默认的使用require引入资源路径。引用vue-cli官方的一段原话

> 当你在 JavaScript、CSS 或 `*.vue` 文件中使用相对路径 (必须以 `.` 开头) 引用一个静态资源时，该资源将会被包含进入 webpack 的依赖图中。在其编译过程中，所有诸如 `<img src="...">`、 `background: url(...)` 和 CSS `@import` 的资源 URL **都会被解析为一个模块依赖**。
例如， `url(./image.png)` 会被翻译为 `require('./image.png')`，而：

```ini
src="./image.png">
复制代码
```

将会被编译到：

```css
h('img', { attrs: { src: require('./image.png') }})
复制代码
```

## 7. 按照问题6中所说，那么动态添加src的时候也会使用require引入，为什么src编译过后的地址，与图片资源编译过后的资源地址不一致

答：因为动态引入一张图片的时候，src后面的属性值，实际上是一个变量。webpack会根据v-bind指令去解析src后面的属性值。并不会通过reuqire引入资源路径。这也是为什么需要手动的添加require。

## 8.据说public下面的文件不会被编译，那我们使用静态路径去引入资源的时候，也会默认的使用require引入吗？

官方的原文是这样子的：

> 任何放置在 `public` 文件夹的静态资源都会被简单的复制，而不经过 webpack。你需要通过绝对路径来引用它们。

答：不会，使用require引入资源的前提的该资源是webpack解析的模块，而public下的文件压根就不会走编译，也就不会使用到require。

## 9.为什么使用public下的资源一定要绝对路径

答：因为虽然public文件不会被编译，但是src下的文件都会被编译。由于引入的是public下的资源，不会走require，会直接返回代码中的定义的文件地址，该地址无法在编译后的文件目录（dist目录）下找到对应的文件，会导致引入资源失败。

## 10.上文件中提到的webpack，为什么引入资源的时候要有base64和打包到dist目录下两种的方式，全部打包到的dist目录下，他不香吗？

答：为了减少http请求。页面中通过路径引入的图片，实际上都会向服务器发送一个请求拿到这张图片。对于资源较小的文件，设置成base64，既可以减少请求，也不会影响到页面的加载性能。

以上就是今天的全部内容啦，谢谢各位看官老爷的观看。不好的地方，还请包涵。不对的地方，还请指正。

* 参考链接：[cli.vuejs.org/zh/](https://link.juejin.cn?target=https%3A%2F%2Fcli.vuejs.org%2Fzh%2F "https://cli.vuejs.org/zh/")
* 参考链接：[wjhsh.net/vickylinj-p...](https://link.juejin.cn?target=http%3A%2F%2Fwjhsh.net%2Fvickylinj-p-15599154.html "http://wjhsh.net/vickylinj-p-15599154.html")
