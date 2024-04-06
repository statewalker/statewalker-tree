import {
  MODE,
  newTreeWalkerContext,
  type TreeWalkerContext,
} from "./TreeWalkerContext.ts";

export function newTreeWalker<T>(
  before: (context: TreeWalkerContext<T>) => void,
  after: (context: TreeWalkerContext<T>) => void,
  context: TreeWalkerContext<T> = newTreeWalkerContext<T>()
) {
  return (
    getNode: (context: TreeWalkerContext<T>) => T | undefined
  ): boolean => {
    let status = context.status;
    const prev = status & MODE.EXIT;
    if (prev) after(context);
    if (status & MODE.ENTER) context.stack.push(context.current as T);
    let node = getNode(context);
    if (node !== undefined) {
      context.current = node;
      status = context.status = prev ? MODE.NEXT : MODE.FIRST;
      before(context);
    } else {
      node = context.current = context.stack.pop();
      status = context.status = node
        ? prev
          ? MODE.LAST
          : MODE.LEAF
        : MODE.NONE;
    }
    return status !== MODE.NONE;
  };
}
