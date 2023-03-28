- [前言](#前言)
- [JS类型之问——概念与检测篇](#js类型之问概念与检测篇)
  - [1.JS中的数据类型有哪些？](#1js中的数据类型有哪些)
  - [2.你真的懂typeof吗？](#2你真的懂typeof吗)
  - [3.什么是instanceof？你能模拟实现一个instanceof吗？](#3什么是instanceof你能模拟实现一个instanceof吗)
  - [4.如何区分数组与对象？使用instanceof判断数组可靠吗？](#4如何区分数组与对象使用instanceof判断数组可靠吗)
  - [5.如何判断一个数是否为NaN？](#5如何判断一个数是否为nan)
  - [6.如何实现一个功能完善的类型判断函数？](#6如何实现一个功能完善的类型判断函数)
- [JS类型之问——类型转换篇](#js类型之问类型转换篇)
  - [7.toString 和 valueOf 方法有什么区别？](#7tostring-和-valueof-方法有什么区别)
  - [8.你知道对象转换成原始值是什么流程吗 (ToPrimitive)？](#8你知道对象转换成原始值是什么流程吗-toprimitive)
  - [9.你能做出下面这个题吗？](#9你能做出下面这个题吗)
  - [10.你能理清类型转换吗？](#10你能理清类型转换吗)
    - [转换为boolean](#转换为boolean)
    - [转化为string](#转化为string)
    - [转化为number](#转化为number)
  - [11.== 的隐式转换规则](#11-的隐式转换规则)
  - [12.`1 + {}` 与 `{} + 1`的输出结果分别是什么？](#121---与---1的输出结果分别是什么)
  - [13.\[\]与{}的相加的结果是多少？](#13与的相加的结果是多少)
    - [`[] + {}`](#--)
    - [`[] + []`](#---1)
    - [`{} + []`](#---2)
    - [`{} + {}`](#---3)
  - [14.你能灵活运用 parseInt 与 parseFloat 吗](#14你能灵活运用-parseint-与-parsefloat-吗)
    - [网红题：\['1','2','3'\].map(parseInt)](#网红题123mapparseint)
  - [15.如何让 if(a == 1 \&\& a == 2) 条件成立？](#15如何让-ifa--1--a--2-条件成立)

## 前言 

当下的前端开发，三大框架三分天下，框架的简单、强大让我们欲罢不能，使用原生 `JavaScript` 越来越少。  


但我认为 `JavaScript` 作为每一个前端工程师的立身之本，不止要学会，还要学好、学精，学再多遍都不为过。

另一方面，前端面试中，越来越重视原生 `JavaScript` 的考察，其所占比例也越来越高。

我抓取了牛客上今年的线上面试题和面经，大约 `500` 左右道题，原生 `JavaScript` 的难点(闭包，`eventLoop，this`，手撕原生JS)考察的频率非常高。

> 完整的分析我还正在赶工中，希望大家到时候可以来支持一下。

因此我决定整理`JavaScript`中容易忽视或者混淆的知识点，写一系列篇文章，以灵魂拷问的方式，系统且完整的带大家遨游原生 `JavaScript` 的世界，希望能给大家带来一些收获。

## JS类型之问——概念与检测篇 

### 1.JS中的数据类型有哪些？ 

1.  ```java
    基本数据类型：共有7种
    ```

```java
Boolean Number String undefined null Bigint Symbol
复制代码
```

`Symbol` ：`ES6` 引入的一种新的原始值，表示独一无二的值，主要为了解决属性名冲突问题。

`Bigint` ：`ES2020` 新增加，是比 `Number` 类型的整数范围更大。

1.  ```java
    引用数据类型：1种
    ```

```java
Object对象(包括普通Object、Function、Array、Date、RegExp、Math)
复制代码
```

### 2.你真的懂typeof吗？ 

1.  `typeof`的作用？
    
    区分数据类型，可以返回7种数据类型：`number、string、boolean、undefined、object、function` ，以及 `ES6` 新增的 `symbol`
2.  `typeof` 能正确区分数据类型吗？
    
    不能。对于原始类型，除 `null` 都可以正确判断；对于引用类型，除 `function` 外，都会返回 `"object"`
3.  `typeof` 注意事项
4.  `typeof` 返回值为 `string` 格式，注意类似这种考题: `typeof(typeof(undefined)) -> "string"`
    
    `typeof` 未定义的变量不会报错，返回 `"undefiend"`
    
    `typeof(null) -> "object"`: 遗留已久的 `bug`
    
    `typeof`无法区别数组与普通对象: `typeof([]) -> "object"`
    
    `typeof(NaN) -> "number"`
5.  习题

```java
console.log(typeof(b));
console.log(typeof(undefined)); 
console.log(typeof(NaN)); 
console.log(typeof(null)); 
var a = '123abc'; 
console.log(typeof(+a)); 
console.log(typeof(!!a)); 
console.log(typeof(a + "")); 
console.log(typeof(typeof(null)));
console.log(typeof(typeof({})));
复制代码
```

答案

```java
undefined // b未定义，返回undefined
undefined
number // NaN 为number类型
object
number // +a 类型转换为NaN
boolean
string
string // typeof(null) -> "object"; typeof("object") -> "string"
string
复制代码
```

### 3.什么是instanceof？你能模拟实现一个instanceof吗？ 

1.  ```java
    `instanceof` 判断对象的原型链上是否存在构造函数的原型。只能判断引用类型。
    ```
2.  ```java
    `instanceof` 常用来判断 `A` 是否为 `B` 的实例
    ```

```java
// A是B的实例，返回true，否则返回false
// 判断A的原型链上是否有B的原型
A instaceof B
复制代码
```

1.  模拟实现 `instanceof`

思想：沿原型链往上查找

```java
function instance_of(Case, Constructor) {
    // 基本数据类型返回false
    // 兼容一下函数对象
    if ((typeof(Case) != 'object' && typeof(Case) != 'function') || Case == 'null') return false;
    let CaseProto = Object.getPrototypeOf(Case);
    while (true) {
        // 查到原型链顶端，仍未查到，返回false
        if (CaseProto == null) return false;
        // 找到相同的原型
        if (CaseProto === Constructor.prototype) return true;
        CaseProto = Object.getPrototypeOf(CaseProto);
    }
}
复制代码
```

测试：

```java
console.log(instance_of(Array, Object)) // true
function User(name){
    this.name = name;
}
const user = new User('zc');
const vipUser = Object.create(user);
console.log(instance_of(vipUser, User)) // true
复制代码
```

### 4.如何区分数组与对象？使用instanceof判断数组可靠吗？ 

1.  ```java
    `ES6` 提供的新方法 `Array.isArray()`
    ```
2.  ```java
    如果不存在`Array.isArray()`呢？可以借助`Object.prototype.toString.call()` 进行判断，此方式兼容性最好
    ```

```java
if (!Array.isArray) {
    Array.isArray = function(o) {
        return typeof(o) === 'object' 
               && Object.prototype.toString.call(o) === '[object Array]';
    }
}
复制代码
```

1.  `instanceof` 判断

判断方式

```java
// 如果为true，则arr为数组
arr instanceof Array
复制代码
```

`instanceof` 判断数组类型如此之简单，为何不推荐使用那？

`instanceof` 操作符的问题在于，如果网页中存在多个 `iframe` ，那便会存在多个 `Array` 构造函数，此时判断是否是数组会存在问题。

更详细的内容可以参考博文：JavaScript为啥不用instanceof检测数组\[4\]

### 5.如何判断一个数是否为NaN？ 

`NaN` 有个非常特殊的特性， `NaN` 与任何值都不相等，包括它自身

```java
NaN === NaN // false
NaN == NaN // false
复制代码
```

鉴于这个独特的特性，可以手撕一个比较简单的判断函数

```java
function isNaN(x) {
    return x != x;
}
复制代码
```

 *  全局函数 `isNaN` 方法：不推荐使用。 `MDN` 对它的介绍是： `isNaN` 函数内包含一些非常有趣的规则。

但为了避免一些面试官出一些冷门题目，咱们来稍微了解一下 `isNaN` 的有趣机制：会先判断参数是不是 `Number` 类型，如果不是 `Number` 类型会尝试将这个参数转换为 `Number` 类型，之后再去判断是不是 `NaN` 。

举个例子：

```java
// 为什么对象会带来三种不同的结果
// 是不是很有趣
// 具体原因可以参考类型转换篇
console.log(isNaN([])) // false
console.log(isNaN([1])) // false
console.log(isNaN([1, 2])) // true 
console.log(isNaN(null)) // false
console.log(isNaN(undefined)) // true
复制代码
```

`isNaN` 的结果很大程度上取决于 `Number()` 类型转换的结果，关于 `Number` 的转换结果，后面会专门有一部分来介绍。

 *  `Number.isNaN` (推荐使用)

与 `isNaN()` 相比，`Number.isNaN()` 不会自行将参数转换成数字，只有在参数是值为 `NaN` 的数字时，才会返回 `true`。

### 6.如何实现一个功能完善的类型判断函数？ 

`Object.prototype.toString.call([value])` ，可以精准判断数据类型，因此可以根据这个原理封装一个自己的 `type` 方法。

```java
toString.call(()=>{})       // [object Function]
toString.call({})           // [object Object]
toString.call([])           // [object Array]
toString.call('')           // [object String]
toString.call(22)           // [object Number]
toString.call(undefined)    // [object undefined]
toString.call(null)         // [object null]
toString.call(new Date)     // [object Date]
toString.call(Math)         // [object Math]
toString.call(window)       // [object Window]
复制代码
```

## JS类型之问——类型转换篇 

### 7.toString 和 valueOf 方法有什么区别？ 

1.  基础：这两个方法属于 `Object` 对象，是为了解决 `JavaScript` 值运算与显示的问题。为了更适合自身功能，很多 `JavaScript` 内置对象都重写了这两个方法。
2.  `toString()`: 返回当前对象的字符串形式； `valueOf()` : 返回该对象的原始值
3.  各个类型下两个方法返回值情况对比

<table width="376"> 
 <thead> 
  <tr> 
   <th>类型</th> 
   <th>valueOf</th> 
   <th>toString</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>Array[1,2,3]</td> 
   <td>数组本身[1, 2, 3]</td> 
   <td>1,2,3</td> 
  </tr> 
  <tr> 
   <td>Object</td> 
   <td>对象本身</td> 
   <td>[object Object]</td> 
  </tr> 
  <tr> 
   <td>Boolean类型</td> 
   <td>Boolean值</td> 
   <td>"true"或"false"</td> 
  </tr> 
  <tr> 
   <td>Function</td> 
   <td>函数本身</td> 
   <td>function fnName(){code}</td> 
  </tr> 
  <tr> 
   <td>Number</td> 
   <td>数值</td> 
   <td>数值的字符换表示</td> 
  </tr> 
  <tr> 
   <td>Date</td> 
   <td>毫米格式时间戳</td> 
   <td>GMT格式时间字符串</td> 
  </tr> 
 </tbody> 
</table>

1.  调用优先级
    
    隐式转换时会自动调用 `toString` 和 `valueOf` 方法，两者优先级如下：
2.  强制转化为字符串类型时，优先调用 `toString` 方法
    
    强制转换为数值类型时，优先调用 `valueOf` 方法
    
    使用运算符操作符情况下， `valueOf` 优先级高于 `toStirng`
    
    对象的类型转换见下一问。

### 8.你知道对象转换成原始值是什么流程吗 (ToPrimitive)？ 

对象转换成原始类型，会调用内置的 `[ToPrimitive]`函数

(参考博客: 从ECMA规范彻底理解 JavaScript 类型转换\[5\])

 *  `ToPrimitive` 方法接受两个参数，一个是输入的值 `input`，一个是期望转换的类型 `PreferredType`
 *  如果未传入 `PreferredType` 参数，让 `hint` 等于 `'default'`，后面会将 `hint` 修改为 `'number'`
    
    如果 `PreferredType` 是 `hint String`，让 `hint` 等于 `'string'`
    
    如果 `PreferredType` 是 `hint Number`，让 `hint` 等于 `'number'`
    
    返回 `OrdinaryToPrimitive(input, hint)`
 *  `OrdinaryToPrimitive(input, hint)`
 *  如果 `hint` 是 `'string'`，那么就将 `methodNames` 设置为 `toString、valueOf`
    
    如果 `hint` 是 `'number'`，那么就将 `methodNames` 设置为 `valueOf、toString`

> `methodName` 存储的就是当前 `preferredType` 下的调用优先级，如果全部调用完毕仍然未转化为原始值，会发生报错。

### 9.你能做出下面这个题吗？ 

```java
const a = {x:1};
const b = {x:2};
const obj = {};
obj[a] = 100;
obj[b] = 200;

console.log(obj[a]);
console.log(obj[b]);
复制代码
```

有了第七问和第八问的知识，这个题目就不难了。`JavaScript` 对象的键必须是字符串，因此分别需要将对象 `a` 和 `b` 转换为 `string` 类型。具体转换流程：

```java
// 1.执行ToPrimitive
// hint 为 string
ToPrimitive(a, 'hint String')
// 2.执行OrdinaryToPrimitive
OrdinaryToPrimitive(a, 'string')
// 3.返回methodNames
methodNames = ['toString', 'valueOf']
// 4.调用methodNames里方法
// 调用toString
a.toString() // 返回[object Object]
复制代码
```

对象 `a` 和 `b` 转换后的结果都是 `[object Object]`，`obj` 对象上只添加了一个属性 `[object Object]`。

答案

```java
200
200
复制代码
```

### 10.你能理清类型转换吗？ 

首先需要知道：在`JavaScript`中，只有三种类型的转换

 *  转换为 `Number`类型: `Number() / parseFloat() / parseInt()`
 *  转化为 `String`类型: `String() / toString()`
 *  转化为 `Boolean`类型: `Boolean()`

因此遇到类型转换问题，只需要弄清楚在什么场景之下转换成那种类型即可。

#### 转换为boolean 

 *  显式： `Boolean` 方法可以显式将值转换为布尔类型
 *  隐式：通常在逻辑判断或者有逻辑运算符时触发（ `|| && !`）

```java
Boolean(1)   // 显式类型转换
if (1) {}    // 逻辑判断类型触发隐式转换
!!1          // 逻辑运算符触发隐式转换
1 || 'hello' // 逻辑运算符触发隐式转换
复制代码
```

`boolean` 类型只有 `true` 和 `false` 两种值。

除值 0,-0,null,NaN,undefined,或空字符串（""） 为 `false` 外，其余全为 `true`

#### 转化为string 

 *  显式： `String` 方法可以显式将值转换为字符串
 *  隐式： `+` 运算符有一侧操作数为 `string` 类型时

转化为 `string` 类型的本质：需要转换为string的部分调用自身的toString方法(null/undefined返回字符串格式的null和undefined)

> 当被转换值为对象时，相当于执行 `ToPrimitive(input, 'hint String')`

```java
String([1,2,3]) // 1,2,3
String({x:1}) // [object Object]

1 + '1' // 11
1 + {} // 1[object Object]
复制代码
```

#### 转化为number 

 *  显式： `Number` 方法可以显式将值转化为数字类型

`Number` 的具体规则，`ES5` 规范中给了一个对应的结果表\[6\]

<table width="376"> 
 <thead> 
  <tr> 
   <th>类型</th> 
   <th>结果</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>undefined</td> 
   <td>NaN</td> 
  </tr> 
  <tr> 
   <td>null</td> 
   <td>+0</td> 
  </tr> 
  <tr> 
   <td>Boolean</td> 
   <td>NaN</td> 
  </tr> 
  <tr> 
   <td>undefined</td> 
   <td>参数为true返回1；false返回+0</td> 
  </tr> 
  <tr> 
   <td>Number</td> 
   <td>返回与之相等的值</td> 
  </tr> 
  <tr> 
   <td>String</td> 
   <td>有些复杂，举例说明</td> 
  </tr> 
  <tr> 
   <td>Object</td> 
   <td>先执行ToPrimitive方法，在执行Number类型转换</td> 
  </tr> 
 </tbody> 
</table>

1.  ```java
    `String`: 空字符串返回 `0`，出现任何一个非有效数字字符，返回 `NaN`
    ```

```java
console.log(Number("1 3")) // NaN
console.log(Number("abc")) // NaN
console.log(Number("1a")) // NaN
console.log(Number("0x11")) // 17
console.log(Number("123")) // 123
console.log(Number("-123")) // -123
console.log(Number("1.2")) // 1.2
复制代码
```

 *  隐式： `number`的隐式类型转换比较复杂，对需要隐式转换的部分执行 `Number`：
 *  比较操作( `<, >, <=, >=`)
    
    按位操作( `| & ^ ~`)
    
    算数操作( `+ - * / %`) 注意： +的操作数存在字符串时，为string转换
    
    一元 `+-` 操作

### 11.== 的隐式转换规则 

1.  `==`: 只需要值相等，无需类型相等； `null, undefined` 在 `==` 下互相等且自身等
2.  `==` 的转换规则:

<table width="376"> 
 <thead> 
  <tr> 
   <th>被比较数B</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><br></td> 
  </tr> 
  <tr> 
   <td>比较数A</td> 
  </tr> 
  <tr> 
   <td>Number</td> 
  </tr> 
  <tr> 
   <td>String</td> 
  </tr> 
  <tr> 
   <td>Boolean</td> 
  </tr> 
  <tr> 
   <td>Object</td> 
  </tr> 
 </tbody> 
</table>

在上面的表格中，`ToNumber(A)` 尝试在比较前将参数 `A` 转换为数字。`ToPrimitive(A)` 将参数 `A` 转换为原始值( `Primitive` )。

### 12.`1 + {}` 与 `{} + 1`的输出结果分别是什么？ 

通过上面的学习，当对象与其他元素相加时，对象会调用 `toPrimitive` 转化为原始值：

1.  执行 `toPrimitive`，未传入 `PreferredType`， `methodNames` 为 `[valueOf, toString]`
2.  执行 `({}).valueOf`，返回对象本身 `{}`，不是原始值
3.  继续执行 `({}).toString()`，返回 `"[object Object]"`，返回结果为原始值，转换结束

此时 `1 + {}`，右侧为 `string` 类型，将 `1` 进行 `ToString()` 转化为 `"1"` ，最后字符串连接，结果为 `"1[object Object]"`

注意：`{} + 1` 输出的结果会和 `1 + {}` 一样吗？

`{}` 在 `JavaScript` 中，不止可以作为对象定义，也可以作为代码块的定义。`js` 引擎会把 `{} + 1` 解析成1个代码块和1个+1，最终输出结果为 `1`

答案

```java
1[object Object]
1
复制代码
```

### 13.\[\]与\{\}的相加的结果是多少？ 

#### `[] + {}` 

数组是特殊的对象，需要调用 `toPrimitive`，转换为原始值

 *  执行 `toPrimitive`，未传入 `PreferredType`， `methodNames` 为 `[valueOf, toString]`
 *  执行 `[].valueOf`，返回数组本身
 *  执行 `[].toString`，返回空字符串 `''`

空对象不做赘述。

答案

```java
"[object Object]"
复制代码
```

#### `[] + []` 

类似 `1` 两个空数组都执行 `toPrimitive`，返回两个空字符串。

答案

```java
""
复制代码
```

#### `{} + []` 

类似于 `{} + 1`，`{} + []` 相当于 `{}; + []`，一元 `+` 强制将 `""` 隐式转换为`0`，最终结果为`0`

答案

```java
0
复制代码
```

#### `{} + {}` 

对于这个题，我先公布一下答案，之后说一下我的疑问。

答案

```java
[object Object][object Object]
复制代码
```

疑问

为什么 `JavaScript` 引擎没有将前面的 `{}` 解释成代码块？

> 友情提示：由于 `{}` 可以解释为代码块的形式，有些需要注意的地方，举个栗子:
> 
>  *  空对象调用方法时： `{}.toString()` 会报错
>  *  箭头函数返回对象时： `let getTempItem = id => { id: id, name: "Temp" }` 会报错

### 14.你能灵活运用 parseInt 与 parseFloat 吗 

1.  ```java
    `parseInt`：从数字类开始看，看到非数字类为止，返回原来的数。\(小数点也属于非有效数字\)
    ```

```java
parseInt('123x') -> 123
parseInt('-023x') -> -23
parseInt('1.1') -> 1
parseInt('-abc') -> NaN
parseInt('x123') -> NaN
复制代码
```

1.  `parseInt(string, radix)` 还有第二个参数 `radix` 表示要解析数字的基数，取值为 `2~36` (默认值为 `10`)
2.  `parseFloat` 与 `parseInt` 类似，只不过它返回浮点数。从数字类开始看，看到除了第一个点以外的非数字类为截止，返回前面的数。

#### 网红题：\['1','2','3'\].map(parseInt) 

这个网红题考察的就是 `parseInt` 有两个参数。`map` 传入的函数可执行三个参数：

```java
// ele   遍历的元素
// index 遍历的元素索引
// arr   数组
arr.map(function(ele, index, arr){})
复制代码
```

\['1','2','3'\].map(parseInt)相当于执行了以下三次过程：

```java
parseInt('1', 0, ['1','2','3'])
parseInt('2', 1, ['1','2','3'])
parseInt('3', 2, ['1','2','3'])
复制代码
```

 *  `parseInt('1', 0, ['1','2','3'])`: radix为0时，默认取10，最后返回1
 *  `parseInt('2', 1, ['1','2','3'])`: radix取值为2~36，返回NaN
 *  `parseInt('3', 2, ['1','2','3'])`: radix取值为2，二进制只包括0，1，返回NaN

### 15.如何让 if(a == 1 && a == 2) 条件成立？ 

`valueOf` 的应用

```java
var a = {
    value: 0,
    valueOf: function() {
        this.value++;
        return this.value;
    }
};
console.log(a == 1 && a == 2); //true
复制代码
```