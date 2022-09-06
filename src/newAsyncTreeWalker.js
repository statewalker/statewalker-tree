import MODE from './MODE.js';

export default function newAsyncTreeWalker(
  before, after,
  context = { stack: [], status: MODE.NONE }
) {
  return async (getNode) => {
    let status = context.status;
    const prev = status & MODE.EXIT;
    if (prev) await after(context);
    if (status & MODE.ENTER) await context.stack.push(context.current);
    let node = await getNode(context);
    if (node) {
      context.current = node;
      status = context.status = prev ? MODE.NEXT : MODE.FIRST;
      await before(context);
    } else {
      node = context.current = await context.stack.pop();
      status = context.status = node ? prev ? MODE.LAST : MODE.LEAF : MODE.NONE;
    }
    return status !== MODE.NONE;
  }
}
