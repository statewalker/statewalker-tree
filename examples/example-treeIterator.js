import { newTreeIterator, MODE } from "../src/index.js"; 

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