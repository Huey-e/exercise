说到处理数组的方法，想必大家都不陌生了，今天我们一起来学习下理数组常见场景下的🆕方法。

首先来看看 `reduce` 方法可以传入哪些参数![image_b8706b67.png](http://markdown.liangtengyu.com:9999/images//image_b8706b67.png)

```java
function(pre,cur,index,arr)
```

 *  pre:必需，初始值或计算结束后的返回值
 *  cur:非必需，当前处理的元素
 *  index:非必需，当前处理元素的索引
 *  arr:非必需，当前元素所属的数组对象

直接看看🌰

```java
const list = [1,2,3,4,5]
const result = list.reduce(function (pre, cur, index, arr) {
  console.log('pre:' + pre, 'cur:' + cur, 'index:' + index)
  return pre + cur
})
console.log(result)

// => pre:1 cur:2 index:1
// => pre:3 cur:3 index:2
// => pre:6 cur:4 index:3
// => pre:10 cur:5 index:4
// => 15
```

可以看到，第一轮pre的值是数组的第一个值，然后当前处理元素直接是元素的第二个数据，索引是数组的1。第二轮的pre就是第一次逻辑处理 `return pre + cur` 返回的结果(即3)。以此类推...共循环4轮。

再来看个相乘的处理逻辑的:

```java
const list = [1,2,3,4,5]
const result = list.reduce(function (pre, cur, index, arr) {
  console.log('pre:' + pre, 'cur:' + cur, 'index:' + index)
  return pre * cur
})
console.log(result)

// => pre:1 cur:2 index:1
// => pre:2 cur:3 index:2
// => pre:6 cur:4 index:3
// => pre:24 cur:5 index:4
// => 120
```

看着这么复杂，能举个再简单的例子吗？别问，问就是有！

```java
const result = list.reduce((pre, cur) => pre + cur)
console.log(result) // => 15
```

简单后再来个高级点的尝鲜下

### 数组去重 

将数组传输之前，我们先来了解下 `reduce` 的另外一个，即 initialValue。它是代表传递给函数的初始值，「可以理解为给pre设置了默认的值」。

```java
const list = [1,1,3,5,5,7,9]
let arr = list.reduce((pre,cur)=>{
  if(!pre.includes(cur)){
    return pre.concat(cur)
  }else{
    return pre
  }
},[]) // => 给pre设置默认的空数组[]
console.log(arr) // => [1, 3, 5, 7, 9]
```

可以看到list数组的长度为7，共循环7次(设置默认的空数组，导致cur第一轮是数组的第一个数据)。每循环一次就判断pre数组里存不存在当前循环的元素，若不存在则加入到pre数组去，否则就直接退出当前循环。

### 数组二维转一维 

```java
let arr = [1,2,[4, 6], [1, 6], [2, 2]]
let newArr = arr.reduce((pre,cur)=>{
  return pre.concat(cur)
},[])
console.log(newArr) // => [1, 2, 4, 6, 1, 6, 2, 2]
```

这里其实也就是利用了数组的 `concat` 方法，跟上面的使用也是大同小异，理顺一下就可以理解的了。

### 数组多维转一维 

```java
let arr = [1, 2, [4, 6], [1, 6, [3, 6]], [1, [3, 4, [1, 2]], [2, 2]]]
const newArr = (arr) => {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? newArr(cur) : cur)
  }, [])
}
console.log(newArr(arr)) // => [1, 2, 4, 6, 1, 6, 3, 6, 1, 3, 4, 1, 2, 2, 2]
```

这里使用了 三目运算 、 concat 数据拼接 、递归 的思路完成。先判断当前处理的元素(有可能是数组)是不是数组(Array.isArray(cur)),如果是再次执行newArr,否则就直接处理当前元素，即将cur拼接进之前处理的数组中。

### 计算元素出现个数 

讲解这个之前我们先来回忆下for...in的用法:

> ❝
> 
> for...in 声明用于对数组或者对象的属性进行循环/迭代操作。
> 
> ❞

直接上🌰

```java
var arr = ['张三','李四','王五']    
for (let x in arr)  
{  
  console.log(x)
  // => 张三
  // => 李四
  // => 王五
}  
```

可以看到当arr为数组时 x 相当于 for 循环的⬇️ 标

那当arr为对象呢？

```java
const obj = {  
  name: "张三",  
  age: 18,  
  height: "180"  
}  
for(let key in obj){  
  console.log(key) 
  // => name
  // => age
  // => height
}  
```

可以看到当循环的“对象”是对象时，循环的单项就是对象的属性。

所以我们可以根据这个特性来判断对象是否为数组/对象的元素/属性。

```java
// 数组时判断下标
let arr = ["a","b","2","3"] 
console.log("b" in arr) // => false
console.log(2 in arr) // => true

// 对象时判断属性
let obj = {a:"a",b:"b",c:"2",d:"3"} 
console.log("b" in obj) // => true
console.log(2 in obj) // => false
```

好的，回忆完这些知识，我们来看看怎么完成这个需求![image_8136c9aa.png](http://markdown.liangtengyu.com:9999/images//image_8136c9aa.png)

```java
let names = ['张三', '李四', '张三', '王五', '王五', '王五']
let total = names.reduce((pre,cur)=>{
  if(cur in pre){
    pre[cur]++
    console.log("判断为真:")
    console.log(pre)
  }else{
    pre[cur] = 1
    console.log("判断为假:")
    console.log(pre)
  }
  return pre
},{})
console.log(total); // => {张三: 2, 李四: 1, 王五: 3}
```

首先先传入一个\{\}对象，说明初始的pre为\{\}。那么第一轮判断if的时候就变成 `'张三' in {}` 很明显此时判断条件是 false 。所以就执行 else 里面的逻辑后变成:`{'张三':1}`。第二轮时 李四 也是如此。当第三轮时再次遇到“张三”,此时对象是 `{'张三':1,'李四':1}` ,所以if判断是 true ,所以张三直接+1。来看看打印情况:

```java
判断为假:
// => {张三: 1}
判断为假:
// => {张三: 1, 李四: 1}
判断为真:
// => {张三: 2, 李四: 1}
判断为假:
// => {张三: 2, 李四: 1, 王五: 1}
判断为真:
// => {张三: 2, 李四: 1, 王五: 2}
判断为真:
// => {张三: 2, 李四: 1, 王五: 3}
```

### 属性求和 

```java
const list = [
  {
    name: '张三',
    age: 18
  },
  {
    name: '李四',
    age: 20
  },
  {
    name: '王五',
    age: 22
  }
]
let total = list.reduce((pre, cur) => {
  console.log(cur) 
  // => {name: '张三', age: 18}
  // => {name: '李四', age: 20}
  // => {name: '王五', age: 22}
  return cur.age + pre
}, 0)
console.log(total) // => 60
```

如此是不是省了使用 map 去求和呢？更简便可以这么写:

```java
let total = list.reduce((pre, cur) => cur.age + pre, 0)
```

到此，今日的前端发现知识分享就到此结束了。喜欢文章的小伙伴可以点个赞、点个关注、点个在看啦![image_2a503c81.png](http://markdown.liangtengyu.com:9999/images//image_2a503c81.png)
