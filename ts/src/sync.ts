//========== Functions

/**
 * This function returns an iterable where each item was produced by applying
 * `mapperFn` to an item of `iterable`.
 * 
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.map(x => x + x, ['a', 'b', 'c'])),
 *   ['aa', 'bb', 'cc']
 * );
 * ```
 */
function* map<In, Out>(mapperFn: (x: In) => Out, iterable: Iterable<In>): Iterable<Out> {
  for (const x of iterable) {
    yield mapperFn(x);
  }
}


/**
 * This function returns an iterable that contains only those items of `iterable`
 * for which `filterFn` returns a truthy value.
 * 
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.filter(x => x < 0, [-1, 3, -4, 8])),
 *   [-1, -4]
 * );
 * ```
 */
 function* filter<Item>(filterFn: (x: Item) => boolean, iterable: Iterable<Item>): Iterable<Item> {
  for (const x of iterable) {
    if (filterFn(x)) {
      yield x;
    }
  }
}

/**
 * Each item of `iterable` is converted to zero or more items in the returned
 * iterable, depending on whether `mapperFn` returns a single value or an Array
 * (and on how long that Array is). This enables us to:
 * - Filter and map at the same time. We omit by returning `[]` and map by returning `[result]`.
 * - Expand single values into multiple values (see below).
 * 
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.flatMap(x => x, ['a', 'b', 'c'])),
 *   ['a', 'b', 'c']
 * );
 * assert.deepEqual(
 *   toArray(Iterable.flatMap(x => [], ['a', 'b', 'c'])),
 *   []
 * );
 * assert.deepEqual(
 *   toArray(Iterable.flatMap(x => [x], ['a', 'b', 'c'])),
 *   ['a', 'b', 'c']
 * );
 * assert.deepEqual(
 *   toArray(Iterable.flatMap(x => [x, x], ['a', 'b', 'c'])),
 *   ['a', 'a', 'b', 'b', 'c', 'c']
 * );
 * ```
 */
function* flatMap<In, Out>(mapperFn: (x: In) => Out | Array<Out>, iterable: Iterable<In>): Iterable<Out> {
  for (const x of iterable) {
    const result = mapperFn(x);
    if (Array.isArray(result)) {
      yield* result;
    } else {
      yield result;
    }
  }
}

/**
 * Returns an iterable with the first `limit` items of `iterable`.
 * 
 * ```ts
 * function* naturalNumbers() {
 *   for(let i=0;; i++) {
 *     yield i;
 *   }
 * }
 * assert.deepEqual(
 *   toArray(Iterable.take(3, naturalNumbers())),
 *   [0, 1, 2]
 * );
 * assert.deepEqual(
 *   toArray(Iterable.take(2, ['a', 'b', 'c'])),
 *   ['a', 'b']
 * );
 * ```
 */
function* take<Item>(limit: number, iterable: Iterable<Item>): Iterable<Item> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for (const x of iterable) {
    if (i >= limit) break;
    yield x;
    i++;
  }
}

/**
 * Returns an iterable with all items of `iterable`, except for the first `limit` ones.
 * 
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.drop(1, ['a', 'b', 'c'])),
 *   ['b', 'c']
 * );
 * ```
 */
function* drop<Item>(limit: number, iterable: Iterable<Item>): Iterable<Item> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for (const x of iterable) {
    if (i >= limit) {
      yield x;
    }
    i++;
  }
}

/**
 * Each item `x` of `iterable` is converted to an item `[index, x]` in the
 * returned iterable.
 *
 * While Array methods such as `.map()` and `.filter()` always provide indices,
 * the functions in this module don’t. Therefore, this function is useful
 * whenever we need indices – e.g., to determine which item is first in an
 * iterable.
 * 
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.asIndexedPairs(['a', 'b', 'c'])),
 *   [[0, 'a'], [1, 'b'], [2, 'c']]
 * );
 * ```
 */
function* asIndexedPairs<Item>(iterable: Iterable<Item>): Iterable<[number, Item]> {
  let index=0;
  for (const value of iterable) {
    yield [index, value];
    index++;
  }
}

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

type ThreeArgs<In, Out> = [reducer: (acc: Out, item: In) => Out, initialValue: Out, iterable: Iterable<In>];
type TwoArgs<InOut> = [reducer: (acc: InOut, item: InOut) => InOut, iterable: Iterable<InOut>];

/**
 * Feeds all items of `iterable` to `reducer()` which folds them into `acc`.
 * The last `acc` returned by `reducer()` is the result of this function.
 * ```ts
 * assert.deepEqual(
 *   Iterable.reduce((acc, item) => acc + item, ['a', 'b', 'c']),
 *   'abc'
 * );
 * assert.deepEqual(
 *   Iterable.reduce((acc, item) => acc + item, 'x', ['a', 'b', 'c']),
 *   'xabc'
 * );
 * ```
 * @param initialValue The first value of `acc`. If it is missing, the first item of `iterable` is used, instead.
 * @throws TypeError If `iterable` is empty and no `initialValue` is provided.
 */
function reduce<In, Out>(reducer: (acc: Out, item: In) => Out, initialValue: Out, iterable: Iterable<In>): Out;
function reduce<InOut>(reducer: (acc: InOut, item: InOut) => InOut, iterable: Iterable<InOut>): InOut;
function reduce<In, Out>(...args: ThreeArgs<In, Out> | TwoArgs<In>): any {
  let reducer, initialValue, iterable;
  if (args.length === 3) {
    [reducer, initialValue, iterable] = args;
  } else {
    [reducer, iterable] = args;
    initialValue = NO_INITIAL_VALUE;
  }

  // The sentinel value NO_INITIAL_VALUE means we can use for-await-of
  // and don’t have to handle abrupt termination ourselves.
  let accumulator: any  = initialValue;
  for (const value of iterable) {
    if (accumulator === NO_INITIAL_VALUE) {
      accumulator = value;
      continue;
    }
    accumulator = reducer(accumulator, value);
  }
  if (accumulator === NO_INITIAL_VALUE) {
    throw new TypeError('Must specify an initialValue if the iterable is empty.');
  }
  return accumulator;
}

/**
 * Retrieves each item of `iterable` and invokes `fn()` with it.
 * 
 * ```ts
 * const result = [];
 * Iterable.forEach(x => result.push(x + x), ['a', 'b', 'c'])
 * assert.deepEqual(
 *   result,
 *   ['aa', 'bb', 'cc']
 * );
 * ```
 */
function forEach<Item>(fn: (item: Item) => void, iterable: Iterable<Item>): void {
  for (const item of iterable) {
    fn(item);
  }
}

/**
 * Iterates over each `item` of `iterable` and returns `true` as soon as
 * `pred(item)` returns a truthy value. It short-circuits in that case and
 * doesn’t visit the remaining items of `iterable`. That means, we can use this
 * function with iterables of infinite length.
 *
 * This function returns `false` if `pred()` never returns a truthy value
 * and `iterable` is of finite length.
 * 
 * ```ts
 * function* naturalNumbers() {
 *   for(let i=0;; i++) {
 *     yield i;
 *   }
 * }
 * assert.equal(
 *   await AsyncIterable.some((item) => item > 0, fi([5, -3, 12])),
 *   true
 * );
 * assert.equal(
 *   await AsyncIterable.some((item) => item < 0, fi([5, -3, 12])),
 *   true
 * );
 * assert.equal(
 *   await AsyncIterable.some((item) => item < -3, fi([5, -3, 12])),
 *   false
 * );
 *
 * assert.equal(
 *   await AsyncIterable.some((item) => item > 10, fi(naturalNumbers())),
 *   true
 * );
 * ```
 */
function some<Item>(pred: (item: Item) => boolean, iterable: Iterable<Item>): boolean {
  for (const item of iterable) {
    if (pred(item)) {
      return true;
    }
  }
  return false;
}

/**
 * Iterates over each `item` of `iterable` and returns `false` as soon as
 * `pred(item)` returns a falsy value. It short-circuits in that case and
 * doesn’t visit the remaining items of `iterable`. That means, we can use this
 * function with iterables of infinite length.
 *
 * This function returns `true` if `pred()` never returns a falsy value
 * and `iterable` is of finite length.
 * 
 * ```ts
 * function* naturalNumbers() {
 *   for(let i=0;; i++) {
 *     yield i;
 *   }
 * }
 * assert.equal(
 *   Iterable.every((item) => item > 0, [5, -3, 12]),
 *   false
 * );
 * assert.equal(
 *   Iterable.every((item) => item < 0, [5, -3, 12]),
 *   false
 * );
 * assert.equal(
 *   Iterable.every((item) => item >= -3, [5, -3, 12]),
 *   true
 * );
 * 
 * assert.equal(
 *   Iterable.every((item) => item <= 10, naturalNumbers()),
 *   false
 * );
 * ```
 */
function every<Item>(pred: (item: Item) => boolean, iterable: Iterable<Item>): boolean {
  for (const item of iterable) {
    if (!pred(item)) {
      return false;
    }
  }
  return true;
}

/**
 * Iterates over each `item` of `iterable` and returns `item` as soon as
 * `pred(item)` returns a truthy value. It short-circuits in that case and
 * doesn’t visit the remaining items of `iterable`. That means, we can use this
 * function with iterables of infinite length.
 *
 * This function returns `undefined` if `pred()` never returns a truthy value
 * and `iterable` is of finite length.
 *
 * ```ts
 * function* naturalNumbers() {
 *   for(let i=0;; i++) {
 *     yield i;
 *   }
 * }
 * assert.equal(
 *   Iterable.find((item) => item > 0, [5, -3, 12, -8]),
 *   5
 * );
 * assert.equal(
 *   Iterable.find((item) => item < 0, [5, -3, 12, -8]),
 *   -3
 * );
 *
 * assert.equal(
 *   Iterable.find((item) => item > 20, naturalNumbers()),
 *   21
 * );
 * ```
 */
 function find<Item>(pred: (item: Item) => boolean, iterable: Iterable<Item>): undefined | Item {
  for (const item of iterable) {
    if (pred(item)) {
      return item;
    }
  }
  return undefined;
}

/**
 * `T` must include `unknown` somewhere, so that the Array stays mixed (heterogeneous). The 1-ary tuple in the type union is also required to ensure tuple-ness.
 */
type MixedArray<Elem> = Array<Elem> | [Elem];

/**
 * `T` must include `unknown` somewhere, so that the object stays mixed (heterogeneous).
 */
type MixedObject<T> = {[key: string]: T};

/**
 * Depending on its argument, this function converts:
 * - An n-ary Array of iterables into an iterable of n-ary Arrays whose elements
 *   are the items of those iterables.
 * - An object whose property values are iterables into an iterable of objects
 *   whose property values are the items of those iterables.
 *
 * ```ts
 * assert.deepEqual(
 *   toArray(Iterable.zip({first: ['a', 'b'], second: [0, 1, 2] })),
 *   [ {first: 'a', second: 0}, {first: 'b', second: 1} ]
 * );
 * assert.deepEqual(
 *   toArray(Iterable.zip([ ['a', 'b'], [0, 1, 2] ])),
 *   [ ['a', 0], ['b', 1] ]
 * );
 * ```
 */

function zip<MArr extends MixedArray<Iterable<unknown>>>(
  iterables: MArr
): Iterable<{[Key in keyof MArr]: UnwrapIterable<MArr[Key]>}>;

function zip<MObj extends MixedObject<Iterable<unknown>>>(
  iterables: MObj
): Iterable<{[Key in keyof MObj]: UnwrapIterable<MObj[Key]>}>;

function* zip(iterables: any): unknown {
  const ItemConstructor = Array.isArray(iterables) ? Array : Object;
  
  const keyToIterator = new Map<string, Iterator<unknown>>(
    Object.keys(iterables).map(
      key => [key, getIterator(iterables[key])]
    )
  );
  
  const doneIterators = new Set<Iterator<unknown>>();
  try {
    item_loop:
    while (true) {
      // The type is actually: Array<any> | Record<string, any>
      // But this is more convenient and Arrays are fine with string indices
      const item: Record<string, any> = new ItemConstructor();
      // We have to visit all keys and can’t stop after first `done`.
      // Reason: If all iterables have the same lengths, users expect
      // them all to be exhausted.
      for (const [key, iterator] of keyToIterator.entries()) {
        const {value, done} = iterator.next();
        if (done) {
          doneIterators.add(iterator);
        } else {
          item[key] = value;
        }
      }
      if (doneIterators.size > 0) {
        // At least one iterator is done
        break item_loop;
      }
      yield item;
    }
  } finally {
    // Notify iterators that we haven’t exhausted that they were abruptly terminated
    for (const iterator of keyToIterator.values()) {
      if (!doneIterators.has(iterator)) {
        if (iterator.return) {
          iterator.return();
        }
      }
    }
  }
}

function toArray<Item>(iterable: Iterable<Item>): Array<Item> {
  const result = [];
  for (const item of iterable) {
    result.push(item);
  }
  return result;
}

//========== Export

const Functions = {
  map,
  filter,
  flatMap,

  take,
  drop,

  asIndexedPairs,
  reduce,
  forEach,
  
  some,
  every,
  find,
  
  zip,
  toArray,

};

export {Functions as Iterable};

//========== Helpers


type UnwrapIterable<I> =
  I extends Iterable<infer Item>
  ? Item
  : I extends Iterable<infer Item>
  ? Item
  : never
;

function getIterator<Item>(iterable: Iterable<Item>): Iterator<Item> {
  return iterable[Symbol.iterator]();
}


// Acknowledgement:
// – Types of zip() inspired by work of @ncjamieson, @BenLesh, @jamesernator

