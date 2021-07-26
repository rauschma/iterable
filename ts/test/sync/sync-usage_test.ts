import * as assert from 'assert/strict';
import { naturalNumbers } from '../../src/util/misc.js';

import { Iterable } from '../../src/sync.js';
const {map, filter, flatMap, take, drop, asIndexedPairs, reduce, forEach, some, every, find, zip, toArray} = Iterable;

suite('sync-usage_test.ts');


test('Using map()', () => {
  assert.deepEqual(
    toArray(map(x => x + x, ['a', 'b', 'c'])),
    ['aa', 'bb', 'cc']
  );
});

test('Using filter()', () => {
  assert.deepEqual(
    toArray(filter(x => x < 0, [-1, 3, -4, 8])),
    [-1, -4]
  );
});

test('Using flatMap()', () => {
  assert.deepEqual(
    toArray(flatMap(x => x, ['a', 'b', 'c'])),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    toArray(flatMap(x => [x], ['a', 'b', 'c'])),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    toArray(flatMap(x => [x, x], ['a', 'b', 'c'])),
    ['a', 'a', 'b', 'b', 'c', 'c']
  );
  assert.deepEqual(
    toArray(flatMap(x => [x, x, x], ['a', 'b', 'c'])),
    ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']
  );

  assert.deepEqual(
    toArray(flatMap(x => x, ['hello'])),
    ['hello'],
    'Iterable values are not flattened'
  );
});

test('Using take()', () => {
  assert.deepEqual(
    toArray(take(3, naturalNumbers())),
    [0, 1, 2]
  );
  assert.deepEqual(
    toArray(take(2, ['a', 'b', 'c'])),
    ['a', 'b']
  );
});

test('Using drop()', () => {
  assert.deepEqual(
    toArray(drop(1, ['a', 'b', 'c'])),
    ['b', 'c']
  );
});

test('Using asIndexedPairs()', () => {
  assert.deepEqual(
    toArray(asIndexedPairs(['a', 'b', 'c'])),
    [[0, 'a'], [1, 'b'], [2, 'c']]
  );
});

test('Using reduce()', () => {
  assert.deepEqual(
    reduce((acc, elem) => acc + elem, ['a', 'b', 'c']),
    'abc'
  );
  assert.deepEqual(
    reduce((acc, elem) => acc + elem, ['a']),
    'a'
  );

  assert.deepEqual(
    reduce((acc, elem) => acc + elem, new Array<string>()),
    undefined
  );
  assert.deepEqual(
    reduce((acc, elem) => acc + elem, 'x', new Array<string>()),
    'x'
  );

  assert.deepEqual(
    reduce((acc, elem) => acc + elem, 'x', ['a', 'b', 'c']),
    'xabc'
  );
  assert.deepEqual(
    reduce((acc, elem) => acc + elem, [0, 1, 2]),
    3
  );
});

test('Using forEach()', () => {
  const result = new Array<string>();
  forEach(x => result.push(x + x), ['a', 'b', 'c'])
  assert.deepEqual(
    result,
    ['aa', 'bb', 'cc']
  );
});

test('Using some()', () => {
  assert.equal(
    some((item) => item > 0, [5, -3, 12]),
    true
  );
  assert.equal(
    some((item) => item < 0, [5, -3, 12]),
    true
  );
  assert.equal(
    some((item) => item < -3, [5, -3, 12]),
    false
  );
});

test('Using every()', () => {
  assert.equal(
    every((item) => item > 0, [5, -3, 12]),
    false
  );
  assert.equal(
    every((item) => item < 0, [5, -3, 12]),
    false
  );
  assert.equal(
    every((item) => item >= -3, [5, -3, 12]),
    true
  );
});

test('Using find()', () => {
  assert.equal(
    find((item) => item > 0, [5, -3, 12, -8]),
    5
  );
  assert.equal(
    find((item) => item < 0, [5, -3, 12, -8]),
    -3
  );
});

test('Using zip()', () => {
  assert.deepEqual(
    toArray(zip({first: ['a', 'b'], second: [0, 1, 2] })),
    [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
  );
  assert.deepEqual(
    toArray(zip([ ['a', 'b'], [0, 1, 2] ])),
    [ ['a', 0], ['b', 1] ]    
  );
});
