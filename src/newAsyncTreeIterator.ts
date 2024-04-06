import { newAsyncTreeWalker } from "./newAsyncTreeWalker.ts";
import {
  MODE,
  newTreeWalkerContext,
  TreeWalkerContext,
} from "./TreeWalkerContext.ts";

export async function* newAsyncTreeIterator<T>({
  context = newTreeWalkerContext<T>(),
  before = async () => {},
  after = async () => {},
  first,
  next,
  mode = MODE.LEAF,
}: {
  context: TreeWalkerContext<T>;
  before: (context: TreeWalkerContext<T>) => Promise<void>;
  after: (context: TreeWalkerContext<T>) => Promise<void>;
  first: (
    context: TreeWalkerContext<T>
  ) => T | undefined | Promise<T | undefined>;
  next: (
    context: TreeWalkerContext<T>
  ) => T | undefined | Promise<T | undefined>;
  mode: number;
}): AsyncGenerator<TreeWalkerContext<T>> {
  const nextStep = newAsyncTreeWalker<T>(before, after, context);
  while (true) {
    const load = context.status & MODE.EXIT ? next : first;
    if (!await nextStep(load)) break;
    else if (context.status & mode) yield context;
  }
}
