import { newTreeWalker } from "./newTreeWalker.ts";
import {
  MODE,
  newTreeWalkerContext,
  TreeWalkerContext,
} from "./TreeWalkerContext.ts";

export function* newTreeIterator<T>({
  context = newTreeWalkerContext<T>(),
  before = () => {},
  after = () => {},
  first,
  next,
  mode = MODE.LEAF,
}: {
  context: TreeWalkerContext<T>;
  before: (context: TreeWalkerContext<T>) => void;
  after: (context: TreeWalkerContext<T>) => void;
  first: (context: TreeWalkerContext<T>) => T | undefined;
  next: (context: TreeWalkerContext<T>) => T | undefined;
  mode: number;
}): Generator<TreeWalkerContext<T>> {
  const nextStep = newTreeWalker(before, after, context);
  while (true) {
    const load = context.status & MODE.EXIT ? next : first;
    if (!nextStep(load)) break;
    else if (context.status & mode) yield context;
  }
}
