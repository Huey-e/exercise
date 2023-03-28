给出一大些面试题，然后不给答案。前端本来就卷，一些面试官看了文章后可能在自己都不知道答案的情况下，就跑去问面试者。我其实挺反感的这类文章的。

## ts基础知识复习 

juejin.cn/post/684490…\[1\]

## 😊 ts中的访问修饰符 

 *  public，任何地方
 *  private，只能在类的内部访问
 *  protected，能在类的内部访问和子类中访问
 *  readonly，属性设置为只读

## 😊 const和readonly的区别 

1.  const用于变量，readonly用于属性
2.  const在运行时检查，readonly在编译时检查
3.  使用const变量保存的数组，可以使用push，pop等方法。但是如果使用 `ReadonlyArray<number>`声明的数组不能使用push，pop等方法。

## 😊 枚举和常量枚举（const枚举）的区别 

1.  ```java
    枚举会被编译时会编译成一个对象，可以被当作对象使用
    ```
2.  ```java
    const枚举会在ts编译期间被删除，避免额外的性能开销
    ```

```java
// 普通枚举
enum Witcher {
  Ciri = 'Queen',
  Geralt = 'Geralt of Rivia'
}
function getGeraltMessage(arg: {[key: string]: string}): string {
  return arg.Geralt
}
getGeraltMessage(Witcher) // Geralt of Rivia
复制代码
```

```java
// const枚举
const enum Witcher {
  Ciri = 'Queen',
  Geralt = 'Geralt of Rivia'
}
const witchers: Witcher[] = [Witcher.Ciri, Witcher.Geralt]
// 编译后
// const witchers = ['Queen', 'Geralt of Rivia'
复制代码
```

## 😊 ts中interface可以给Function/Array/Class做声明吗？ 

```java
// 函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
复制代码
```

```java
// Array
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];
复制代码
```

```java
// Class, constructor存在于类的静态部分，所以不会检查
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}
复制代码
```

## ts中的this和js中的this有什么差异？ 

不了解

## 😊 ts中如何枚举联合类型的key? 

```java
type Name = { name: string }
type Age = { age: number }
type Union = Name | Age

type UnionKey<P> = P extends infer P ? keyof P : never

type T = UnionKey<Union>
复制代码
```

## 😊 ts中 ?.、??、!.、\_、\*\* 等符号的含义？ 

 *  ?. 可选链
 *  ?? ?? 类似与短路或，??避免了一些意外情况0，NaN以及"",false被视为false值。只有undefind,null被视为false值。
 *  !. 在变量名后添加!，可以断言排除undefined和null类型
 *  \_ , 声明该函数将被传递一个参数，但您并不关心它
 *  \*\* 求幂
 *  !:，待会分配这个变量，ts不要担心

```java
// ??
let x = foo ?? bar();
// 等价于
let x = foo !== null && foo !== undefined ? foo : bar();

// !.
let a: string | null | undefined
a.length // error
a!.length // ok
复制代码
```

## 😊 什么是抗变、双变、协变和逆变？ 

 *  Covariant 协变，TS对象兼容性是协变，父类 <= 子类，是可以的。子类 <= 父类，错误。
 *  Contravariant 逆变，禁用 `strictFunctionTypes`编译，函数参数类型是逆变的，父类 <= 子类，是错误。子类 <= 父类，是可以的。
 *  Bivariant 双向协变，函数参数的类型默认是双向协变的。父类 <= 子类，是可以的。子类 <= 父类，是可以的。

## 😊 ts中同名的interface或者同名的interface和class可以合并吗？ 

1.  interface会合并
2.  class不可以合并

## 😊 如何使ts项目引入并识别编译为js的npm库包？ 

1.  `npm install @types/xxxx`
2.  自己添加描述文件

## 😊 ts如何自动生成库包的声明文件？ 

可以配置`tsconfig.json`文件中的`declaration`和`outDir`

1.  declaration: true, 将会自动生成声明文件
2.  outDir: '', 指定目录

## 😊 什么是泛型 

泛型用来来创建可重用的组件，一个组件可以支持多种类型的数据。这样用户就可以以自己的数据类型来使用组件。简单的说，“泛型就是把类型当成参数”。

## 😊 -?，-readonly 是什么含义 

用于删除修饰符

```java
type A = {
    a: string;
    b: number;
}

type B = {
    [K in keyof A]?: A[K]
}

type C = {
    [K in keyof B]-?: B[K]
}

type D = {
    readonly [K in keyof A]: A[K]
}

type E = {
    -readonly [K in keyof A]: A[K]
}
复制代码
```

## 😊 TS是基于结构类型兼容 

typescript的类型兼容是基于结构的，不是基于名义的。下面的代码在ts中是完全可以的，但在java等基于名义的语言则会抛错。

```java
interface Named { name: string }
class Person {
  name: string
}
let p: Named
// ok
p = new Person()
复制代码
```

## 😊 const断言 

const断言，typescript会为变量添加一个自身的字面量类型

1.  ```java
    对象字面量的属性，获得readonly的属性，成为只读属性
    ```
2.  ```java
    数组字面量成为readonly tuple只读元组
    ```
3.  ```java
    字面量类型不能被扩展（比如从hello类型到string类型）
    ```

```java
// type '"hello"'
let x = "hello" as const
// type 'readonly [10, 20]'
let y = [10, 20] as const
// type '{ readonly text: "hello" }'
let z = { text: "hello" } as const
复制代码
```

## 😊 type 和 interface 的区别 

1.  类型别名可以为任何类型引入名称。例如基本类型，联合类型等
2.  类型别名不支持继承
3.  类型别名不会创建一个真正的名字
4.  类型别名无法被实现(implements)，而接口可以被派生类实现
5.  类型别名重名时编译器会抛出错误，接口重名时会产生合并

## 😊 implements 与 extends 的区别 

 *  extends, 子类会继承父类的所有属性和方法。
 *  implements，使用implements关键字的类将需要实现需要实现的类的所有属性和方法。

## 😊 枚举和 object 的区别 

1.  枚举可以通过枚举的名称，获取枚举的值。也可以通过枚举的值获取枚举的名称。
2.  object只能通过key获取value
3.  数字枚举在不指定初始值的情况下，枚举值会从0开始递增。
4.  虽然在运行时，枚举是一个真实存在的对象。但是使用keyof时的行为却和普通对象不一致。必须使用keyof typeof才可以获取枚举所有属性名。

## 😊 never, void 的区别 

 *  never，never表示永远不存在的类型。比如一个函数总是抛出错误，而没有返回值。或者一个函数内部有死循环，永远不会有返回值。函数的返回值就是never类型。
 *  void, 没有显示的返回值的函数返回值为void类型。如果一个变量为void类型，只能赋予undefined或者null。

## unknown, any的区别 

unknown类型和any类型类似。与any类型不同的是。unknown类型可以接受任意类型赋值，但是unknown类型赋值给其他类型前，必须被断言

## 😊 如何在 window 扩展类型 

```java
declare global {
  interface Window {
    myCustomFn: () => void;
  }
}
复制代码
```

## 复杂的类型推导题目 

### 🤔 implement UnionToIntersection 

```java
type A = UnionToIntersection<{a: string} | {b: string} | {c: string}> 
// {a: string} & {b: string} & {c: string}

// 实现UnionToIntersection<T>
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
// https://jkchao.github.io/typescript-book-chinese/tips/infer.html#%E4%B8%80%E4%BA%9B%E7%94%A8%E4%BE%8B
复制代码
```

### 😊 implement ToNumber 

```java
type A = ToNumber<'1'> // 1
type B = ToNumber<'40'> // 40
type C = ToNumber<'0'> // 0

// 实现ToNumber
type ToNumber<T extends string, R extends any[] = []> =
    T extends `${R['length']}` ? R['length'] : ToNumber<T, [1, ...R]>;
复制代码
```

### 😊 implement Add<A, B> 

```java
type A = Add<1, 2> // 3
type B = Add<0, 0> // 0

// 实现ADD
type NumberToArray<T, R extends any[]> = T extends R['length'] ? R : NumberToArray<T, [1, ...R]>
type Add<T, R> = [...NumberToArray<T, []>, ...NumberToArray<R, []>]['length']
复制代码
```

### 😊 implement SmallerThan<A, B> 

```java
type A = SmallerThan<0, 1> // true
type B = SmallerThan<1, 0> // false
type C = SmallerThan<10, 9> // false

// 实现SmallerThan
type SmallerThan<N extends number, M extends number, L extends any[] = [], R extends any[] = []> = 
    N extends L['length'] ? 
        M extends R['length'] ? false : true
        :
        M extends R['length'] ? false : SmallerThan<N, M, [1, ...L], [1, ...R]>;
复制代码
```

### 😊 implement LargerThan<A, B> 

```java
type A = LargerThan<0, 1> // false
type B = LargerThan<1, 0> // true
type C = LargerThan<10, 9> // true

// 实现LargerThan
type LargerThan<N extends number, M extends number, L extends any[] = [], R extends any[] = []> =
    N extends L['length'] ?
        false : M extends R['length'] ?
            true : LargerThan<N, M, [1, ...L], [1, ...R]>;
复制代码
```

### 😊 implement IsAny 

```java
type A = IsAny<string> // false
type B = IsAny<any> // true
type C = IsAny<unknown> // false
type D = IsAny<never> // false

// 实现IsAny
type IsAny<T> = true extends (T extends never ? true : false) ?
                  false extends (T extends never ? true : false) ?
                    true
                    :
                    false
                  :
                  false;

// 更简单的实现
type IsAny<T> = 0 extends (T & 1) ? true : false;
复制代码
```

### 😊 implement Filter<T, A> 

```java
type A = Filter<[1,'BFE', 2, true, 'dev'], number> // [1, 2]
type B = Filter<[1,'BFE', 2, true, 'dev'], string> // ['BFE', 'dev']
type C = Filter<[1,'BFE', 2, any, 'dev'], string> // ['BFE', any, 'dev']

// 实现Filter
type Filter<T extends any[], A, N extends any[] = []> =
    T extends [infer P, ...infer Q] ?
        0 extends (P & 1) ? Filter<Q, A, [...N, P]> : 
        P extends A ? Filter<Q, A, [...N, P]> : Filter<Q, A, N>
        : N;
复制代码
```

### 😊 implement TupleToString 

```java
type A = TupleToString<['a']> // 'a'
type B = TupleToString<['B', 'F', 'E']> // 'BFE'
type C = TupleToString<[]> // ''

// 实现TupleToString
type TupleToString<T extends any[], S extends string = '', A extends any[] = []> =
    A['length'] extends T['length'] ? S : TupleToString<T, `${S}${T[A['length']]}`, [1, ...A]>
复制代码
```

### 😊 implement RepeatString<T, C> 

```java
type A = RepeatString<'a', 3> // 'aaa'
type B = RepeatString<'a', 0> // ''

// 实现RepeatString
type RepeatString<T extends string, C extends number, S extends string = '', A extends any[] = []> =
    A['length'] extends C ? S : RepeatString<T, C, `${T}${S}`, [1, ...A]>
复制代码
```

### 😊 implement Push<T, I> 

```java
type A = Push<[1,2,3], 4> // [1,2,3,4]
type B = Push<[1], 2> // [1, 2]
type C = Push<[], string> // [string]

// 实现Push
type Push<T extends any[], I> = T extends [...infer P] ? [...P, I] : [I]
复制代码
```

### 😊 implement Flat 

```java
type A = Flat<[1,2,3]> // [1,2,3]
type B = Flat<[1,[2,3], [4,[5,[6]]]]> // [1,2,3,4,5,6]
type C = Flat<[]> // []

// 实现Flat
type Flat<T extends any[]> =
    T extends [infer P, ...infer Q] ?
        P extends any[] ? [...Flat<P>, ...Flat<Q>] : [P, ...Flat<Q>]
        : [];
复制代码
```

### 😊 implement Shift 

```java
type A = Shift<[1,2,3]> // [2,3]
type B = Shift<[1]> // []
type C = Shift<[]> // []

// 实现Shift
type Shift<T extends any[]> = T extends [infer P, ...infer Q] ? [...Q] : [];
复制代码
```

### 😊 implement Repeat<T, C> 

```java
type A = Repeat<number, 3> // [number, number, number]
type B = Repeat<string, 2> // [string, string]
type C = Repeat<1, 1> // [1, 1]
type D = Repeat<0, 0> // []

// 实现Repeat
type Repeat<T, C, R extends any[] = []> = 
    R['length'] extends C ? R : Repeat<T, C, [...R, T]>
复制代码
```

### 😊 implement ReverseTuple 

```java
type A = ReverseTuple<[string, number, boolean]> // [boolean, number, string]
type B = ReverseTuple<[1,2,3]> // [3,2,1]
type C = ReverseTuple<[]> // []

// 实现ReverseTuple
type ReverseTuple<T extends any[], A extends any[] = []> =
    T extends [...infer Q, infer P] ? 
        A['length'] extends T['length'] ? A : ReverseTuple<Q, [...A, P]>
        : A;
复制代码
```

### 😊 implement UnwrapPromise 

```java
type A = UnwrapPromise<Promise<string>> // string
type B = UnwrapPromise<Promise<null>> // null
type C = UnwrapPromise<null> // Error

// 实现UnwrapPromise
type UnwrapPromise<T> = T extends Promise<infer P> ? P : Error;
复制代码
```

### 😊 implement LengthOfString 

```java
type A = LengthOfString<'BFE.dev'> // 7
type B = LengthOfString<''> // 0

// 实现LengthOfString
type LengthOfString<T extends string, A extends any[] = []> =
    T extends `${infer P}${infer Q}` ? LengthOfString<Q, [1, ...A]> : A['length']
复制代码
```

### 😊 implement StringToTuple 

```java
type A = StringToTuple<'BFE.dev'> // ['B', 'F', 'E', '.', 'd', 'e','v']
type B = StringToTuple<''> // []

// 实现
type StringToTuple<T extends string, A extends any[] = []> =
    T extends `${infer K}${infer P}` ? StringToTuple<P, [...A, K]> : A;
复制代码
```

### 😊 implement LengthOfTuple 

```java
type A = LengthOfTuple<['B', 'F', 'E']> // 3
type B = LengthOfTuple<[]> // 0

// 实现
type LengthOfTuple<T extends any[], R extends any[] = []> =
    R['length'] extends T['length'] ? R['length'] : LengthOfTuple<T, [...R, 1]>
复制代码
```

### 😊 implement LastItem 

```java
type A = LastItem<[string, number, boolean]> // boolean
type B = LastItem<['B', 'F', 'E']> // 'E'
type C = LastItem<[]> // never

// 实现LastItem
type LastItem<T> = T extends [...infer P, infer Q] ? Q : never;
复制代码
```

### 😊 implement FirstItem 

```java
type A = FirstItem<[string, number, boolean]> // string
type B = FirstItem<['B', 'F', 'E']> // 'B'

// 实现FirstItem
type FirstItem<T> = T extends [infer P, ...infer Q] ? P : never;
复制代码
```

### 😊 implement FirstChar 

```java
type A = FirstChar<'BFE'> // 'B'
type B = FirstChar<'dev'> // 'd'
type C = FirstChar<''> // never

// 实现FirstChar
type FirstChar<T> = T extends `${infer P}${infer Q}` ? P : never;
复制代码
```

### 😊 implement Pick<T, K> 

```java
type Foo = {
  a: string
  b: number
  c: boolean
}

type A = MyPick<Foo, 'a' | 'b'> // {a: string, b: number}
type B = MyPick<Foo, 'c'> // {c: boolean}
type C = MyPick<Foo, 'd'> // Error

// 实现MyPick<T, K>
type MyPick<T, K extends keyof T> = {
    [Key in K]: T[Key]
}
复制代码
```

### 😊 implement Readonly 

```java
type Foo = {
  a: string
}

const a:Foo = {
  a: 'BFE.dev',
}
a.a = 'bigfrontend.dev'
// OK

const b:MyReadonly<Foo> = {
  a: 'BFE.dev'
}
b.a = 'bigfrontend.dev'
// Error

// 实现MyReadonly
type MyReadonly<T> = {
    readonly [K in keyof T]: T[K]
}
复制代码
```

### 😊 implement Record<K, V> 

```java
type Key = 'a' | 'b' | 'c'

const a: Record<Key, string> = {
  a: 'BFE.dev',
  b: 'BFE.dev',
  c: 'BFE.dev'
}
a.a = 'bigfrontend.dev' // OK
a.b = 123 // Error
a.d = 'BFE.dev' // Error

type Foo = MyRecord<{a: string}, string> // Error

// 实现MyRecord
type MyRecord<K extends number | string | symbol, V> = {
    [Key in K]: V
}
复制代码
```

### 🤔️ implement Exclude 

```java
type Foo = 'a' | 'b' | 'c'

type A = MyExclude<Foo, 'a'> // 'b' | 'c'
type B = MyExclude<Foo, 'c'> // 'a' | 'b
type C = MyExclude<Foo, 'c' | 'd'>  // 'a' | 'b'
type D = MyExclude<Foo, 'a' | 'b' | 'c'>  // never

// 实现 MyExclude<T, K>
type MyExclude<T, K> = T extends K ? never : T;
复制代码
```

### 🤔️ implement Extract<T, U> 

```java
type Foo = 'a' | 'b' | 'c'

type A = MyExtract<Foo, 'a'> // 'a'
type B = MyExtract<Foo, 'a' | 'b'> // 'a' | 'b'
type C = MyExtract<Foo, 'b' | 'c' | 'd' | 'e'>  // 'b' | 'c'
type D = MyExtract<Foo, never>  // never

// 实现MyExtract<T, U>
type MyExtract<T, U> = T extends U ? T : never
复制代码
```

### 😊 implement Omit<T, K> 

```java
type Foo = {
  a: string
  b: number
  c: boolean
}

type A = MyOmit<Foo, 'a' | 'b'> // {c: boolean}
type B = MyOmit<Foo, 'c'> // {a: string, b: number}
type C = MyOmit<Foo, 'c' | 'd'> // {a: string, b: number}

// 实现MyOmit
type MyOmit<T, K extends number | string | symbol> = {
    [Key in Exclude<keyof T, K>]: T[Key]
}

type MyOmit<T, K extends number | string | symbol> = Pick<T, Exclude<keyof T, K>>
复制代码
```

### 😊 implement NonNullable 

```java
type Foo = 'a' | 'b' | null | undefined

type A = MyNonNullable<Foo> // 'a' | 'b'

// 实现NonNullable
type MyNonNullable<T> = T extends null | undefined ? never : T;
复制代码
```

### 😊 implement Parameters 

```java
type Foo = (a: string, b: number, c: boolean) => string

type A = MyParameters<Foo> // [a:string, b: number, c:boolean]
type B = A[0] // string
type C = MyParameters<{a: string}> // Error

// 实现MyParameters<T>
type MyParameters<T extends (...params: any[]) => any> =
    T extends (...params: [...infer P]) => any ? P : never
复制代码
```

### 😊 implement ConstructorParameters 

```java
class Foo {
  constructor (a: string, b: number, c: boolean) {}
}

type C = MyConstructorParameters<typeof Foo> 
// [a: string, b: number, c: boolean]

// 实现MyConstructorParameters<T>
type MyConstructorParameters<T extends new (...params: any[]) => any> =
    T extends new (...params: [...infer P]) => any ? P : never
复制代码
```

### 😊 implement ReturnType 

```java
type Foo = () => {a: string}

type A = MyReturnType<Foo> // {a: string}

// 实现MyReturnType<T>
type MyReturnType<T extends (...params: any[]) => any> =
    T extends (...params: any[]) => infer P ? P : never;
复制代码
```

### 😊 implement InstanceType 

```java
class Foo {}
type A = MyInstanceType<typeof Foo> // Foo
type B = MyInstanceType<() => string> // Error

// 实现MyInstanceType<T>
type MyInstanceType<T extends new (...params: any[]) => any> =
    T extends new (...params: any[]) => infer P ? P : never;
复制代码
```

### 😊 implement ThisParameterType 

```java
function Foo(this: {a: string}) {}
function Bar() {}

type A = MyThisParameterType<typeof Foo> // {a: string}
type B = MyThisParameterType<typeof Bar> // unknown

// 实现MyThisParameterType<T>
type MyThisParameterType<T extends (this: any, ...params: any[]) => any> =
    T extends (this: infer P, ...params: any[]) => any ? P : unknown;
复制代码
```

### 😊 implement TupleToUnion 

```java
type Foo = [string, number, boolean]

type Bar = TupleToUnion<Foo> // string | number | boolean

// 实现TupleToUnion<T>
type TupleToUnion<T extends any[], R = T[0]> =
    T extends [infer P, ...infer Q] ? TupleToUnion<Q, R | P> : R;

// 其他回答
type TupleToUnion<T extends any[]> = T[number]
复制代码
```

### 😊 implement Partial 

```java
type Foo = {
  a: string
  b: number
  c: boolean
}

// below are all valid

const a: MyPartial<Foo> = {}

const b: MyPartial<Foo> = {
  a: 'BFE.dev'
}

const c: MyPartial<Foo> = {
  b: 123
}

const d: MyPartial<Foo> = {
  b: 123,
  c: true
}

const e: MyPartial<Foo> = {
  a: 'BFE.dev',
  b: 123,
  c: true
}

// 实现MyPartial<T>
type MyPartial<T> = {
    [K in keyof T]?: T[K]
}
复制代码
```

### 😊 Required 

```java
// all properties are optional
type Foo = {
  a?: string
  b?: number
  c?: boolean
}


const a: MyRequired<Foo> = {}
// Error

const b: MyRequired<Foo> = {
  a: 'BFE.dev'
}
// Error

const c: MyRequired<Foo> = {
  b: 123
}
// Error

const d: MyRequired<Foo> = {
  b: 123,
  c: true
}
// Error

const e: MyRequired<Foo> = {
  a: 'BFE.dev',
  b: 123,
  c: true
}
// valid

// 实现MyRequired<T>
type MyRequired<T> = {
    [K in keyof T]-?: T[K]
}
复制代码
```

### 😊 implement LastChar 

```java
type A = LastChar<'BFE'> // 'E'
type B = LastChar<'dev'> // 'v'
type C = LastChar<''> // never

// 实现FirstChar<T>
type LastChar<T extends string, A extends string[] = []> =
    T extends `${infer P}${infer Q}` ?  LastChar<Q, [...A, P]> :
        A extends [...infer L, infer R] ? R : never
;
复制代码
```

### 😊 implement IsNever 

```java
// https://stackoverflow.com/questions/53984650/typescript-never-type-inconsistently-matched-in-conditional-type
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#v
type A = IsNever<never> // true
type B = IsNever<string> // false
type C = IsNever<undefined> // false

// 实现IsNever<T>
type IsNever<T> = [T] extends [never] ? true : false;
复制代码
```

### 😊 implement KeysToUnion 

```java
type A = KeyToUnion<{
  a: string;
  b: number;
  c: symbol;
}>
// 'a' | 'b' | 'c'

// 实现KeyToUnion
type KeyToUnion<T> = {
  [K in keyof T]: K;
}[keyof T]
复制代码
```

### 😊 implement ValuesToUnion 

```java
type A = ValuesToUnion<{
  a: string;
  b: number;
  c: symbol;
}>
// string | number | symbol

// ValuesToUnion
type ValuesToUnion<T> = T[keyof T]
复制代码
```

### FindIndex<T, E> 

> bigfrontend.dev/zh/typescri…\[2\]

```java
type IsAny<T> = 0 extends (T & 1) ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;

type TwoAny<A, B> = IsAny<A> extends IsAny<B> ? IsAny<A> : false;
type TwoNever<A, B> = IsNever<A> extends IsNever<B> ? IsNever<A> : false;

type SingleAny<A, B> = IsAny<A> extends true ? true : IsAny<B>
type SingleNever<A, B> = IsNever<A> extends true ? true : IsNever<B>


type FindIndex<T extends any[], E, A extends any[] = []> =
    T extends [infer P, ...infer Q] ?
        TwoAny<P, E> extends true ? 
            A['length']
            :
            TwoNever<P, E> extends true ?
                A['length']
                :
                SingleAny<P, E> extends true ?
                    FindIndex<Q, E, [1, ...A]>
                    :
                    SingleNever<P, E> extends true ?
                        FindIndex<Q, E, [1, ...A]>
                        :
                        P extends E ? A['length'] : FindIndex<Q, E, [1, ...A]>
        : 
        never
复制代码
```

### implement Trim 

```java
type A = Trim<'    BFE.dev'> // 'BFE'
type B = Trim<' BFE. dev  '> // 'BFE. dev'
type C = Trim<'  BFE .   dev  '> // 'BFE .   dev'

type StringToTuple<T extends string, A extends any[] = []> =
    T extends `${infer K}${infer P}` ? StringToTuple<P, [...A, K]> : A;

type TupleToString<T extends any[], S extends string = '', A extends any[] = []> =
    A['length'] extends T['length'] ? S : TupleToString<T, `${S}${T[A['length']]}`, [1, ...A]>

type Trim<T extends string, A extends any[] = StringToTuple<T>> =
    A extends [infer P, ...infer Q] ?
        P extends ' ' ?
            Trim<T, Q>
            :
            A extends [...infer M, infer N] ? 
                N extends ' ' ?
                    Trim<T, M>
                    :
                    TupleToString<A>
                :
                ''
        :
        '';
复制代码
```

还有更多 `UnionToTuple`, `IntersectionToUnion` ?