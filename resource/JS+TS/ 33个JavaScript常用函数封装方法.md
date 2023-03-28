这是我在实际开发中常用的一些js函数方法，今天总结了一下，以便以后查询，有需要的小伙伴可以参考下。

有些人或许会觉得忘了百度就完事儿，No no no！这事儿我真的亲自实践过好多次，百度一次记住了还好，记不住下次碰着了还得找度娘简直是拉低工作效率。

### 1、加载js || css || style 

```java
const loadRes = function (name, type, fn) {
  // 加载js || css || style  
  let ref
  if (type === 'js') { // 外部js 
    ref = document.createElement('script')
    ref.setAttribute('type', 'text/JavaScript')
    ref.setAttribute('src', name)
  } else if (type === 'css') { // 外部css  
    ref = document.createElement('link')
    ref.setAttribute('rel', 'stylesheet')
    ref.setAttribute('type', 'text/css')
    ref.setAttribute('href', name)
  } else if (type === 'style') { // style 
    ref = document.createElement('style')
    ref.innerhtml = name
  }
  if (typeof ref !== 'undefined') {
    document.getElementsByTagName('head')[0].appendChild(ref)
    ref.onload = function () { // 加载完成执行   
      typeof fn === 'function' && fn()
    }
  }
}
```

### 2、获取url参数 

```java
const getUrlParam = function (name) { // 获取url参数 
  let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i')
  let r = window.location.href.substr(1).match(reg)
  if (r != null) {
    return decodeURI(r[2])
  } return undefined
}
```

### 3、本地存储 

```java
const store = { // 本地存储  
  set: function (name, value, day) { // 设置    
    let d = new Date()
    let time = 0
    day = (typeof (day) === 'undefined' || !day) ? 1 : day // 时间,默认存储1天   
    time = d.setHours(d.getHours() + (24 * day)) // 毫秒   
    localStorage.setItem(name, JSON.stringify({ data: value, time: time }))
  },
  get: function (name) { // 获取    
    let data = localStorage.getItem(name)
    if (!data) { return null }
    let obj = JSON.parse(data)
    if (new Date().getTime() > obj.time) { // 过期    
      localStorage.removeItem(name)
      return null
    } else {
      return obj.data
    }
  },
  clear: function (name) { // 清空  
    if (name) { // 删除键为name的缓存   
      localStorage.removeItem(name)
    } else { // 清空全部    
      localStorage.clear()
    }
  }
}
```

### 4、cookie操作【set，get，del】 

```java
const cookie = { // cookie操作【set，get，del】
  set: function(name, value, day) {
    let oDate = new Date()
    oDate.setDate(oDate.getDate() + (day || 30))
    document.cookie = name + '=' + value + ';expires=' + oDate + "; path=/;"
  },
  get: function(name) {
    let str = document.cookie
    let arr = str.split('; ')
    for (let i = 0; i < arr.length; i++) {
      let newArr = arr[i].split('=')
      if (newArr[0] === name) {
        return newArr[1]
      }
    }
  },
  del: function(name) {
    this.set(name, '', -1)
  }
}
```

### 5、Js获取元素样式【支持内联】 

```java
const getRealStyle = function(obj, styleName) { // Js获取元素样式【支持内联】
  var realStyle = null
  if (obj.currentStyle) {
    realStyle = obj.currentStyle[styleName]
  } else if (window.getComputedStyle) {
    realStyle = window.getComputedStyle(obj, null)[styleName]
  }
  return realStyle
}
```

### 6、时间格式化 

```java

const formatDate = function(fmt, date) { // 时间格式化 【'yyyy-MM-dd hh:mm:ss',时间】
  if (typeof date !== 'object') {
    date = !date ? new Date() : new Date(date)
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
```

### 7、原生ajax操作 

```java
const ajax = function(conf) { // ajax操作
  let url = conf.url,
    data = conf.data,
    senData = [], // 封装后的数据
    async = conf.async !== undefined ? conf.async : true, // ture为异步请求
      type = conf.type || 'get', // 默认请求方式get
      dataType = conf.dataType || 'json',
      contenType = conf.contenType || 'application/x-www-form-urlencoded',
      success = conf.success,
      error = conf.error,
      isForm = conf.isForm || false, // 是否formdata
      header = conf.header || {}, // 头部信息
      xhr = '' // 创建ajax引擎对象
  if (data == null) {
    senData = ''
  } else if (typeof data === 'object' && !isForm) { // 如果data是对象，转换为字符串
    for (var k in data) {
      senData.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    }
    senData = senData.join('&')
  } else {
    senData = data
  }
  try {
    xhr = new ActiveXObject('microsoft.xmlhttp') // IE内核系列浏览器
  } catch (e1) {
    try {
      xhr = new XMLHttpRequest() // 非IE内核浏览器
    } catch (e2) {
      if (error != null) {
        error('不支持ajax请求')
      }
    }
  };
  xhr.open(type, type !== 'get' ? url : url + '?' + senData, async)
  if (type !== 'get' && !isForm) {
    xhr.setRequestHeader('content-type', contenType)
  }
  for (var h in header) {
    xhr.setRequestHeader(h, header[h])
  }
  xhr.send(type !== 'get' ? senData : null)
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (dataType === 'json' && success != null) {
          let res = ''
          try {
            res = eval('(' + xhr.responseText + ')')
          } catch (e) {
            console.log(e)
          }
          success(res) // 将json字符串转换为js对象
        };
      } else {
        if (error != null) {
          error('通讯失败!' + xhr.status)
        }
      }
    }
  }
}
```

  


### 8、fetch请求的封装 

```java
const fetch = function(url, setting) { // fetch请求的封装
  let opts = { // 设置参数的初始值
    method: (setting.method || 'GET').toUpperCase(), // 请求方式
    headers: setting.headers || {}, // 请求头设置
    credentials: setting.credentials || true, // 设置cookie是否一起发送
    body: setting.body || {},
    mode: setting.mode || 'no-cors', // 可以设置 cors, no-cors, same-origin
    redirect: setting.redirect || 'follow', // follow, error, manual
    cache: setting.cache || 'default' // 设置 cache 模式 (default, reload, no-cache)
  }
  let dataType = setting.dataType || 'json' // 解析方式
  let data = setting.data || '' // 参数
  let paramsFormat = function(obj) { // 参数格式
    var str = ''
    for (var i in obj) {
      str += `${i}=${obj[i]}&`
    }
    return str.split('').slice(0, -1).join('')
  }

  if (opts.method === 'GET') {
    url = url + (data ? `?${paramsFormat(data)}` : '')
  } else {
    setting.body = data || {}
  }
  return new Promise((resolve, reject) => {
    fetch(url, opts).then(async res => {
      let data = dataType === 'text' ? await res.text() : dataType === 'blob' ? await res.blob() : await res.json()
      resolve(data)
    }).catch(e => {
      reject(e)
    })
  })
}

```

### 9、设备判断：android、ios、web 

```java

const isDevice = function() { // 判断是android还是ios还是web
  var ua = navigator.userAgent.toLowerCase()
  if (ua.match(/iPhone\sOS/i) === 'iphone os' || ua.match(/iPad/i) === 'ipad') { // ios
    return 'iOS'
  }
  if (ua.match(/Android/i) === 'android') {
    return 'Android'
  }
  return 'Web'
}
```

### 10、判断是否为微信 

```java

const isWx = function() { // 判断是否为微信
  var ua = window.navigator.userAgent.toLowerCase()
  if (ua.match(/MicroMessenger/i) === 'micromessenger') {
    return true
  }
  return false
}
```

### 11、文本复制功能 

```java
const copyTxt = function(text, fn) { // 复制功能
  if (typeof document.execCommand !== 'function') {
    console.log('复制失败，请长按复制')
    return
  }
  var dom = document.createElement('textarea')
  dom.value = text
  dom.setAttribute('style', 'display: block;width: 1px;height: 1px;')
  document.body.appendChild(dom)
  dom.select()
  var result = document.execCommand('copy')
  document.body.removeChild(dom)
  if (result) {
    console.log('复制成功')
    typeof fn === 'function' && fn()
    return
  }
  if (typeof document.createRange !== 'function') {
    console.log('复制失败，请长按复制')
    return
  }
  var range = document.createRange()
  var div = document.createElement('div')
  div.innerhtml = text
  div.setAttribute('style', 'height: 1px;fontSize: 1px;overflow: hidden;')
  document.body.appendChild(div)
  range.selectNode(div)
  var selection = window.getSelection()
  console.log(selection)
  if (selection.rangeCount > 0) {
    selection.removeAllRanges()
  }
  selection.addRange(range)
  document.execCommand('copy')
  typeof fn === 'function' && fn()
  console.log('复制成功')
}

```

### 12、判断是否是一个数组 

```java
const isArray = function(arr) { // 判断是否是一个数组
  return Object.prototype.toString.call(arr) === '[object Array]'
}
```

### 13、判断两个数组是否相等 

```java

const arrayEqual = function(arr1, arr2) { //判断两个数组是否相等
  if (arr1 === arr2) return true;
  if (arr1.length != arr2.length) return false;
  for (let i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
```

### 14、时间与时间戳转换 

```java

const stamp = { // 时间，时间戳转换
  getTime: function(time) { // 时间转10位时间戳
    let date = time ? new Date(time) : new Date()
    return Math.round(date.getTime() / 1000)
  },
  timeToStr: function(time, fmt) { // 10位时间戳转时间
    return new Date(time * 1000).pattern(fmt || 'yyyy-MM-dd')
  }
}
```

### 15、常用正则验证 

```java
const checkStr = function(str, type) { // 常用正则验证，注意type大小写
  switch (type) {
    case 'phone': // 手机号码
      return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(str)
    case 'tel': // 座机
      return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str)
    case 'card': // 身份证
      return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str)
    case 'pwd': // 密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线
      return /^[a-zA-Z]\w{5,17}$/.test(str)
    case 'postal': // 邮政编码
      return /[1-9]\d{5}(?!\d)/.test(str)
    case 'QQ': // QQ号
      return /^[1-9][0-9]{4,9}$/.test(str)
    case 'email': // 邮箱
      return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str)
    case 'money': // 金额(小数点2位)
      return /^\d*(?:\.\d{0,2})?$/.test(str)
    case 'URL': // 网址
      return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(str)
    case 'IP': // IP
      return /((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))/.test(str)
    case 'date': // 日期时间
      return /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})(?:\:\d{2}|:(\d{2}):(\d{2}))$/.test(str) ||
        /^(\d{4})\-(\d{2})\-(\d{2})$/.test(str)
    case 'number': // 数字
      return /^[0-9]$/.test(str)
    case 'english': // 英文
      return /^[a-zA-Z]+$/.test(str)
    case 'chinese': // 中文
      return /^[\u4E00-\u9FA5]+$/.test(str)
    case 'lower': // 小写
      return /^[a-z]+$/.test(str)
    case 'upper': // 大写
      return /^[A-Z]+$/.test(str)
    case 'HTML': // HTML标记
      return /<("[^"]*"|'[^']*'|[^'">])*>/.test(str)
    default:
      return true
  }
}
```

### 16、是否为PC端 

```java

const isPC = function() { // 是否为PC端
  let userAgentInfo = navigator.userAgent
  let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}
```

### 17、去除字符串空格 

```java
const trim = function(str, type) { // 去除空格， type:  1-所有空格  2-前后空格  3-前空格 4-后空格
  type = type || 1
  switch (type) {
    case 1:
      return str.replace(/\s+/g, '')
    case 2:
      return str.replace(/(^\s*)|(\s*$)/g, '')
    case 3:
      return str.replace(/(^\s*)/g, '')
    case 4:
      return str.replace(/(\s*$)/g, '')
    default:
      return str
  }
}
```

### 18、字符串大小写转换 

```java

const changeCase = function(str, type) { // 字符串大小写转换 type:  1:首字母大写  2：首页母小写  3：大小写转换  4：全部大写  5：全部小写
  type = type || 4
  switch (type) {
    case 1:
      return str.replace(/\b\w+\b/g, function(word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
      })
    case 2:
      return str.replace(/\b\w+\b/g, function(word) {
        return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase()
      })
    case 3:
      return str.split('').map(function(word) {
        if (/[a-z]/.test(word)) {
          return word.toUpperCase()
        } else {
          return word.toLowerCase()
        }
      }).join('')
    case 4:
      return str.toUpperCase()
    case 5:
      return str.toLowerCase()
    default:
      return str
  }
}
```

### 19、过滤html代码 

```java

const filterTag = function(str) { // 过滤html代码(把<>转换)
  str = str.replace(/&/ig, '&')
  str = str.replace(/</ig, '<')
  str = str.replace(/>/ig, '>')
  str = str.replace(' ', ' ')
  return str
}
```

### 20、生成随机数范围 

```java

const random = function(min, max) { // 生成随机数范围
  if (arguments.length === 2) {
    return Math.floor(min + Math.random() * ((max + 1) - min))
  } else {
    return null
  }
}
```

### 21、阿拉伯数字转中文大写数字 

```java

const numberToChinese = function(num) { // 将阿拉伯数字翻译成中文的大写数字
  let AA = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十')
  let BB = new Array('', '十', '百', '仟', '萬', '億', '点', '')
  let a = ('' + num).replace(/(^0*)/g, '').split('.')
  let k = 0
  let re = ''
  for (let i = a[0].length - 1; i >= 0; i--) {
    switch (k) {
      case 0:
        re = BB[7] + re
        break
      case 4:
        if (!new RegExp('0{4}//d{' + (a[0].length - i - 1) + '}$').test(a[0])) {
          re = BB[4] + re
        }
        break
      case 8:
        re = BB[5] + re
        BB[7] = BB[5]
        k = 0
        break
    }
    if (k % 4 === 2 && a[0].charAt(i + 2) !== 0 && a[0].charAt(i + 1) === 0) {
      re = AA[0] + re
    }
    if (a[0].charAt(i) !== 0) {
      re = AA[a[0].charAt(i)] + BB[k % 4] + re
    }
    k++
  }
  if (a.length > 1) { // 加上小数部分(如果有小数部分)
    re += BB[6]
    for (let i = 0; i < a[1].length; i++) {
      re += AA[a[1].charAt(i)]
    }
  }
  if (re === '一十') {
    re = '十'
  }
  if (re.match(/^一/) && re.length === 3) {
    re = re.replace('一', '')
  }
  return re
}
```

### 22、原生dom操作 

```java
const dom = {
  $: function(selector) {
    let type = selector.substring(0, 1)
    if (type === '#') {
      if (document.querySelecotor) return document.querySelector(selector)
      return document.getElementById(selector.substring(1))
    } else if (type === '.') {
      if (document.querySelecotorAll) return document.querySelectorAll(selector)
      return document.getElementsByClassName(selector.substring(1))
    } else {
      return document['querySelectorAll' ? 'querySelectorAll' : 'getElementsByTagName'](selector)
    }
  },
  hasClass: function(ele, name) { /* 检测类名 */
    return ele.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'))
  },
  addClass: function(ele, name) { /* 添加类名 */
    if (!this.hasClass(ele, name)) ele.className += ' ' + name
  },
  removeClass: function(ele, name) { /* 删除类名 */
    if (this.hasClass(ele, name)) {
      let reg = new RegExp('(\\s|^)' + name + '(\\s|$)')
      ele.className = ele.className.replace(reg, '')
    }
  },
  replaceClass: function(ele, newName, oldName) { /* 替换类名 */
    this.removeClass(ele, oldName)
    this.addClass(ele, newName)
  },
  siblings: function(ele) { /* 获取兄弟节点 */
    console.log(ele.parentNode)
    let chid = ele.parentNode.children,
      eleMatch = []
    for (let i = 0, len = chid.length; i < len; i++) {
      if (chid[i] !== ele) {
        eleMatch.push(chid[i])
      }
    }
    return eleMatch
  },
  getByStyle: function(obj, name) { /* 获取行间样式属性 */
    if (obj.currentStyle) {
      return obj.currentStyle[name]
    } else {
      return getComputedStyle(obj, false)[name]
    }
  },
  domToStirng: function(htmlDOM) { /* DOM转字符串 */
    var div = document.createElement('div')
    div.appendChild(htmlDOM)
    return div.innerHTML
  },
  stringToDom: function(htmlString) { /* 字符串转DOM */
    var div = document.createElement('div')
    div.innerHTML = htmlString
    return div.children[0]
  }
}
```

### 23、判断图片加载完成 

```java

const imgLoadAll = function(arr, callback) { // 图片加载
  let arrImg = []
  for (let i = 0; i < arr.length; i++) {
    let img = new Image()
    img.src = arr[i]
    img.onload = function() {
      arrImg.push(this)
      if (arrImg.length == arr.length) {
        callback && callback()
      }
    }
  }
}
```

### 24、音频加载完成操作 

```java

const loadAudio = function(src, callback) { // 音频加载
  var audio = new Audio(src)
  audio.onloadedmetadata = callback
  audio.src = src
}
```

### 25、光标所在位置插入字符 

```java

const insertAtCursor = function(dom, val) { // 光标所在位置插入字符
  if (document.selection) {
    dom.focus()
    let sel = document.selection.createRange()
    sel.text = val
    sel.select()
  } else if (dom.selectionStart || dom.selectionStart == '0') {
    let startPos = dom.selectionStart
    let endPos = dom.selectionEnd
    let restoreTop = dom.scrollTop
    dom.value = dom.value.substring(0, startPos) + val + dom.value.substring(endPos, dom.value.length)
    if (restoreTop > 0) {
      dom.scrollTop = restoreTop
    }
    dom.focus()
    dom.selectionStart = startPos + val.length
    dom.selectionEnd = startPos + val.length
  } else {
    dom.value += val
    dom.focus()
  }
}
```

### 26、图片地址转base64 

```java

const getBase64 = function(img) { //传入图片路径，返回base64，使用getBase64(url).then(function(base64){},function(err){}); 
  let getBase64Image = function(img, width, height) { //width、height调用时传入具体像素值，控制大小,不传则默认图像大小
    let canvas = document.createElement("canvas");
    canvas.width = width ? width : img.width;
    canvas.height = height ? height : img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let dataURL = canvas.toDataURL();
    return dataURL;
  }
  let image = new Image();
  image.crossOrigin = '';
  image.src = img;
  let deferred = $.Deferred();
  if (img) {
    image.onload = function() {
      deferred.resolve(getBase64Image(image));
    }
    return deferred.promise();
  }
}
```

### 27、base64图片下载功能 

```java

const downloadFile = function(base64, fileName) { //base64图片下载功能
  let base64ToBlob = function(code) {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], {
      type: contentType
    });
  };
  let aLink = document.createElement('a');
  let blob = base64ToBlob(base64); //new Blob([content]);
  let evt = document.createEvent("HTMLEvents");
  evt.initEvent("click", true, true); //initEvent不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
}
```

### 28、浏览器是否支持webP格式图片 

```java
const isSupportWebP = function() { //判断浏览器是否支持webP格式图片
  return !![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
}
```

### 29、url参数转对象 

```java

const parseQueryString = function(url) { //url参数转对象
  url = !url ? window.location.href : url;
  if (url.indexOf('?') === -1) {
    return {};
  }
  let search = url[0] === '?' ? url.substr(1) : url.substring(url.lastIndexOf('?') + 1);
  if (search === '') {
    return {};
  }
  search = search.split('&');
  let query = {};
  for (let i = 0; i < search.length; i++) {
    let pair = search[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}
```

### 30、对象序列化【对象转url参数】 

```java

const stringfyQueryString = function(obj) { //对象序列化【对象转url参数】
  if (!obj) return '';
  let pairs = [];
  for (let key in obj) {
    let value = obj[key];
    if (value instanceof Array) {
      for (let i = 0; i < value.length; ++i) {
        pairs.push(encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(value[i]));
      }
      continue;
    }
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}
```

### 31、H5软键盘缩回、弹起回调 

```java

const h5Resize = function(downCb, upCb) { //当软件键盘弹起会改变当前 window.innerHeight，监听这个值变化 [downCb 当软键盘弹起后，缩回的回调,upCb 当软键盘弹起的回调]
  var clientHeight = window.innerHeight;
  downCb = typeof downCb === 'function' ? downCb : function() {}
  upCb = typeof upCb === 'function' ? upCb : function() {}
  window.addEventListener('resize', () => {
    var height = window.innerHeight;
    if (height === clientHeight) {
      downCb();
    }
    if (height < clientHeight) {
      upCb();
    }
  });
}
```

### 32、函数防抖 

```java
const debounce = function(func, wait, immediate) { //函数防抖[func 函数,wait 延迟执行毫秒数,immediate true 表立即执行,false 表非立即执行,立即执行是触发事件后函数会立即执行，然后n秒内不触发事件才能继续执行函数的效果]
  let timeout;
  return function() {
    let context = this;
    let args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args)
      }, wait);
    }
  }
}
```

### 33、函数节流 

```java

const throttle = function(func, wait ,type) { //函数节流 [func 函数 wait 延迟执行毫秒数 type 1 表时间戳版，2 表定时器版]
    if(type===1){
        let previous = 0;
    }else if(type===2){
        let timeout;
    }
    return function() {
        let context = this;
        let args = arguments;
        if(type===1){
            let now = Date.now();
            if (now - previous > wait) {
                func.apply(context, args);
                previous = now;
            }
        }else if(type===2){
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null;
                    func.apply(context, args)
                }, wait)
            }
        }
    }
}
```

整理至此，请用心记！！！！ 最后，如果你觉得非常有用的话，请记得分享给你身边做开发的小伙伴。




## 1. 下载一个excel文档 

同时适用于word,ppt等浏览器不会默认执行预览的文档,也可以用于下载后端接口返回的流数据，见`3`

```java
//下载一个链接 
function download(link, name) {
    if(!name){
            name=link.slice(link.lastIndexOf('/') + 1)
    }
    let eleLink = document.createElement('a')
    eleLink.download = name
    eleLink.style.display = 'none'
    eleLink.href = link
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
}
//下载excel
download('http://111.229.14.189/file/1.xlsx')
复制代码
```

## 2. 在浏览器中自定义下载一些内容 

场景：我想下载一些DOM内容，我想下载一个JSON文件

```java
/**
 * 浏览器下载静态文件
 * @param {String} name 文件名
 * @param {String} content 文件内容
 */
function downloadFile(name, content) {
    if (typeof name == 'undefined') {
        throw new Error('The first parameter name is a must')
    }
    if (typeof content == 'undefined') {
        throw new Error('The second parameter content is a must')
    }
    if (!(content instanceof Blob)) {
        content = new Blob([content])
    }
    const link = URL.createObjectURL(content)
    download(link, name)
}
//下载一个链接
function download(link, name) {
    if (!name) {//如果没有提供名字，从给的Link中截取最后一坨
        name =  link.slice(link.lastIndexOf('/') + 1)
    }
    let eleLink = document.createElement('a')
    eleLink.download = name
    eleLink.style.display = 'none'
    eleLink.href = link
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
}
复制代码
```

使用方式：

```java
downloadFile('1.txt','lalalallalalla')
downloadFile('1.json',JSON.stringify({name:'hahahha'}))
复制代码
```

## 3. 下载后端返回的流 

数据是后端以接口的形式返回的,调用`1`中的download方法进行下载

```java
 download('http://111.229.14.189/gk-api/util/download?file=1.jpg')
 download('http://111.229.14.189/gk-api/util/download?file=1.mp4')

复制代码
```

## 4. 提供一个图片链接，点击下载 

图片、pdf等文件，浏览器会默认执行预览，不能调用download方法进行下载，需要先把图片、pdf等文件转成blob，再调用download方法进行下载，转换的方式是使用axios请求对应的链接

```java
//可以用来下载浏览器会默认预览的文件类型，例如mp4,jpg等
import axios from 'axios'
//提供一个link，完成文件下载，link可以是  http://xxx.com/xxx.xls
function downloadByLink(link,fileName){
    axios.request({
        url: link,
        responseType: 'blob' //关键代码，让axios把响应改成blob
    }).then(res => {
 const link=URL.createObjectURL(res.data)
        download(link, fileName)
    })

}
复制代码
```

注意：会有同源策略的限制，需要配置转发

## 6 防抖 

在一定时间间隔内，多次调用一个方法，只会执行一次.

这个方法的实现是从Lodash库中copy的

```java
/**
 *
 * @param {*} func 要进行debouce的函数
 * @param {*} wait 等待时间,默认500ms
 * @param {*} immediate 是否立即执行
 */
export function debounce(func, wait=500, immediate=false) {
    var timeout
    return function() {
        var context = this
        var args = arguments

        if (timeout) clearTimeout(timeout)
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout
            timeout = setTimeout(function() {
                timeout = null
            }, wait)
            if (callNow) func.apply(context, args)
        } else {
            timeout = setTimeout(function() {
                func.apply(context, args)
            }, wait)
        }
    }
}
复制代码
```

使用方式：

```java
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        <input id="input" />
        <script>
            function onInput() {
                console.log('1111')
            }
            const debounceOnInput = debounce(onInput)
            document
                .getElementById('input')
                .addEventListener('input', debounceOnInput) //在Input中输入，多次调用只会在调用结束之后，等待500ms触发一次   
        </script>
    </body>
</html>

复制代码
```

如果第三个参数`immediate`传true，则会立即执行一次调用，后续的调用不会在执行，可以自己在代码中试一下

## 7 节流 

多次调用方法，按照一定的时间间隔执行

这个方法的实现也是从Lodash库中copy的

```java
/**
 * 节流，多次触发，间隔时间段执行
 * @param {Function} func
 * @param {Int} wait
 * @param {Object} options
 */
export function throttle(func, wait=500, options) {
    //container.onmousemove = throttle(getUserAction, 1000);
    var timeout, context, args
    var previous = 0
    if (!options) options = {leading:false,trailing:true}

    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime()
        timeout = null
        func.apply(context, args)
        if (!timeout) context = args = null
    }

    var throttled = function() {
        var now = new Date().getTime()
        if (!previous && options.leading === false) previous = now
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            func.apply(context, args)
            if (!timeout) context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }
    }
    return throttled
}
复制代码
```

第三个参数还有点复杂，`options`

 *  leading，函数在每个等待时延的开始被调用，默认值为false
 *  trailing，函数在每个等待时延的结束被调用，默认值是true

可以根据不同的值来设置不同的效果：

 *  leading-false，trailing-true：默认情况，即在延时结束后才会调用函数
 *  leading-true，trailing-true：在延时开始时就调用，延时结束后也会调用
 *  leading-true, trailing-false：只在延时开始时调用

例子：

```java
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        <input id="input" />
        <script>
            function onInput() {
                console.log('1111')
            }
            const throttleOnInput = throttle(onInput)
            document
                .getElementById('input')
                .addEventListener('input', throttleOnInput) //在Input中输入，每隔500ms执行一次代码
        </script> 
    </body>
</html>

复制代码
```

## 8. cleanObject 

去除对象中value为空(null,undefined,'')的属性,举个栗子：

```java
let res=cleanObject({
    name:'',
    pageSize:10,
    page:1
})
console.log("res", res) //输入{page:1,pageSize:10}   name为空字符串，属性删掉
复制代码
```

使用场景是：后端列表查询接口，某个字段前端不传，后端就不根据那个字段筛选，例如`name`不传的话，就只根据`page`和`pageSize`筛选，但是前端查询参数的时候（vue或者react）中，往往会这样定义

```java
export default{
    data(){
        return {
            query:{
                name:'',
                pageSize:10,
                page:1
            }
        }
    }
}


const [query,setQuery]=useState({name:'',page:1,pageSize:10})
复制代码
```

给后端发送数据的时候，要判断某个属性是不是空字符串，然后给后端拼参数，这块逻辑抽离出来就是`cleanObject`，代码实现如下

```java
export const isFalsy = (value) => (value === 0 ? false : !value);

export const isVoid = (value) =>
  value === undefined || value === null || value === "";

export const cleanObject = (object) => {
  // Object.assign({}, object)
  if (!object) {
    return {};
  }
  const result = { ...object };
  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (isVoid(value)) {
      delete result[key];
    }
  });
  return result;
};

复制代码
```

```java
let res=cleanObject({
    name:'',
    pageSize:10,
    page:1
})
console.log("res", res) //输入{page:1,pageSize:10}
复制代码
```
