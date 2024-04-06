import {
  MODE,
  newTreeWalkerContext,
  TreeWalkerContext,
} from "./TreeWalkerContext.ts";

export function newAsyncTreeWalker<T>(
  before: (context: TreeWalkerContext<T>) => Promise<void>,
  after: (context: TreeWalkerContext<T>) => Promise<void>,
  context: TreeWalkerContext<T> = newTreeWalkerContext<T>()
) {
  return async (
    getNode: (
      context: TreeWalkerContext<T>
    ) => undefined | T | Promise<T | undefined>
  ): Promise<boolean> => {
    let status = context.status;
    const prev = status & MODE.EXIT;
    if (prev) await after(context);
    if (status & MODE.ENTER) context.stack.push(context.current as T);
    let node: T | undefined = await getNode(context);
    if (node !== undefined) {
      context.current = node;
      status = context.status = prev ? MODE.NEXT : MODE.FIRST;
      await before(context);
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
