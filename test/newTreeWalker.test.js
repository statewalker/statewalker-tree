/* eslint-disable no-undef */
import { describe, it, expect } from "./deps.ts";
import { newTreeWalker } from '../src/index.js';

describe('newTreeWalker', () => {

  it('should be able to iterate over the tree', async () => {
    const trace = [];
    const stack = [];
    const print = (msg) => {
      trace.push(stack.map(_ => ' ').join('') + msg);
    }

    const next = newTreeWalker(
      ({ current }) => print(`<${current}>`),
      ({ current }) => print(`</${current}>`),
      { status : 0, stack }
    );
    const update = (str) => next(() => str);

    expect(await update('a')).toBe(true);
    expect(await update('b1')).toBe(true);
    expect(await update('c1')).toBe(true);
    expect(await update()).toBe(true);
    expect(await update('c2')).toBe(true);
    expect(await update()).toBe(true);
    expect(await update('c3')).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(true);
    expect(await update('b2')).toBe(true);
    expect(await update()).toBe(true);
    expect(await update('b3')).toBe(true);
    expect(await update('d')).toBe(true);
    expect(await update('e')).toBe(true);
    expect(await update('f')).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(true);
    expect(await update()).toBe(false);
    expect(await update()).toBe(false);
    expect(trace).toEqual([
      '<a>',
      ' <b1>',
      '  <c1>',
      '  </c1>',
      '  <c2>',
      '  </c2>',
      '  <c3>',
      '  </c3>',
      ' </b1>',
      ' <b2>',
      ' </b2>',
      ' <b3>',
      '  <d>',
      '   <e>',
      '    <f>',
      '    </f>',
      '   </e>',
      '  </d>',
      ' </b3>',
      '</a>'
    ])
  })

});
