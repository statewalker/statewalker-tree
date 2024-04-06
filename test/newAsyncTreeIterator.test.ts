/* eslint-disable no-undef */
import { describe, it, expect } from "./deps.ts";
import {
  MODE,
  newTreeWalker,
  newAsyncTreeIterator,
  newTreeIterator,
  TreeWalkerContext,
  newTreeWalkerContext,
} from "../src/index.ts";

interface TestNode {
  name: string;
  children?: TestNode[];
}

const root: TestNode = {
  name: "a",
  children: [
    {
      name: "b1",
      children: [{ name: "c1" }, { name: "c2" }, { name: "c3" }],
    },
    { name: "b2" },
    {
      name: "b3",
      children: [
        {
          name: "d",
          children: [
            {
              name: "e",
              children: [{ name: "f" }],
            },
          ],
        },
      ],
    },
  ],
};

describe("newTreeIterator: should be able to iterate over a sync tree", () => {
  it("#MODE.ENTER", () =>
    test({
      mode: MODE.ENTER,
      root,
      control: ["a", "b1", "c1", "c2", "c3", "b2", "b3", "d", "e", "f"],
      traces: [
        "<a>",
        "[a]",
        "  <b1>",
        "  [b1]",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "  [b3]",
        "    <d>",
        "    [d]",
        "      <e>",
        "      [e]",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.LEAF", () =>
    test({
      mode: MODE.LEAF,
      root,
      control: ["c1", "c2", "c3", "b2", "f"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.EXIT", () =>
    test({
      mode: MODE.EXIT,
      root,
      control: ["c1", "c2", "c3", "b1", "b2", "f", "e", "d", "b3", "a"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  [b1]",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      [e]",
        "      </e>",
        "    [d]",
        "    </d>",
        "  [b3]",
        "  </b3>",
        "[a]",
        "</a>",
      ],
    }));

  function* treeIterator({
    root,
    mode,
    context,
    print,
  }: {
    root: TestNode;
    mode: number;
    context: TreeWalkerContext<TestNode>;
    print: (msg: string) => void;
  }) {
    const first = ({
      current,
    }: TreeWalkerContext<TestNode>): TestNode | undefined => {
      if (!current) return root;
      return (current?.children || [])[0];
    };
    const next = (
      context: TreeWalkerContext<TestNode>
    ): TestNode | undefined => {
      const stack = context.stack as TestNode[];
      const current = context.current;
      const parent = stack[stack.length - 1];
      if (!parent) return;
      const children = parent.children || [];
      let idx;
      for (idx = 0; idx < children.length; idx++) {
        if (children[idx].name === current?.name) break;
      }
      return children[idx + 1];
    };

    const before = (context: TreeWalkerContext<TestNode>) =>
      print(`<${context.current?.name}>`);
    const after = (context: TreeWalkerContext<TestNode>) =>
      print(`</${context.current?.name}>`);

    yield* newTreeIterator<TestNode>({
      mode,
      context,
      before,
      after,
      first,
      next,
    });
  }

  function test({
    mode,
    root,
    control,
    traces,
  }: {
    mode: number;
    root: TestNode;
    control: string[];
    traces: string[];
  }) {
    const context = newTreeWalkerContext<TestNode>({ stack: [], status: 0 });
    const trace: string[] = [];
    const print = (msg: string) => {
      const str = (context.stack as TestNode[]).map(() => "  ").join("") + msg;
      trace.push(str);
    };
    const it = treeIterator({ root, mode, context, print });
    const list = [];
    for (let s of it) {
      const name = s.current?.name;
      print(`[${name}]`);
      list.push(name);
    }
    expect(trace).toEqual(traces);
    expect(list).toEqual(control);
  }
});

async function wait(t: number = 100) {
  await new Promise((r) => setTimeout(r, t));
}

function asyncTreeIterator({
  root,
  mode,
  context,
  print,
}: {
  mode: number;
  root: TestNode;
  context: TreeWalkerContext<TestNode>;
  print: (msg: string) => void;
}) {
  return newAsyncTreeIterator<TestNode>({
    mode,
    context,

    async before(context) {
      await wait(1);
      print(`<${context.current?.name}>`);
    },
    async after(context) {
      await wait(1);
      print(`</${context.current?.name}>`);
    },
    async first({ current }: TreeWalkerContext<TestNode>) {
      await wait(2);
      if (!current) return root;
      return (current.children || [])[0];
    },
    async next(context: TreeWalkerContext<TestNode>) {
      await wait(2);
      const current = context.current;
      const stack = context.stack as TestNode[];
      const parent = stack[stack.length - 1];
      if (!parent) return;
      const children = parent.children || [];
      let idx;
      for (idx = 0; idx < children.length; idx++) {
        if (children[idx].name === current?.name) break;
      }
      return children[idx + 1];
    },
  });
}

describe("newAsyncTreeIterator: should be able to iterate over an async tree", () => {
  it("#MODE.ENTER", () =>
    test({
      mode: MODE.ENTER,
      root,
      control: ["a", "b1", "c1", "c2", "c3", "b2", "b3", "d", "e", "f"],
      traces: [
        "<a>",
        "[a]",
        "  <b1>",
        "  [b1]",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "  [b3]",
        "    <d>",
        "    [d]",
        "      <e>",
        "      [e]",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.LEAF", () =>
    test({
      mode: MODE.LEAF,
      root,
      control: ["c1", "c2", "c3", "b2", "f"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.EXIT", () =>
    test({
      mode: MODE.EXIT,
      root,
      control: ["c1", "c2", "c3", "b1", "b2", "f", "e", "d", "b3", "a"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  [b1]",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      [e]",
        "      </e>",
        "    [d]",
        "    </d>",
        "  [b3]",
        "  </b3>",
        "[a]",
        "</a>",
      ],
    }));

  it("#MODE.ENTER|MODE.EXIT", () =>
    test({
      mode: MODE.ENTER | MODE.EXIT,
      root,
      control: [
        "a",
        "b1",
        "c1",
        "c1",
        "c2",
        "c2",
        "c3",
        "c3",
        "b1",
        "b2",
        "b2",
        "b3",
        "d",
        "e",
        "f",
        "f",
        "e",
        "d",
        "b3",
        "a",
      ],
      traces: [
        "<a>",
        "[a]",
        "  <b1>",
        "  [b1]",
        "    <c1>",
        "    [c1]",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    [c3]",
        "    </c3>",
        "  [b1]",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "  [b3]",
        "    <d>",
        "    [d]",
        "      <e>",
        "      [e]",
        "        <f>",
        "        [f]",
        "        [f]",
        "        </f>",
        "      [e]",
        "      </e>",
        "    [d]",
        "    </d>",
        "  [b3]",
        "  </b3>",
        "[a]",
        "</a>",
      ],
    }));

  async function test({
    mode,
    control,
    traces,
  }: {
    mode: number;
    root: TestNode;
    control: string[];
    traces: string[];
  }) {
    const trace: string[] = [];
    const context = newTreeWalkerContext<TestNode>();
    const stack = context.stack as TestNode[];
    const print = (msg: string) => {
      const str = stack.map(() => "  ").join("") + msg;
      // console.log(str);
      trace.push(str);
    };
    const it = asyncTreeIterator({ mode, root, context, print });
    const list = [];
    for await (let s of it) {
      print(`[${s.current?.name}]`);
      list.push(s.current?.name);
    }
    expect(trace).toEqual(traces);
    expect(list).toEqual(control);
  }
});

describe("newAsyncTreeIterator: should be able to suspend / resume iterations", () => {
  it("#MODE.ENTER", async () =>
    await test({
      mode: MODE.ENTER,
      root,
      control: ["a", "b1", "c1", "c2", "c3", "b2", "b3", "d", "e", "f"],
      traces: [
        "<a>",
        "[a]",
        "  <b1>",
        "  [b1]",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "  [b3]",
        "    <d>",
        "    [d]",
        "      <e>",
        "      [e]",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.LEAF", async () =>
    await test({
      mode: MODE.LEAF,
      root,
      control: ["c1", "c2", "c3", "b2", "f"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      </e>",
        "    </d>",
        "  </b3>",
        "</a>",
      ],
    }));

  it("#MODE.EXIT", async () =>
    await test({
      mode: MODE.EXIT,
      root,
      control: ["c1", "c2", "c3", "b1", "b2", "f", "e", "d", "b3", "a"],
      traces: [
        "<a>",
        "  <b1>",
        "    <c1>",
        "    [c1]",
        "    </c1>",
        "    <c2>",
        "    [c2]",
        "    </c2>",
        "    <c3>",
        "    [c3]",
        "    </c3>",
        "  [b1]",
        "  </b1>",
        "  <b2>",
        "  [b2]",
        "  </b2>",
        "  <b3>",
        "    <d>",
        "      <e>",
        "        <f>",
        "        [f]",
        "        </f>",
        "      [e]",
        "      </e>",
        "    [d]",
        "    </d>",
        "  [b3]",
        "  </b3>",
        "[a]",
        "</a>",
      ],
    }));

  async function test({
    mode,
    root,
    control,
    traces,
  }: {
    mode: number;
    root: TestNode;
    control: string[];
    traces: string[];
  }) {
    const trace: string[] = [];
    let context = newTreeWalkerContext<TestNode>();
    function print(s: string) {
      const stack = context.stack as TestNode[];
      const line = stack.map(() => "  ").join("") + s;
      // console.log(line);
      trace.push(line);
    }
    const list = [];
    let it = asyncTreeIterator({ mode, root, context, print });
    const n = Math.round(control.length / 2);
    for await (let s of it) {
      print(`[${s.current?.name}]`);
      list.push(s.current?.name);
      if (list.length === n) break;
    }

    expect(list.length < control.length).toBe(true);
    expect(list).toEqual(control.slice(0, n));

    // Copy the context to be sure that it is a new object:
    context = JSON.parse(JSON.stringify(context));
    it = asyncTreeIterator({ mode, root, context, print });
    for await (let s of it) {
      print(`[${s.current?.name}]`);
      list.push(s.current?.name);
    }

    expect(list).toEqual(control);
    expect(trace).toEqual(traces);
  }
});

// describe(`newTreeWalker/newAsyncTreeIterator: should be able to async load tree nodes`, () => {
//   function buildTree(str: string): {
//     root: string;
//     index: Record<string, string[]>;
//     control: string[];
//   } {
//     const index: Record<string, string[]> = {};
//     const root = "root";
//     const control = [root];
//     const context = newTreeWalkerContext<string>();
//     const print = (msg: string) => {
//       // console.log(context.stack.map(_ => ' ').join(''), s);
//     };

//     const next = newTreeWalker(
//       (context) => {
//         const stack = context.stack as string[];
//         const parent = stack[stack.length - 1] || root;
//         const list = (index[parent] = index[parent] || []);
//         const current = context.current as string;
//         list.push(current);
//         control.push(current);
//         print(`<${current}>`);
//       },
//       ({ current }) => {
//         print(`</${current}>`);
//       },
//       context
//     );
//     const update = (token?: string) => next(() => token);
//     let open = true;
//     for (let i = 0; i < str.length; ) {
//       const ch = str[i++];
//       if (ch === "(") open = true;
//       else {
//         if (!open) update();
//         if (ch !== ")") update(ch);
//         open = false;
//       }
//     }
//     while (update());
//     return { root, index, control };
//   }

//   it("should iterate over lists", async () => {
//     // ABCDEFGHIJKLMNOPQRSTUVWXYZ
//     // const result = "abcdefghijklmnopqrstuvwxyz";
//     const list = "a(b(cd(ef(gh(ij(k)))l(mn))op)qrs(tu(v(w)x)y))z";
//     const { root, index, control } = buildTree(list);
//     type Node = { obj: string; idx: number };

//     const getName = (node : Node) => node.obj;
//     const newNode = (obj : string) : Node | undefined => (obj ? { obj, idx: 0 } : undefined);
//     const getChildren = async (n : string) => index[n] || [];
//     const getNextChild = async (node : Node) => {
//       if (!node) return null;
//       node.childrenPromise = node.childrenPromise || getChildren(node.obj);
//       const children = await node.childrenPromise;
//       const child = node.idx < children.length ? children[node.idx++] : null;
//       return newNode(child);
//     };

//     const context = newTreeWalkerContext<string>();
//     const trace = [];
//     function print(s: string) {
//       const stack = context.stack as string[];
//       const line = stack.map(() => "  ").join("") + s;
//       // const line = context.stack.map(_ => `[${getName(_)}]`).join('/') + ':' + s;
//       // console.log(line);
//       trace.push(line);
//     }

//     const first = async ({ current }: TreeWalkerContext<string>) => {
//       return !current ? await newNode(root) : await getNextChild(current);
//     };
//     const next = async (context: TreeWalkerContext<string>) => {
//       const stack = context.stack as string[];
//       const parent = stack[stack.length - 1];
//       return await getNextChild(parent);
//     };
//     const before = (s: TreeWalkerContext<string>) =>
//       print(`<${getName(s.current)}>`);
//     const after = (s: TreeWalkerContext<string>) =>
//       print(`</${getName(s.current)}>`);

//     let it = asyncTreeIterator({ first, next, before, after, context });
//     let i = 0;
//     for await (let s of it) {
//       print(`[${getName(s.current)}]`);
//       expect(getName(s.current)).toEqual(control[i++]);
//     }
//   });
// });
