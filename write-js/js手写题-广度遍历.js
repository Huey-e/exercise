/**
 * @Description: 广度优先遍历 先遍历同级节点 在遍历子节点  从左往右
 * @Author: Cong Haiyang
 * @Date: 2023-02-14 14:13:25
 */
class Node {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
}

function breadthFirstTraversal(node) {
  const queue = [node];
  const result = [];
  while (queue.length) {
    const current = queue.shift();
    result.push(current.value);
    queue.push(...current.children);
  }
  return result;
}

const root = new Node(1, [
  new Node(2, [
    new Node(4),
    new Node(5)
  ]),
  new Node(3, [
    new Node(6),
    new Node(7)
  ])
]);

console.log(breadthFirstTraversal(root)); // [1, 2, 3, 4, 5, 6, 7]
console.log( new Node(2, [new Node(4),new Node(5)]).children);

