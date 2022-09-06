import MODE from './MODE.js';

export default function newTreeWalker(
  before, after,
  context = { stack: [], status: MODE.NONE }
) {
  return (getNode) => {
    let status = context.status;
    const prev = status & MODE.EXIT;
    if (prev) after(context);
    if (status & MODE.ENTER) context.stack.push(context.current);
    let node = getNode(context);
    if (node) {
      context.current = node;
      status = context.status = prev ? MODE.NEXT : MODE.FIRST;
      before(context);
    } else {
      node = context.current = context.stack.pop();
      status = context.status = node ? prev ? MODE.LAST : MODE.LEAF : MODE.NONE;
    }
    return status !== MODE.NONE;
  }
}