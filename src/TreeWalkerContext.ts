export type TreeWalkerContext<T> = {
  stack: T[];
  status: number;
  current?: T;
};

export const MODE = {
  NONE: 0,
  FIRST: 1, // old=true; new=true => ENTER + ENTER
  NEXT: 2, // old=false; new=true => EXIT + ENTER
  LEAF: 4, // old=true; new=false => ENTER + EXIT
  LAST: 8, // old=false; new=false => EXIT + EXIT

  ENTER: 1 | 2, // MODE.FIRST | MODE.NEXT
  EXIT: 4 | 8, // MODE.LEAF | MODE.LAST
};

export function newTreeWalkerContext<T>({
  stack = [],
  status = 0,
  current,
}: {
  stack?: T[];
  status?: number;
  current?: T;
} = {}): TreeWalkerContext<T> {
  return { stack, status, current };
}
