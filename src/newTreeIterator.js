import newTreeWalker from "./newTreeWalker.js";
import MODE from "./MODE.js";

export default function* newTreeIterator({
  context,
  before, after,
  first, next,
  mode = MODE.LEAF
}) {
  const nextStep = newTreeWalker(before, after, context)
  while (true) {
    const load = (context.status & MODE.EXIT) ? next : first;
    if (!nextStep(load)) break;
    else if (context.status & mode) yield context;
  }
}