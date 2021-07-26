import * as assert from 'assert/strict';
import { naturalNumbers } from '../../src/util/misc.js';

//<sync>
// import { Iterable } from '../../src/sync.js';
// const {map, filter, flatMap, take, drop, asIndexedPairs, reduce, forEach, some, every, find, zip, toArray} = Iterable;
//
// suite('sync-usage_test.ts');
//</sync>

//<async>
import { AsyncIterable } from '../../src/async.js';
const {map, filter, flatMap, take, drop, asIndexedPairs, reduce, forEach, some, every, find, zip, toArray, fromIterable: fi} = AsyncIterable;

suite('async-usage_test.ts');
//</async>

test('Using map()', async () => {
  assert.deepEqual(
    await toArray(map(x => x + x, fi(['a', 'b', 'c']))),
    ['aa', 'bb', 'cc']
  );
});

test('Using filter()', async () => {
  assert.deepEqual(
    await toArray(filter(x => x < 0, fi([-1, 3, -4, 8]))),
    [-1, -4]
  );
});

test('Using flatMap()', async () => {
  assert.deepEqual(
    await toArray(flatMap(x => x, fi(['a', 'b', 'c']))),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    await toArray(flatMap(x => [x], fi(['a', 'b', 'c']))),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    await toArray(flatMap(x => [x, x], fi(['a', 'b', 'c']))),
    ['a', 'a', 'b', 'b', 'c', 'c']
  );
  assert.deepEqual(
    await toArray(flatMap(x => [x, x, x], fi(['a', 'b', 'c']))),
    ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']
  );

  assert.deepEqual(
    await toArray(flatMap(x => x, fi(['hello']))),
    ['hello'],
    'Iterable values are not flattened'
  );
});

test('Using take()', async () => {
  assert.deepEqual(
    await toArray(take(3, fi(naturalNumbers()))),
    [0, 1, 2]
  );
  assert.deepEqual(
    await toArray(take(2, fi(['a', 'b', 'c']))),
    ['a', 'b']
  );
});

test('Using drop()', async () => {
  assert.deepEqual(
    await toArray(drop(1, fi(['a', 'b', 'c']))),
    ['b', 'c']
  );
});

test('Using asIndexedPairs()', async () => {
  assert.deepEqual(
    await toArray(asIndexedPairs(fi(['a', 'b', 'c']))),
    [[0, 'a'], [1, 'b'], [2, 'c']]
  );
});

test('Using reduce()', async () => {
  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, fi(['a', 'b', 'c'])),
    'abc'
  );
  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, fi(['a'])),
    'a'
  );

  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, fi(new Array<string>())),
    undefined
  );
  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, 'x', fi(new Array<string>())),
    'x'
  );

  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, 'x', fi(['a', 'b', 'c'])),
    'xabc'
  );
  assert.deepEqual(
    await reduce((acc, elem) => acc + elem, fi([0, 1, 2])),
    3
  );
});

test('Using forEach()', async () => {
  const result = new Array<string>();
  await forEach(x => result.push(x + x), fi(['a', 'b', 'c']))
  assert.deepEqual(
    result,
    ['aa', 'bb', 'cc']
  );
});

test('Using some()', async () => {
  assert.equal(
    await some((item) => item > 0, fi([5, -3, 12])),
    true
  );
  assert.equal(
    await some((item) => item < 0, fi([5, -3, 12])),
    true
  );
  assert.equal(
    await some((item) => item < -3, fi([5, -3, 12])),
    false
  );
});

test('Using every()', async () => {
  assert.equal(
    await every((item) => item > 0, fi([5, -3, 12])),
    false
  );
  assert.equal(
    await every((item) => item < 0, fi([5, -3, 12])),
    false
  );
  assert.equal(
    await every((item) => item >= -3, fi([5, -3, 12])),
    true
  );
});

test('Using find()', async () => {
  assert.equal(
    await find((item) => item > 0, fi([5, -3, 12, -8])),
    5
  );
  assert.equal(
    await find((item) => item < 0, fi([5, -3, 12, -8])),
    -3
  );
});

test('Using zip()', async () => {
  assert.deepEqual(
    await toArray(zip({first: fi(['a', 'b']), second: fi([0, 1, 2]) })),
    [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
  );
  assert.deepEqual(
    await toArray(zip([ fi(['a', 'b']), fi([0, 1, 2]) ])),
    [ ['a', 0], ['b', 1] ]    
  );
});


//<async-off-config>
// {
//   "unwrapFunctionCall": [
//     "fi"
//   ]
// }
//</async-off-config>
