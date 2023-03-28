- [Object.defineProperty()](#objectdefineproperty)
  - [3.深度监听一个对象](#3深度监听一个对象)
- [Proxy](#proxy)
  - [1.基本使用](#1基本使用)
  - [2.轻松解决Object.defineProperty中遇到的问题](#2轻松解决objectdefineproperty中遇到的问题)
  - [3.Proxy支持13种拦截操作](#3proxy支持13种拦截操作)
  - [4. Proxy中有关this的问题](#4-proxy中有关this的问题)
- [完结撒花](#完结撒花)

# Object.defineProperty() 

作用：在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。

1. 基本使用

语法：`Object.defineProperty(obj, prop, descriptor)`

参数：

1.  要添加属性的对象
2.  要定义或修改的属性的名称或 \[ `Symbol`\]
3.  要定义或修改的属性描述符

看一个简单的例子

```java
let person = {}
let personName = 'lihua'

//在person对象上添加属性namep,值为personName
Object.defineProperty(person, 'namep', {
    //但是默认是不可枚举的(for in打印打印不出来)，可：enumerable: true
    //默认不可以修改，可：wirtable：true
    //默认不可以删除，可：configurable：true
    get: function () {
        console.log('触发了get方法')
        return personName
    },
    set: function (val) {
        console.log('触发了set方法')
        personName = val
    }
})

//当读取person对象的namp属性时，触发get方法
console.log(person.namep)

//当修改personName时，重新访问person.namep发现修改成功
personName = 'liming'
console.log(person.namep)

// 对person.namep进行修改，触发set方法
person.namep = 'huahua'
console.log(person.namep)

\
```

通过这种方法，我们成功监听了person上的name属性的变化。

2.监听对象上的多个属性

上面的使用中，我们只监听了一个属性的变化，但是在实际情况中，我们通常需要一次监听多个属性的变化。

这时我们需要配合Object.keys(obj)进行遍历。这个方法可以返回obj对象身上的所有可枚举属性组成的字符数组。（其实用for in遍历也可以)  
下面是该API一个简单的使用效果：

```java
var obj = { 0: 'a', 1: 'b', 2: 'c' };
console.log(Object.keys(obj)); // console: ['0', '1', '2']
```

利用这个API，我们就可以遍历劫持对象的所有属性 但是如果只是上面的思路与该API的简单结合，我们就会发现并达不到效果，下面是我写的一个错误的版本：

```java
Object.keys(person).forEach(function (key) {
    Object.defineProperty(person, key, {
        enumerable: true,
        configurable: true,
        // 默认会传入this
        get() {
            return person[key]
        },
        set(val) {
            console.log(`对person中的${key}属性进行了修改`)
            person[key] = val
            // 修改之后可以执行渲染操作
        }
    })
})
console.log(person.age)
```

看起来感觉上面的代码没有什么错误，但是试着运行一下吧~你会和我一样栈溢出。这是为什么呢？让我们聚焦在get方法里，我们在访问person身上的属性时，就会触发get方法，返回person\[key\]，但是访问person\[key\]也会触发get方法，导致递归调用，最终栈溢出。

这也引出了我们下面的方法，我们需要设置一个中转Obsever，来让get中return的值并不是直接访问obj\[key\]。

```java
let person = {
    name: '',
    age: 0
}
// 实现一个响应式函数
function defineProperty(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            console.log(`访问了${key}属性`)
            return val
        },
        set(newVal) {
            console.log(`${key}属性被修改为${newVal}了`)
            val = newVal
        }
    })
}
// 实现一个遍历函数Observer
function Observer(obj) {
    Object.keys(obj).forEach((key) => {
        defineProperty(obj, key, obj[key])
    })
}
Observer(person)
console.log(person.age)
person.age = 18
console.log(person.age)
```

## 3.深度监听一个对象 

那么我们如何解决对象中嵌套一个对对象的情况呢？其实在上述代码的基础上，加上一个递归，就可以轻松实现啦~  


我们可以观察到，其实Obsever就是我们想要实现的监听函数，我们预期的目标是:只要把对象传入其中，就可以实现对这个对象的属性监视，即使该对象的属性也是一个对象。

我们在defineProperty()函数中，添加一个递归的情况：

```java
function defineProperty(obj, key, val) {
    //如果某对象的属性也是一个对象，递归进入该对象，进行监听
    if(typeof val === 'object'){
    observer(val)
    }
    Object.defineProperty(obj, key, {
        get() {
            console.log(`访问了${key}属性`)
            return val
        },
        set(newVal) {
            console.log(`${key}属性被修改为${newVal}了`)
            val = newVal
        }
    })
}
```

当然啦，我们也要在observer里面加一个递归停止的条件:

```java
function Observer(obj) {
    //如果传入的不是一个对象，return
    if (typeof obj !== "object" || obj === null) {
        return
    }
    // for (key in obj) {
    Object.keys(obj).forEach((key) => {
        defineProperty(obj, key, obj[key])
    })
    // }

}
```

其实到这里就差不多解决了，但是还有一个小问题，如果对某属性进行修改时，如果原本的属性值是一个字符串，但是我们重新赋值了一个对象，我们要如何监听新添加的对象的所有属性呢？其实也很简单，只需要修改set函数：

```java
set(newVal) {
    // 如果newVal是一个对象，递归进入该对象进行监听
    if(typeof val === 'object'){
        observer(key)
    }
    console.log(`${key}属性被修改为${newVal}了`)
    val = newVal
        }
```

到这里我们就完成啦~

4.监听数组

那么如果对象的属性是一个数组呢？我们要如何实现监听？请看下面一段代码：

```java
let arr = [1, 2, 3]
let obj = {}
//把arr作为obj的属性监听
Object.defineProperty(obj, 'arr', {
    get() {
        console.log('get arr')
        return arr
    },
    set(newVal) {
        console.log('set', newVal)
        arr = newVal
    }
})
console.log(obj.arr)//输出get arr [1,2,3]  正常
obj.arr = [1, 2, 3, 4] //输出set [1,2,3,4] 正常
obj.arr.push(3) //输出get arr 不正常，监听不到push
```

我们发现，通过`push`方法给数组增加的元素，set方法是监听不到的。

事实上，通过索引访问或者修改数组中已经存在的元素，是可以出发get和set的，但是对于通过push、unshift增加的元素，会增加一个索引，这种情况需要手动初始化，新增加的元素才能被监听到。另外，通过 pop 或 shift 删除元素，会删除并更新索引，也会触发 setter 和 getter 方法。

在Vue2.x中，通过重写Array原型上的方法解决了这个问题，此处就不展开说了，有兴趣的uu可以再去了解下~

# Proxy 

是不是感觉有点复杂？事实上，在上面的讲述中，我们还有问题没有解决：那就是当我们要给对象新增加一个属性时，也需要手动去监听这个新增属性。

> 也正是因为这个原因，使用vue给 data 中的数组或对象新增属性时，需要使用 vm.$set 才能保证新增的属性也是响应式的。

可以看到，通过Object.definePorperty()进行数据监听是比较麻烦的，需要大量的手动处理。这也是为什么在Vue3.0中尤雨溪转而采用Proxy。接下来让我们一起看一下Proxy是怎么解决这些问题的吧~

## 1.基本使用 

语法：`const p = new Proxy(target, handler)`

参数:

1.  target:要使用 `Proxy` 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）
2.  handler:一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为。

通过Proxy，我们可以对`设置代理的对象`上的一些操作进行拦截，外界对这个对象的各种操作，都要先通过这层拦截。（和defineProperty差不多）

先看一个简单例子

```java
//定义一个需要代理的对象
let person = {
    age: 0,
    school: '西电'
}
//定义handler对象
let hander = {
    get(obj, key) {
        // 如果对象里有这个属性，就返回属性值，如果没有，就返回默认值66
        return key in obj ? obj[key] : 66
    },
    set(obj, key, val) {
        obj[key] = val
        return true
    }
}
//把handler对象传入Proxy
let proxyObj = new Proxy(person, hander)

// 测试get能否拦截成功
console.log(proxyObj.age)//输出0
console.log(proxyObj.school)//输出西电
console.log(proxyObj.name)//输出默认值66

// 测试set能否拦截成功
proxyObj.age = 18
console.log(proxyObj.age)//输出18 修改成功
```

可以看出，Proxy代理的是整个对象，而不是对象的某个特定属性，不需要我们通过遍历来逐个进行数据绑定。

> 值得注意的是:之前我们在使用Object.defineProperty()给对象添加一个属性之后，我们对对象属性的读写操作仍然在对象本身。  
> 但是一旦使用Proxy，如果想要读写操作生效，我们就要对Proxy的实例对象`proxyObj`进行操作。

> 另外，MDN上明确指出set()方法应该返回一个布尔值，否则会报错`TypeError`。

## 2.轻松解决Object.defineProperty中遇到的问题 

在上面使用Object.defineProperty的时候，我们遇到的问题有：

1.一次只能对一个属性进行监听，需要遍历来对所有属性监听。这个我们在上面已经解决了。  
2. 在遇到一个对象的属性还是一个对象的情况下，需要递归监听。  
3. 对于对象的新增属性，需要手动监听  
4. 对于数组通过push、unshift方法增加的元素，也无法监听

这些问题在Proxy中都轻松得到了解决，让我们看看以下代码。

检验第二个问题

在上面代码的基础上，我们让对象的结构变得更复杂一些。

```java
let person = {
    age: 0,
    school: '西电',
    children: {
        name: '小明'
    }
}
let hander = {
    get(obj, key) {
        return key in obj ? obj[key] : 66
    }, set(obj, key, val) {
        obj[key] = val
        return true
    }
}
let proxyObj = new Proxy(person, hander)

// 测试get
console.log(proxyObj.children.name)//输出：小明
console.log(proxyObj.children.height)//输出：undefined
// 测试set
proxyObj.children.name = '菜菜'
console.log(proxyObj.children.name)//输出: 菜菜
```

可以看到成功监听到了children对象身上的name属性（至于为什么children.height是undefined，可以再讨论一下)

检验第三个问题

这个其实在基本使用里面已经提到了，访问的proxyObj.name就是原本对象上不存在的属性，但是我们访问它的时候，仍然们可以被get拦截到。

检验第四个问题

```java
let subject = ['高数']
let handler = {
    get(obj, key) {
        return key in obj ? obj[key] : '没有这门学科'
    }, set(obj, key, val) {
        obj[key] = val
        //set方法成功时应该返回true，否则会报错
        return true
    }
}

let proxyObj = new Proxy(subject, handler)

// 检验get和set
console.log(proxyObj)//输出  [ '高数' ]
console.log(proxyObj[1])//输出  没有这门学科
proxyObj[0] = '大学物理'
console.log(proxyObj)//输出  [ '大学物理' ]

// // 检验push增加的元素能否被监听
proxyObj.push('线性代数')
console.log(proxyObj)//输出 [ '大学物理', '线性代数' ]
```

至此，我们之前的问题完美解决。

## 3.Proxy支持13种拦截操作 

除了get和set来拦截读取和赋值操作之外，Proxy还支持对其他多种行为的拦截。下面是一个简单介绍，想要深入了解的可以去MDN上看看。

 *  get(target, propKey, receiver)：拦截对象属性的读取，比如proxy.foo和proxy\['foo'\]。
 *  set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v或proxy\['foo'\] = v，返回一个布尔值。
 *  has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值。
 *  deleteProperty(target, propKey)：拦截delete proxy\[propKey\]的操作，返回一个布尔值。
 *  ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。
 *  getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。
 *  defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。
 *  preventExtensions(target)：拦截Object.preventExtensions(proxy)，返回一个布尔值。
 *  getPrototypeOf(target)：拦截Object.getPrototypeOf(proxy)，返回一个对象。
 *  isExtensible(target)：拦截Object.isExtensible(proxy)，返回一个布尔值。
 *  setPrototypeOf(target, proto)：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
 *  apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。
 *  construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。

## 4. Proxy中有关this的问题 

虽然Proxy完成了对目标对象的代理，但是它不是`透明代理`,也就是说：即使handler为空对象（即不做任何代理），他所代理的对象中的this指向也不是该对象，而是proxyObj对象。让我们来看一个例子：

```java
let target = {
    m() {
        // 检查this的指向是不是proxyObkj
        console.log(this === proxyObj)
    }
}
let handler = {}
let proxyObj = new Proxy(target, handler)

proxyObj.m()//输出:true
target.m()//输出:false
```

可以看到，被代理的对象target内部的this指向了proxyObj。这种指向有时候就会导致问题出现，我们来看看下面一个例子：

```java
const _name = new WeakMap();
class Person {
   //把person的name存储到_name的name属性上
  constructor(name) {
    _name.set(this, name);
  }
  //获取person的name属性时，返回_name的name
  get name() {
    return _name.get(this);
  }
}

const jane = new Person('Jane');
jane.name // 'Jane'

const proxyObj = new Proxy(jane, {});
proxyObj.name // undefined
```

在上面的例子中，由于jane对象的name属性的获取依靠this的指向，而this又指向proxyObj，所以导致了无法正常代理。

除此之外，有的js内置对象的内部属性，也依靠正确的this才能获取，所以Proxy 也无法代理这些原生对象的属性。请看下面一个例子：

```java
const target = new Date();
const handler = {};
const proxyObj = new Proxy(target, handler);

proxyObj.getDate();
// TypeError: this is not a Date object.
```

可以看到，通过proxy代理访问Date对象中的getDate方法时抛出了一个错误，这是因为getDate方法只能在Date对象实例上面拿到，如果this不是Date对象实例就会报错。那么我们要如何解决这个问题呢？只要手动把this绑定在Date对象实例上即可，请看下面一个例子：

```java
const target = new Date('2015-01-01');
const handler = {
    get(target, prop) {
        if (prop === 'getDate') {
            return target.getDate.bind(target);
        }
        return Reflect.get(target, prop);
    }
};
const proxy = new Proxy(target, handler);
proxy.getDate() // 1
```

# 完结撒花 

至此，我的总结就结束啦~ 文章不是很全面，还有很多地方没有讲到,比如：

1.  Proxy常常搭配 `Reflect` 使用
2.  我们常 `Object.create()` 方法把Proxy实例对象添加到Object的原型对象上，这样我们就可以直接Object.proxyObj了
3.  有兴趣的uu可以在Proxy的get和set里加上输出试试，你会发现在我们调用push方法时， `get和set会分别输出两次` ，这是为什么呢？

学无止境，让我们一起努力叭~

参考文章:

1.Proxy 与Object.defineProperty介绍与对比

2.MDN Proxy
