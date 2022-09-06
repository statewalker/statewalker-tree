# @statewalker/tree: Tree Traversal Library

This module contains methods allowing to traverse library. The main interest of these methods is that they allow to iteratively visit tree nodes, interrupt the iteration process at any moment and restore it from the same position.

Methods:
* `newTreeWalker(...)` - initializes and returns a new method allowing synchronously visit tree structures
* `newAsyncTreeWalker(...)` - returns a method allowing to asynchronously traverse tree structures
* `newTreeIterator(...)` - iterator over tree structures
* `newAsyncTreeIterator(...)` - asynchronous iterator over trees

Common parameters of these methods:
* `before(context)` - mandatory callback method called before the iterator enters in the tree node; for the async walker this method can be asynchronous and return a promise
* `after(context)` - mandatory callback method called after the node is visited; for the async walker this method can return a promise
* `context` - a context object containing run-time information about the state of the graph iterator
  - `context.current` - the current active node; initially this field is not defined in the context
  - `context.stack` - the stack of nodes defining the current position in the tree; by default it is an empty array ([]), but it can be any object with methods `push(object)` / `pop()`. The topmost node in stack corresponds to the parent of the currently active tree node.
  - `context.status` - the status of the latest operation; the initial value is `MODE.NONE`=0

Iterator methods (`newTreeIterator(...)`/`newAsyncTreeIterator(...)`) require additional parameters returning the first/next children of : 
 * `first(context)` - returns the first child sub-node of the currently active node; if the `context.current` is not defined then this method should return the topmost node in the tree
 * `next(context)` - returns the next sibling of the currently active node; the `context.current` contains the current node, the parent of the current node can be found in the `context.stack` field (parent = the top element in the stack)

 
The walker methods (`newTreeWalker`/`newAsyncTreeWalker`) return functions accepting one callback returning a new node to visit:
* `walker(nextItem)` where the `nextItem` is a method returning one of two possible values:
  - the next child item of the currently active node in the tree (the current node is referenced by `context.current` field)
  - null/undefined if the current node don't have any children to visit


*Note:* this code was migrated from the [@statewalker/statewalker](https://github.com/statewalker/statewalker) project.


Iterator example:
```javascript
import { newTreeIterator, MODE } from "@statewalker/tree"; 

// Utility method printing messages with shifts::
const print = (context, message) => {
  const shift = context.stack.map(() => '  ').join('');
  console.log(shift, message);
}

// The callback to call before each tree node:
const before = (context) => {
  print(context, '<' + context.current.name + '>');
}
const after = (context) => {
  print(context, '</' + context.current.name + '>');
}

// Create a new context object; it is used to keep the current state of the iterator
const context = { status : 0, stack : [] };

// The tree structure to visit:
const tree = {
  name : 'Root',
  children : [
    { 
      name: 'A',
      children : [
        { name : 'A1' },
        { name : 'A2' },
        { name : 'A3' },
      ]
    },
    {
      name : 'B',
      children : [
        { name : 'B1' },
        {
          name : 'B2',
          children : [
            { name : 'B2-1' },
            { name : 'B2-2' },
            { name : 'B2-3' },

          ]
        },
        { name : 'B3' },
      ]
    },
    { name : 'C' }
  ]
}

// Create a new iterator over the tree:
const first = (context) => {
  const node = context.current;
  if (!node) return tree;
  return (node.children || [])[0];
}
const next = (context) => {
  const parent = context.stack[context.stack.length - 1];
  if (!parent) return null;
  const node = context.current;
  const idx = parent.children.indexOf(node);
  return parent.children[idx + 1];
}
const iterator = newTreeIterator({
  before,
  after,
  context,
  first,
  next,
  mode : MODE.LEAF
});
for (let context of iterator) {
  print(context, '- ' + context.current.name)
}

/** Result:
 <Root>
   <A>
     <A1>
     - A1
     </A1>
     <A2>
     - A2
     </A2>
     <A3>
     - A3
     </A3>
   </A>
   <B>
     <B1>
     - B1
     </B1>
     <B2>
       <B2-1>
       - B2-1
       </B2-1>
       <B2-2>
       - B2-2
       </B2-2>
       <B2-3>
       - B2-3
       </B2-3>
     </B2>
     <B3>
     - B3
     </B3>
   </B>
   <C>
   - C
   </C>
 </Root>
 */
```
