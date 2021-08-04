import * as assert from 'assert/strict';
import { naturalNumbers } from '../../src/util/misc.js';

//<sync>
// import { Iterable } from '../../src/sync.js';
// const {toArray} = Iterable;
//
// suite('sync-usage_test.ts');
//</sync>

//<async>
import { AsyncIterable } from '../../src/async.js';
const {toArray, fromIterable: fi} = AsyncIterable;

suite('async-usage_test.ts');
//</async>

test('Using map()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.map(x => x + x, fi(['a', 'b', 'c']))),
    ['aa', 'bb', 'cc']
  );
});

test('Using filter()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.filter(x => x < 0, fi([-1, 3, -4, 8]))),
    [-1, -4]
  );
});

test('Using flatMap()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.flatMap(x => x, fi(['a', 'b', 'c']))),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    await toArray(AsyncIterable.flatMap(x => [x], fi(['a', 'b', 'c']))),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    await toArray(AsyncIterable.flatMap(x => [x, x], fi(['a', 'b', 'c']))),
    ['a', 'a', 'b', 'b', 'c', 'c']
  );
  assert.deepEqual(
    await toArray(AsyncIterable.flatMap(x => [x, x, x], fi(['a', 'b', 'c']))),
    ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']
  );

  assert.deepEqual(
    await toArray(AsyncIterable.flatMap(x => x, fi(['hello']))),
    ['hello'],
    'Iterable values are not flattened'
  );
});

test('Using take()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.take(3, fi(naturalNumbers()))),
    [0, 1, 2]
  );
  assert.deepEqual(
    await toArray(AsyncIterable.take(2, fi(['a', 'b', 'c']))),
    ['a', 'b']
  );
});

test('Using drop()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.drop(1, fi(['a', 'b', 'c']))),
    ['b', 'c']
  );
});

test('Using asIndexedPairs()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.asIndexedPairs(fi(['a', 'b', 'c']))),
    [[0, 'a'], [1, 'b'], [2, 'c']]
  );
});

test('Using reduce()', async () => {

  //----- Has no initialValue

  await assert.rejects(
    async () => AsyncIterable.reduce((acc, item) => acc + item, fi(new Array<string>())),
    TypeError
  );

  assert.deepEqual(
    await AsyncIterable.reduce((acc, item) => acc + item, fi(['a'])),
    'a'
  );
  
  assert.deepEqual(
    await AsyncIterable.reduce((acc, item) => acc + item, fi(['a', 'b', 'c'])),
    'abc'
  );

  //----- Has initialValue

  assert.deepEqual(
    await AsyncIterable.reduce((acc, item) => acc + item, 'x', fi(new Array<string>())),
    'x'
  );

  assert.deepEqual(
    await AsyncIterable.reduce((acc, item) => acc + item, 'x', fi(['a'])),
    'xa'
  );

  assert.deepEqual(
    await AsyncIterable.reduce((acc, item) => acc + item, 'x', fi(['a', 'b', 'c'])),
    'xabc'
  );
});

test('Using forEach()', async () => {
  const result = new Array<string>();
  await AsyncIterable.forEach(x => result.push(x + x), fi(['a', 'b', 'c']))
  assert.deepEqual(
    result,
    ['aa', 'bb', 'cc']
  );
});

test('Using some()', async () => {
  assert.equal(
    await AsyncIterable.some((item) => item > 0, fi([5, -3, 12])),
    true
  );
  assert.equal(
    await AsyncIterable.some((item) => item < 0, fi([5, -3, 12])),
    true
  );
  assert.equal(
    await AsyncIterable.some((item) => item < -3, fi([5, -3, 12])),
    false
  );
});

test('Using every()', async () => {
  assert.equal(
    await AsyncIterable.every((item) => item > 0, fi([5, -3, 12])),
    false
  );
  assert.equal(
    await AsyncIterable.every((item) => item < 0, fi([5, -3, 12])),
    false
  );
  assert.equal(
    await AsyncIterable.every((item) => item >= -3, fi([5, -3, 12])),
    true
  );
});

test('Using find()', async () => {
  assert.equal(
    await AsyncIterable.find((item) => item > 0, fi([5, -3, 12, -8])),
    5
  );
  assert.equal(
    await AsyncIterable.find((item) => item < 0, fi([5, -3, 12, -8])),
    -3
  );
});

test('Using zip()', async () => {
  assert.deepEqual(
    await toArray(AsyncIterable.zip({first: fi(['a', 'b']), second: fi([0, 1, 2]) })),
    [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
  );
  assert.deepEqual(
    await toArray(AsyncIterable.zip([ fi(['a', 'b']), fi([0, 1, 2]) ])),
    [ ['a', 0], ['b', 1] ]    
  );
});


//<async-off-config>
// {
//   "renameVariable": {
//     "AsyncIterable": "Iterable",
//     "assert.rejects": "assert.throws"
//   },
//   "unwrapFunctionCall": [
//     "fi"
//   ]
// }
//</async-off-config>
