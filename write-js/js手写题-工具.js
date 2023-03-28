
/**  类型检测  利用Object.prototype.toString 实现 返回类型 然后再截取类型 */
function typeOf(obj) {
    let res = Object.prototype.toString.call(obj).split(' ')[1]
    console.log(Object.prototype.toString.call(obj));
    res = res.substring(0, res.length - 1).toLowerCase()
    return res
}

/** 数组去重  可使用 indexof、includes、filter、...new Set() */
function unique(arr) {
    var res = arr.filter(function(item, index, array) {
      console.log('--array--',array.indexOf(item), index, item);
        return array.indexOf(item) === index
    })
    return res
}
console.log(unique([1,2,3,4,1,2,3,4,5]));


/** 实现数组扁平化  arr = [1, [2, [3, [4]]]] => [ 1, 2, 3, 4 ] */
function  flatten(arr){
  var result = [];
  for (let i = 0; i < arr.length; i++) {
    if(Array.isArray(arr[i])){
      result = result.concat(flatten(arr[i]))
    }else{
      result.push(arr[i])
    }
  }
  return result
}
console.log(flatten([1, [2, [3, [4]]]]));

/** 第二种 */
function flattenEs6(arr){
  while(arr.some(item=>Array.isArray(item))){
    arr = [].concat(...arr)
  }
  return arr
}
console.log(flattenEs6([1, [2, [3, [4]]]]));

/** 第三种 */ 
let newArr= [1, [2, [3, [4]]]].flat(Infinity)
console.log(newArr);
