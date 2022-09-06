/* eslint-disable no-undef */
import expect from 'expect.js';
import { MODE, newTreeWalker, newAsyncTreeIterator, newTreeIterator } from '../src/index.js';

const root = {
  name: 'a',
  children: [
    {
      name: 'b1',
      children: [
        { name: 'c1' },
        { name: 'c2' },
        { name: 'c3' }
      ]
    },
    { name: 'b2' },
    {
      name: 'b3',
      children: [{
        name: 'd',
        children: [{
          name: 'e',
          children: [{ name: 'f' }]
        }]
      }]
    }
  ]
};

describe('newTreeIterator: should be able to iterate over a sync tree', () => {
  it('#MODE.ENTER', () => test({
    mode: MODE.ENTER,
    root,
    control: ['a', 'b1', 'c1', 'c2', 'c3', 'b2', 'b3', 'd', 'e', 'f'],
    traces: [
      '<a>',
      '[a]',
      '  <b1>',
      '  [b1]',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '  [b3]',
      '    <d>',
      '    [d]',
      '      <e>',
      '      [e]',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }));

  it('#MODE.LEAF', () => test({
    mode: MODE.LEAF,
    root,
    control: ['c1', 'c2', 'c3', 'b2', 'f'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }));

  it('#MODE.EXIT', () => test({
    mode: MODE.EXIT,
    root,
    control: ['c1', 'c2', 'c3', 'b1', 'b2', 'f', 'e', 'd', 'b3', 'a'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  [b1]',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      [e]',
      '      </e>',
      '    [d]',
      '    </d>',
      '  [b3]',
      '  </b3>',
      '[a]',
      '</a>'
    ]
  }));

  function* treeIterator({ root, mode, context, print }) {
    const first = ({ current }) => {
      if (!current) return root;
      return (current.children || [])[0];
    };
    const next = ({ stack, current }) => {
      const parent = stack[stack.length - 1];
      if (!parent) return null;
      const children = parent.children;
      let idx;
      for (idx = 0; idx < children.length; idx++) {
        if (children[idx].name === current.name) break;
      }
      return children[idx + 1];
    };

    const before = (context) => print(`<${context.current.name}>`);
    const after = (context) => print(`</${context.current.name}>`);

    yield* newTreeIterator({ mode, context, before, after, first, next })
  }

  function test({ mode, root, control, traces }) {
    const context = { stack: [], status: 0 };
    const trace = [];
    const print = (msg) => {
      const str = context.stack.map(() => '  ').join('') + msg;
      trace.push(str);
    }
    const it = treeIterator({ root, mode, context, print })
    const list = [];
    for (let s of it) {
      const name = s.current.name;
      print(`[${name}]`);
      list.push(name);
    }
    expect(trace).to.eql(traces);
    expect(list).to.eql(control);
  }
})


async function wait(t) { await new Promise(r => setTimeout(r, t)); }


function asyncTreeIterator({ root, mode, context, print }) {
  return newAsyncTreeIterator({
    mode, context,

    async before(context) {
      await wait(1);
      print(`<${context.current.name}>`);
    },
    async after(context) {
      await wait(1);
      print(`</${context.current.name}>`);
    },
    async first({ current }) {
      await wait(2);
      if (!current) return root;
      return (current.children || [])[0];
    },
    async next({ stack, current }) {
      await wait(2);

      const parent = stack[stack.length - 1];
      if (!parent) return null;
      const children = parent.children;
      let idx;
      for (idx = 0; idx < children.length; idx++) {
        if (children[idx].name === current.name) break;
      }
      return children[idx + 1];
    }
  })
}

describe('newAsyncTreeIterator: should be able to iterate over an async tree', () => {
  it('#MODE.ENTER', () => test({
    mode: MODE.ENTER,
    root,
    control: ['a', 'b1', 'c1', 'c2', 'c3', 'b2', 'b3', 'd', 'e', 'f'],
    traces: [
      '<a>',
      '[a]',
      '  <b1>',
      '  [b1]',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '  [b3]',
      '    <d>',
      '    [d]',
      '      <e>',
      '      [e]',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }));

  it('#MODE.LEAF', () => test({
    mode: MODE.LEAF,
    root,
    control: ['c1', 'c2', 'c3', 'b2', 'f'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }));

  it('#MODE.EXIT', () => test({
    mode: MODE.EXIT,
    root,
    control: ['c1', 'c2', 'c3', 'b1', 'b2', 'f', 'e', 'd', 'b3', 'a'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  [b1]',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      [e]',
      '      </e>',
      '    [d]',
      '    </d>',
      '  [b3]',
      '  </b3>',
      '[a]',
      '</a>'
    ]
  }));

  it('#MODE.ENTER|MODE.EXIT', () => test({
    mode: MODE.ENTER | MODE.EXIT,
    root,
    control: [
      'a',
      'b1',
      'c1', 'c1',
      'c2', 'c2',
      'c3', 'c3',
      'b1',
      'b2', 'b2',
      'b3',
      'd',
      'e',
      'f', 'f',
      'e',
      'd',
      'b3',
      'a'
    ],
    traces: [
      '<a>',
      '[a]',
      '  <b1>',
      '  [b1]',
      '    <c1>',
      '    [c1]',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    [c3]',
      '    </c3>',
      '  [b1]',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '  [b3]',
      '    <d>',
      '    [d]',
      '      <e>',
      '      [e]',
      '        <f>',
      '        [f]',
      '        [f]',
      '        </f>',
      '      [e]',
      '      </e>',
      '    [d]',
      '    </d>',
      '  [b3]',
      '  </b3>',
      '[a]',
      '</a>'
    ]
  }));



  async function test({ mode, nodes, control, traces }) {
    const trace = [];
    const context = { stack: [] };
    const print = (msg) => {
      const str = context.stack.map(_ => '  ').join('') + msg;
      // console.log(str);
      trace.push(str);
    }
    const it = asyncTreeIterator({ mode, root, context, print });
    const list = [];
    for await (let s of it) {
      print(`[${s.current.name}]`);
      list.push(s.current.name);
    }
    expect(trace).to.eql(traces);
    expect(list).to.eql(control);
  }
})

describe('newAsyncTreeIterator: should be able to suspend / resume iterations', () => {
  it('#MODE.ENTER', async () => await test({
    mode: MODE.ENTER,
    root,
    control: ['a', 'b1', 'c1', 'c2', 'c3', 'b2', 'b3', 'd', 'e', 'f'],
    traces: [
      '<a>',
      '[a]',
      '  <b1>',
      '  [b1]',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '  [b3]',
      '    <d>',
      '    [d]',
      '      <e>',
      '      [e]',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }))

  it('#MODE.LEAF', async () => await test({
    mode: MODE.LEAF,
    root,
    control: ['c1', 'c2', 'c3', 'b2', 'f'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      </e>',
      '    </d>',
      '  </b3>',
      '</a>'
    ]
  }));

  it('#MODE.EXIT', async () => await test({
    mode: MODE.EXIT,
    root,
    control: ['c1', 'c2', 'c3', 'b1', 'b2', 'f', 'e', 'd', 'b3', 'a'],
    traces: [
      '<a>',
      '  <b1>',
      '    <c1>',
      '    [c1]',
      '    </c1>',
      '    <c2>',
      '    [c2]',
      '    </c2>',
      '    <c3>',
      '    [c3]',
      '    </c3>',
      '  [b1]',
      '  </b1>',
      '  <b2>',
      '  [b2]',
      '  </b2>',
      '  <b3>',
      '    <d>',
      '      <e>',
      '        <f>',
      '        [f]',
      '        </f>',
      '      [e]',
      '      </e>',
      '    [d]',
      '    </d>',
      '  [b3]',
      '  </b3>',
      '[a]',
      '</a>'
    ]
  }));

  async function test({ mode, root, control, traces }) {
    const trace = [];
    let context = { stack: [], status: 0 };
    function print(s) {
      const line = context.stack.map(_ => '  ').join('') + s;
      // console.log(line);
      trace.push(line);
    }
    const list = [];
    let it = asyncTreeIterator({ mode, root, context, print });
    const n = Math.round(control.length / 2);
    for await (let s of it) {
      print(`[${s.current.name}]`);
      list.push(s.current.name);
      if (list.length === n) break;
    }

    expect(list.length < control.length).to.be(true);
    expect(list).to.eql(control.slice(0, n));

    // Copy the context to be sure that it is a new object:
    context = JSON.parse(JSON.stringify(context));
    it = asyncTreeIterator({ mode, root, context, print });
    for await (let s of it) {
      print(`[${s.current.name}]`);
      list.push(s.current.name);
    }

    expect(list).to.eql(control);
    expect(trace).to.eql(traces);
  }
})

describe(`newTreeWalker/newAsyncTreeIterator: should be able to async load tree nodes`, () => {

  function buildTree(str) {
    const root = 'root';
    const index = {};
    const control = [root];
    const context = { stack: [] };
    const print = (s) => {
      // console.log(context.stack.map(_ => ' ').join(''), s);
    }
    const next = newTreeWalker(
      ({ stack, current }) => {
        const parent = stack[stack.length - 1] || root;
        const list = index[parent] = index[parent] || [];
        list.push(current);
        control.push(current);
        print(`<${current}>`);
      },
      ({ stack, current }) => {
        print(`</${current}>`);
      },
      context
    );
    const update = (token) => next(() => token);
    let open = true;
    for (let i = 0; i < str.length;) {
      const ch = str[i++];
      if (ch === '(') open = true;
      else {
        if (!open) update(null);
        if (ch !== ')') update(ch);
        open = false;
      }
    }
    while (update(null));
    return { root, index, control };
  }

  it('should iterate over lists', async () => {

    // ABCDEFGHIJKLMNOPQRSTUVWXYZ
    const result = 'abcdefghijklmnopqrstuvwxyz';
    const list = 'a(b(cd(ef(gh(ij(k)))l(mn))op)qrs(tu(v(w)x)y))z';
    const { root, index, control } = buildTree(list);

    const getName = (node) => node.obj;
    const newNode = (obj) => (obj ? { obj, idx: 0 } : null);
    const getChildren = async (n) => index[n] || [];
    const getNextChild = async (node) => {
      if (!node) return null;
      node.childrenPromise = node.childrenPromise || getChildren(node.obj);
      const children = await node.childrenPromise;
      const child = node.idx < children.length ? children[node.idx++] : null;
      return newNode(child);
    }

    const context = { stack: [] };
    const trace = [];
    function print(s) {
      const line = context.stack.map(_ => '  ').join('') + s;
      // const line = context.stack.map(_ => `[${getName(_)}]`).join('/') + ':' + s;
      // console.log(line);
      trace.push(line);
    }

    const first = async ({ current }) => {
      return !current ? await newNode(root) : await getNextChild(current);
    }
    const next = async ({ stack, current, status }) => {
      const parent = stack[stack.length - 1];
      return await getNextChild(parent);
    }
    const before = (s) => print(`<${getName(s.current)}>`);
    const after = (s) => print(`</${getName(s.current)}>`);

    let it = asyncTreeIterator({ first, next, before, after, context });
    let i = 0;
    for await (let s of it) {
      print(`[${getName(s.current)}]`);
      expect(getName(s.current)).to.eql(control[i++]);
    }
  })

})
