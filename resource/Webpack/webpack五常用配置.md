- [初始化项目](#初始化项目)
- [webpack build 支持IE](#webpack-build-支持ie)
- [用babel-loader打包js](#用babel-loader打包js)
- [用babel-laoder打包jsx](#用babel-laoder打包jsx)
- [给webpack配置eslint](#给webpack配置eslint)
- [用babel-loader打包TypeScript](#用babel-loader打包typescript)
- [让eslint支持TypeScript](#让eslint支持typescript)
- [用babel-loader打包tsx](#用babel-loader打包tsx)
- [CRLF 是什么？](#crlf-是什么)
  - [一、LF和CRLF是什么](#一lf和crlf是什么)
  - [二、LF和CRLF区别](#二lf和crlf区别)
- [让js和ts支持@alias](#让js和ts支持alias)
- [让webpack支持scss](#让webpack支持scss)
- [scss自动import全局文件](#scss自动import全局文件)
- [scss分享变量给js](#scss分享变量给js)
- [webpack支持less文件](#webpack支持less文件)
- [less分享给js](#less分享给js)
- [对比scss 和less](#对比scss-和less)
- [stylus文件](#stylus文件)
- [webpack config 重构](#webpack-config-重构)
- [生产页面单独提取css文件](#生产页面单独提取css文件)
- [自动生成HTML页面](#自动生成html页面)
- [webpack优化 单独打包runtime](#webpack优化-单独打包runtime)
- [为什么要单独打包runtime](#为什么要单独打包runtime)
- [webpack优化 用splitChunks将node依赖单独打包](#webpack优化-用splitchunks将node依赖单独打包)
- [webpack优化 固定modules](#webpack优化-固定modules)
- [webpack 多页面](#webpack-多页面)
- [webpack优化 common插件](#webpack优化-common插件)
- [无限多页面的实现思路](#无限多页面的实现思路)
- [系列文章](#系列文章)

## 初始化项目

```bash
mkdir webpack-config-demo

yarn init -y

yarn add webpack webpack-cli
复制代码
```

package.json中添加

```js
 "scripts": {
    "build": "webpack"
  },
复制代码
```

```js
+ src/index.js

const fn = ()=>{
  var a = 100
  var b = 100
  setTimeout(()=>{
    console.log(a + b)
  })
}

fn()
复制代码
```

运行 `yarn build`,就会看见当前打包好的 `dist.js`文件

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/444192382a8b466da40c4399b7f9893b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## webpack build 支持IE

```txt
+ browserslistrc文件

[production]
> 1%
ie 9

[modern]
last 1 chrome version
last 1 firefox version

[ssr]
node 12
复制代码
```

## 用babel-loader打包js

[babel-loader npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fbabel-loader "https://www.npmjs.com/package/babel-loader")

```bash
yarn add -D babel-loader @babel/core @babel/preset-env
复制代码
```

```js
+ webpack.config.js

module.exports = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env'],
              ['@babel/preset-react',
                {
                  runtime: 'classic'
                }
              ]
            ]
          }
        }
      }
    ]
  }
}
复制代码
```

## 用babel-laoder打包jsx

```bash
yarn add @babel/preset-react
复制代码
```

```js

use: {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ]
  }
}
复制代码
```

测试

```js
src/index.js

import JsxDemo from'./jsx-demo.jsx'

console.log(JsxDemo)
复制代码
```

```js
+ src/jsx-demo.jsx

const JsxDemo = () => {
  return (
    <div>jsx-demodiv>
  )
}

export default JsxDemo
复制代码
```

yarn build

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf3c88cbb8904b43b847c174fd4982e3~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 给webpack配置eslint

eslint-config-react-app 此包包含Create React App使用的可共享 ESLint 配置。[npm link](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Feslint-config-react-app "https://www.npmjs.com/package/eslint-config-react-app")

```bash
yarn add -D
eslint-config-react-app
@typescript-eslint/eslint-plugin@^4.0.0
@typescript-eslint/parser@^4.0.0
babel-eslint@^10.0.0
eslint@^7.5.0
eslint-plugin-flowtype@^5.2.0
eslint-plugin-import@^2.22.0
eslint-plugin-jsx-a11y@^6.3.1
eslint-plugin-react@^7.20.3
eslint-plugin-react-hooks@^4.0.8
复制代码
```

```js
+ .eslintrc.js

module.exports = {

  "extends": "react-app",
  rules: {

    'react/jsx-uses-react': [2],

    'react/react-in-jsx-scope': [2],
    'no-console': [0]
  },
}
复制代码
```

让 `webpack`可以感知到 `eslint`的配置,从而在编译的过程中提示报错信息

```bash
yarn add eslint-webpack-plugin -D
复制代码
```

```js
webpack/config.js

const ESLintPlugin = require('eslint-webpack-plugin');
module.exports = {

  plugins: [new ESLintPlugin({
    extensions: ['.js', '.jsx']
  })],

};
复制代码
```

在没加 `eslint-webpack-plugin`之前虽然我们发现在编辑器中 `eslint`给我们报错了，但是在我们运行 `yarn build`的时候他还是可以编译成功的。如下图

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd054f819e40499895a868a409abd632~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

下面我们来看看加完之后的情况，这个时候，不仅 `eslint`报错了 `webpack`构建的时候也会在控制台报错，这样就很好地使用了 `eslint`。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/565d2b0e82cf44c5a1dc67adb0737f0c~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 用babel-loader打包TypeScript

```bash
yarn add @babel/preset-typescript -D
复制代码
```

[babel 官网](https://link.juejin.cn?target=https%3A%2F%2Fwww.babeljs.cn%2Fdocs%2Fbabel-preset-typescript "https://www.babeljs.cn/docs/babel-preset-typescript")

```js
webpack.config.js

test: /\.[tj]sx?$/,
presets: [['@babel/preset-typescript']]
复制代码
```

添加一个 `test.tsx`，并且在 `index.js`中引入,以下结果编译成功。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6fb2f0a9889946d09d754a73397bc2b6~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 让eslint支持TypeScript

让 `eslint`支持 `ts`,添加相关的配置。

```bash
yarn add eslint-config-airbnb-typescript @types/react -D
复制代码
```

```js
.eslintrc.js

  overrides: [{
    files: ['*.ts', '*.tsx'],
    parserOptions: {
      project: './tsconfig.json',
    },
    extends: ['airbnb-typescript'],
    rules: {
      '@typescript-eslint/object-curly-spacing': [0],
      'import/prefer-default-export': [0],
      'no-console': [0],
      'import/extensions': [0]
    }
  }]

复制代码
```

我们运行 `yarn build`发现此时编译还是可以成功的。 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9452d2424f294cf3ba95f50f75abe1e6~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

```js
webpack.config.js 添加'.ts' '.tsx'

plugins: [new ESLintPlugin({
    extensions: ['.js', '.jsx', '.ts', '.tsx']
})],
复制代码
```

修改之后的效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c0726b7d6b347c294093957a8ee3b7b~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 用babel-loader打包tsx

生成 `tsconfig.json`文件。

```bash
npx tsc --init
复制代码
```

```json
{
 "jsx": "react",
 "strict": false,
  "noImplicitAny": true,
}
复制代码
```

同样我们编写 `tsx-demo.tsx`文件在 `index.js`中引入进行测试。

## CRLF 是什么？

### 一、LF和CRLF是什么

* CRLF 是 carriage return line feed 的缩写，中文意思是回车换行。
* LF 是 line feed 的缩写，中文意思也是换行。
* 它们都是文本换行的方式。

### 二、LF和CRLF区别

* `CRLF`: "\r\n", windows系统环境下的换行方式
* `LF`: "\n", Linux系统环境下的换行方式

## 让js和ts支持@alias

```js
js 支持
webpack.config.js

const path = require('path')
resolve: {
    alias: {
      '@': path.join(__dirname, './src/')
    }
  },
复制代码
```

```json
ts 支持
tsconfig.json 添加
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
}
复制代码
```

引入代码测试

## 让webpack支持scss

[sass-loader npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fsass-loader "https://www.npmjs.com/package/sass-loader")

```bash
yarn add sass-loader sass style-loader css-loader -D
复制代码
```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,

        use: [

          "style-loader",

          "css-loader",

          "sass-loader",
        ],
      },
    ],
  },
};
复制代码
```

* [sass-loader npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fsass-loader "https://www.npmjs.com/package/sass-loader")点进去里面有具体的配置。
* [Vue-loader](https://link.juejin.cn?target=https%3A%2F%2Fvue-loader.vuejs.org%2Fzh%2Fguide%2Fpre-processors.html%23sass-vs-scss "https://vue-loader.vuejs.org/zh/guide/pre-processors.html#sass-vs-scss")这个是 `Vue-loader`的官方文档

## scss自动import全局文件

```js
{
    test: /\.s[ac]ss$/i,
    use: [

      "style-loader",

      "css-loader",

      {
        loader: "sass-loader",
        options: {

          additionalData: `
          @import '@/var.scss';
          `,
          sassOptions: {
            includePaths: [__dirname]
          },
        },
      },
    ],
  },
复制代码
```

## scss分享变量给js

可以让项目中用到的 `css`变量用同一份 `js`和 `scss`共同维护一份变量。

```scss
+ scss-export.scss

:export {
  border-color: $body-color;
}
复制代码
```

```js
index.js

import vars from './scss-export.scss';

console.log(vars)
复制代码
```

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e6143cd3b0542c1b42d0af3b810ea60~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## webpack支持less文件

[less-loader npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fless-loader "https://www.npmjs.com/package/less-loader")

```bash
yarn add less less-loader -D
复制代码
```

```less
@import './_var.less';

body{
  color: @color;
}
复制代码
```

```js
webpack.config.js

{
    test: /\.less$/i,
    use: [
      {
        loader: "style-loader",
      },
      {
        loader: "css-loader",
        options: {
          modules: {
            compileType: 'icss',
          },
        },
      },
      {
        loader: "less-loader",
        options: {
          additionalData: `
                @import './_var.less';
              `
        },
      },
    ],
  },
复制代码
```

## less分享给js

```less
_var.less

@color: pink;

:export{
  color: @color;
}
复制代码
```

```js
index.js

import vars from './_var.less';

console.log(vars)
复制代码
```

## 对比scss 和less

要选的话就选 `scss`

## stylus文件

[stylus npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fstylus-loader "https://www.npmjs.com/package/stylus-loader")

```css
style.stylus

color = black;

//变量分享给js

:export{
  color: color
}
复制代码
```

```bash
yarn add stylus stylus-loader -D
复制代码
```

```js
webpack.config.js
{
    test: /\.styl$/,
    use: [
      {
        loader: "style-loader",
      },
      {
        loader: "css-loader",
        options: {
          modules: {
            compileType: 'icss',
          },
        }
      },
      {
        loader: "stylus-loader",
        options: {
          stylusOptions: {
            import: [path.resolve(__dirname, "src/_var.styl")]
          }
        }
      }
    ]
}
复制代码
```

## webpack config 重构

```js
webpack.config.js

const cssLoaders = (...loaders) => [

  "style-loader",

  {
    loader: 'css-loader',
    options: {
      modules: {
        compileType: 'icss',
      },
    },
  },
  ...loaders
]
复制代码
```

## 生产页面单独提取css文件

[mini-css-extract-plugin webpack文档](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.js.org%2Fplugins%2Fmini-css-extract-plugin%2F "https://webpack.js.org/plugins/mini-css-extract-plugin/")

```bash
yarn add mini-css-extract-plugin -D
复制代码
```

```js
webpack.config.js

const cssLoaders = (...loaders) => [

  mode === 'production' ? MiniCssExtractPlugin.loader : "style-loader",

  {
    loader: 'css-loader',
    options: {
      modules: {
        compileType: 'icss',
      },
    },
  },
  ...loaders
]

plugins: [
    new ESLintPlugin({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    mode === 'production' && new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
].filter(Boolean)

复制代码
```

## 自动生成HTML页面

[html-webpack-plugin npm](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fhtml-webpack-plugin "https://www.npmjs.com/package/html-webpack-plugin")

```bash
yarn add html-webpack-plugin -D
复制代码
```

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: 'index.js',
  output: {
    filename: '[name].[contenthash].js'
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
}
复制代码
```

## webpack优化 单独打包runtime

```js
optimization: {
    runtimeChunk: 'single',
},
复制代码
```

## 为什么要单独打包runtime

* `runtime`里面的文件是 `webpack`为了运行 `main.js`文件所要依赖的文件。
* 如果不单独打包，如果我们修改了 `webpack`的配置之后 `mian.js`里面的内容就会发生变化，用户的缓存就会失效，如果单独打包的话当修改完 `webpack`的配置之后只，如果我们没有改变 `main.js`里面的内容的话，就不会重新打包 `main.js`的内容，这样就可以节省宽带，提高用户访问页面的速度。

## webpack优化 用splitChunks将node依赖单独打包

在编译的时候要缓存 `React`等类库文件。

## webpack优化 固定modules

```js
webpack.config.js

optimization: {
moduleIds: 'deterministic',
runtimeChunk: 'single',
splitChunks: {
  cacheGroups: {
    vendor: {
      priority: 10,
      minSize: 0,
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all',

    }
  },
},
},
复制代码
```

之后再运行 `yarn build`可以看见引入了三个 `js`文件

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e30abc1ebf0e4785b531a644df720789~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

[optimizationmoduleids](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Foptimization%2F%23optimizationmoduleids "https://webpack.js.org/configuration/optimization/#optimizationmoduleids")

## webpack 多页面

```bash
webpack.config.js

entry: {
    main: './src/index.js',
    admin: './src/admin.js'
},
plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      chunks: ['admin']
    })
]
复制代码
```

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21b6e774145f42c2b9cbac7ab35f58e7~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## webpack优化 common插件

如果共有的文件就打包成一个文件，如果两个入口都同时引用了一个文件，

```js
 optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        common: {
          priority: 5,
          minSize: 0,
          minChunks: 2,
          chunks: 'all',
          name: 'common'
        }
      },
    },
  },
复制代码
```

1. `runtime` 为了运行 `mian.js`所要提供的代码。
2. `node_modules` venders 全局的
3. `common`模块间的 admin.js 和 index.js
4. `self`自身的

看这个打包之后页面引入 `js`的顺序

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d96964c4a413489784ecbc5430f2012d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)

## 无限多页面的实现思路

```js
webpack.config.js

let entry = {}
let outputHtml = []

var pages = fs.readdirSync(path.resolve(__dirname, pagesDir))
pages.forEach((item)=>{
  let name = item.replace('.js', '')
  entry[name] = `${pagesDir}${item}`
  outputHtml.push(new HtmlWebpackPlugin({
    filename: `${name}.html`,
    chunks: [name]
  }))
})
复制代码
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84326ede8bed4d81b41f8ff1287567c2~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image) 只需要把这两个参数弄成动态生成的即可满足要求。测试之后大功告成！！！

最后附上源代码连接 [github](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxiuxiuyifan%2Fwebpack-theory%2Ftree%2Fmaster%2F01 "https://github.com/xiuxiuyifan/webpack-theory/tree/master/01") [码云](https://link.juejin.cn?target=https%3A%2F%2Fgitee.com%2Fxiuxiuyifan%2Fwebpack-theory%2Ftree%2Fmaster%2F01 "https://gitee.com/xiuxiuyifan/webpack-theory/tree/master/01")

## 系列文章

[Webpack入门到精通 一（AST、Babel、依赖）](https://juejin.cn/post/6975885302493609991 "https://juejin.cn/post/6975885302493609991")

[Webpack入门到精通 二（核心原理）](https://juejin.cn/post/6978294079360598023 "https://juejin.cn/post/6978294079360598023")

[Webpack入门到精通 三（Loader原理）](https://juejin.cn/post/6980658561718812702 "https://juejin.cn/post/6980658561718812702")

[Webpack入门到精通 四（Plugin原理）](https://juejin.cn/post/7024127150412267556 "https://juejin.cn/post/7024127150412267556")

[Webpack入门到精通 五（常用配置）](https://juejin.cn/post/6981841495338778660 "https://juejin.cn/post/6981841495338778660")
