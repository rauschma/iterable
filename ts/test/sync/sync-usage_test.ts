import * as assert from 'assert/strict';
import { naturalNumbers } from '../../src/util/misc.js';

import { Iterable } from '../../src/sync.js';
const {toArray} = Iterable;

suite('sync-usage_test.ts');


test('Using map()', () => {
  assert.deepEqual(
    toArray(Iterable.map(x => x + x, ['a', 'b', 'c'])),
    ['aa', 'bb', 'cc']
  );
  assert.deepEqual(
    toArray(Iterable.map(x => x + x, [])),
    []
  );
});

test('Using filter()', () => {
  assert.deepEqual(
    toArray(Iterable.filter(x => x < 0, [-1, 3, -4, 8])),
    [-1, -4]
  );
  assert.deepEqual(
    toArray(Iterable.filter(x => true, [-1, 3, -4, 8])),
    [-1, 3, -4, 8]
  );
  assert.deepEqual(
    toArray(Iterable.filter(x => false, [-1, 3, -4, 8])),
    []
  );
  assert.deepEqual(
    toArray(Iterable.filter(x => true, [])),
    []
  );
});

test('Using flatMap()', () => {
  assert.deepEqual(
    toArray(Iterable.flatMap(x => x, ['a', 'b', 'c'])),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    toArray(Iterable.flatMap(x => [], ['a', 'b', 'c'])),
    []
  );
  assert.deepEqual(
    toArray(Iterable.flatMap(x => [x], ['a', 'b', 'c'])),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    toArray(Iterable.flatMap(x => [x, x], ['a', 'b', 'c'])),
    ['a', 'a', 'b', 'b', 'c', 'c']
  );
  assert.deepEqual(
    toArray(Iterable.flatMap(x => [x, x, x], ['a', 'b', 'c'])),
    ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']
  );
  
  assert.deepEqual(
    toArray(
            Iterable.flatMap(
              (str) => str.split(/\s/),
              ['multiple strings', 'with', 'multiple words']
            )
          ),
    ['multiple', 'strings', 'with', 'multiple', 'words']
  );

  assert.deepEqual(
    toArray(Iterable.flatMap(x => x, ['hello'])),
    ['hello'],
    'Iterable values are not flattened'
  );
});

test('Using take()', () => {
  assert.deepEqual(
    toArray(Iterable.take(3, naturalNumbers())),
    [0, 1, 2]
  );
  assert.deepEqual(
    toArray(Iterable.take(2, ['a', 'b', 'c'])),
    ['a', 'b']
  );
  assert.deepEqual(
    toArray(Iterable.take(3, [])),
    []
  );
});

test('Using drop()', () => {
  assert.deepEqual(
    toArray(Iterable.drop(1, ['a', 'b', 'c'])),
    ['b', 'c']
  );
  assert.deepEqual(
    toArray(Iterable.drop(3, [])),
    []
  );
});

test('Using asIndexedPairs()', () => {
  assert.deepEqual(
    toArray(Iterable.asIndexedPairs(['a', 'b', 'c'])),
    [[0, 'a'], [1, 'b'], [2, 'c']]
  );
  assert.deepEqual(
    toArray(Iterable.asIndexedPairs([])),
    []
  );
});

test('Using reduce()', () => {

  //----- Has no initialValue

  assert.throws(
        () => Iterable.reduce((acc, item) => acc + item, new Array<string>()),
        TypeError
      );

  assert.deepEqual(
    Iterable.reduce((acc, item) => acc + item, ['a']),
    'a'
  );
  
  assert.deepEqual(
    Iterable.reduce((acc, item) => acc + item, ['a', 'b', 'c']),
    'abc'
  );

  //----- Has initialValue

  assert.deepEqual(
    Iterable.reduce((acc, item) => acc + item, 'x', new Array<string>()),
    'x'
  );

  assert.deepEqual(
    Iterable.reduce((acc, item) => acc + item, 'x', ['a']),
    'xa'
  );

  assert.deepEqual(
    Iterable.reduce((acc, item) => acc + item, 'x', ['a', 'b', 'c']),
    'xabc'
  );
});

test('Using forEach()', () => {
  {
    const result = new Array<string>();
    Iterable.forEach(x => result.push(x + x), ['a', 'b', 'c'])
    assert.deepEqual(
      result,
      ['aa', 'bb', 'cc']
    );
  }
  {
    let wasInvoked = false
    Iterable.forEach(_ => wasInvoked=true, [])
    assert.equal(wasInvoked, false);
  }
});

test('Using some()', () => {
  assert.equal(
    Iterable.some((item) => item > 0, [5, -3, 12]),
    true
  );
  assert.equal(
    Iterable.some((item) => item < 0, [5, -3, 12]),
    true
  );
  assert.equal(
    Iterable.some((item) => item < -3, [5, -3, 12]),
    false
  );

  assert.equal(
    Iterable.some((_item) => true, []),
    false
  );

  assert.equal(
    Iterable.some((item) => item > 10, naturalNumbers()),
    true
  );
});

test('Using every()', () => {
  assert.equal(
    Iterable.every((item) => item > 0, [5, -3, 12]),
    false
  );
  assert.equal(
    Iterable.every((item) => item < 0, [5, -3, 12]),
    false
  );
  assert.equal(
    Iterable.every((item) => item >= -3, [5, -3, 12]),
    true
  );

  assert.equal(
    Iterable.every((_item) => false, []),
    true
  );

  assert.equal(
    Iterable.every((item) => item <= 10, naturalNumbers()),
    false
  );
});

test('Using find()', () => {
  assert.equal(
    Iterable.find((item) => item > 0, [5, -3, 12, -8]),
    5
  );
  assert.equal(
    Iterable.find((item) => item < 0, [5, -3, 12, -8]),
    -3
  );

  assert.equal(
    Iterable.find((_item) => true, []),
    undefined
  );

  assert.equal(
    Iterable.find((item) => item > 20, naturalNumbers()),
    21
  );
});

test('Using zip()', () => {
  assert.deepEqual(
    toArray(Iterable.zip({first: ['a', 'b'], second: [0, 1, 2] })),
    [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
  );
  assert.deepEqual(
    toArray(Iterable.zip({first: [], second: [] })),
    []
  );

  assert.deepEqual(
    toArray(Iterable.zip([ ['a', 'b'], [0, 1, 2] ])),
    [ ['a', 0], ['b', 1] ]
  );
  assert.deepEqual(
    toArray(Iterable.zip([ [], [] ])),
    []
  );
});



