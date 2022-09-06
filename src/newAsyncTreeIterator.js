import newAsyncTreeWalker from "./newAsyncTreeWalker.js";
import MODE from "./MODE.js";

export default async function* newAsyncTreeIterator({
  context,
  before, after,
  first, next,
  mode = MODE.ENTER
}) {
  const nextStep = newAsyncTreeWalker(before, after, context)
  while (true) {
    const load = (context.status & MODE.EXIT) ? next : first;
    if (!await nextStep(load)) break;
    else if (context.status & mode) yield context;
  }
}