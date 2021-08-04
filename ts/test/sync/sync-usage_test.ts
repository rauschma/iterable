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
});

test('Using filter()', () => {
  assert.deepEqual(
    toArray(Iterable.filter(x => x < 0, [-1, 3, -4, 8])),
    [-1, -4]
  );
});

test('Using flatMap()', () => {
  assert.deepEqual(
    toArray(Iterable.flatMap(x => x, ['a', 'b', 'c'])),
    ['a', 'b', 'c']
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
});

test('Using drop()', () => {
  assert.deepEqual(
    toArray(Iterable.drop(1, ['a', 'b', 'c'])),
    ['b', 'c']
  );
});

test('Using asIndexedPairs()', () => {
  assert.deepEqual(
    toArray(Iterable.asIndexedPairs(['a', 'b', 'c'])),
    [[0, 'a'], [1, 'b'], [2, 'c']]
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
  const result = new Array<string>();
  Iterable.forEach(x => result.push(x + x), ['a', 'b', 'c'])
  assert.deepEqual(
    result,
    ['aa', 'bb', 'cc']
  );
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
});

test('Using zip()', () => {
  assert.deepEqual(
    toArray(Iterable.zip({first: ['a', 'b'], second: [0, 1, 2] })),
    [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
  );
  assert.deepEqual(
    toArray(Iterable.zip([ ['a', 'b'], [0, 1, 2] ])),
    [ ['a', 0], ['b', 1] ]    
  );
});



