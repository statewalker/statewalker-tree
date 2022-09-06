/* eslint-disable no-undef */
import expect from 'expect.js';
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

    expect(await update('a')).to.be(true);
    expect(await update('b1')).to.be(true);
    expect(await update('c1')).to.be(true);
    expect(await update()).to.be(true);
    expect(await update('c2')).to.be(true);
    expect(await update()).to.be(true);
    expect(await update('c3')).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(true);
    expect(await update('b2')).to.be(true);
    expect(await update()).to.be(true);
    expect(await update('b3')).to.be(true);
    expect(await update('d')).to.be(true);
    expect(await update('e')).to.be(true);
    expect(await update('f')).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(true);
    expect(await update()).to.be(false);
    expect(await update()).to.be(false);
    expect(trace).to.eql([
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
