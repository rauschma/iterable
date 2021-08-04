//========== Functions

async function* map<In, Out>(mapperFn: (x: In) => Out, iterable: AsyncOrSyncIterable<In>): AsyncIterable<Out> {
  for await (const x of iterable) {
    yield mapperFn(x);
  }
}
async function* filter<Item>(filterFn: (x: Item) => boolean, iterable: AsyncOrSyncIterable<Item>): AsyncIterable<Item> {
  for await (const x of iterable) {
    if (filterFn(x)) {
      yield x;
    }
  }
}
async function* flatMap<In, Out>(mapperFn: (x: In) => Out | Array<Out>, iterable: AsyncOrSyncIterable<In>): AsyncIterable<Out> {
  for await (const x of iterable) {
    const result = mapperFn(x);
    if (Array.isArray(result)) {
      yield* result;
    } else {
      yield result;
    }
  }
}
async function* take<Item>(limit: number, iterable: AsyncOrSyncIterable<Item>): AsyncIterable<Item> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for await (const x of iterable) {
    if (i >= limit) break;
    yield x;
    i++;
  }
}
async function* drop<Item>(limit: number, iterable: AsyncOrSyncIterable<Item>): AsyncIterable<Item> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for await (const x of iterable) {
    if (i >= limit) {
      yield x;
    }
    i++;
  }
}

async function* asIndexedPairs<Item>(iterable: AsyncOrSyncIterable<Item>): AsyncIterable<[number, Item]> {
  let index=0;
  for await (const value of iterable) {
    yield [index, value];
    index++;
  }
}

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

type ThreeArgs<In, Out> = [reducer: (acc: Out, item: In) => Out, initialValue: Out, iterable: AsyncOrSyncIterable<In>];
type TwoArgs<InOut> = [reducer: (acc: InOut, item: InOut) => InOut, iterable: AsyncOrSyncIterable<InOut>];

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
function reduce<In, Out>(reducer: (acc: Out, item: In) => Out, initialValue: Out, iterable: AsyncOrSyncIterable<In>): Promise<Out>;
function reduce<InOut>(reducer: (acc: InOut, item: InOut) => InOut, iterable: AsyncOrSyncIterable<InOut>): Promise<InOut>;
async function reduce<In, Out>(...args: ThreeArgs<In, Out> | TwoArgs<In>): Promise<any> {
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
  for await (const value of iterable) {
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

async function forEach<Item>(fn: (item: Item) => void, iterable: AsyncOrSyncIterable<Item>): Promise<void> {
  for await (const item of iterable) {
    fn(item);
  }
}

/**
 * Can be used with infinite iterables.
 */
async function some<Item>(pred: (item: Item) => boolean, iterable: AsyncOrSyncIterable<Item>): Promise<boolean> {
  for await (const item of iterable) {
    if (pred(item)) {
      return true;
    }
  }
  return false;
}

/**
 * Can be used with infinite iterables.
 */
 async function every<Item>(pred: (item: Item) => boolean, iterable: AsyncOrSyncIterable<Item>): Promise<boolean> {
  for await (const item of iterable) {
    if (!pred(item)) {
      return false;
    }
  }
  return true;
}

/**
 * Can be used with infinite iterables.
 */
 async function find<Item>(pred: (item: Item) => boolean, iterable: AsyncOrSyncIterable<Item>): Promise<undefined | Item> {
  for await (const item of iterable) {
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

function zip<MArr extends MixedArray<AsyncOrSyncIterable<unknown>>>(
  iterables: MArr
): AsyncIterable<{[Key in keyof MArr]: UnwrapAsyncOrSyncIterable<MArr[Key]>}>;

function zip<MObj extends MixedObject<AsyncOrSyncIterable<unknown>>>(
  iterables: MObj
): AsyncIterable<{[Key in keyof MObj]: UnwrapAsyncOrSyncIterable<MObj[Key]>}>;

async function* zip(iterables: any): unknown {
  const ItemConstructor = Array.isArray(iterables) ? Array : Object;
  
  const keyToIterator = new Map<string, AsyncIterator<unknown>>(
    Object.keys(iterables).map(
      key => [key, getAsyncIterator(iterables[key])]
    )
  );
  
  const doneIterators = new Set<AsyncIterator<unknown>>();
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
        const {value, done} = await iterator.next();
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

async function toArray<Item>(iterable: AsyncOrSyncIterable<Item>): Promise<Array<Item>> {
  const result = [];
  for await (const item of iterable) {
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

  //<async>
  fromIterable,
  //</async>
};

//<async>
export {Functions as AsyncIterable};
//</async>
//<sync>
// export {Functions as Iterable};
//</sync>

//========== Helpers

//<async>
import { isIterable } from "./util/misc.js";

type AsyncOrSyncIterable<Item> = AsyncIterable<Item> | Iterable<Item>;

type UnwrapAsyncOrSyncIterable<I> =
  I extends AsyncIterable<infer Item>
  ? Item
  : UnwrapIterable<I>
;

async function* fromIterable<Item>(iterable: Iterable<Item>): AsyncIterable<Item> {
  for (const item of iterable) {
    yield item;
  }
}

function getAsyncIterator<Item>(iterable: AsyncOrSyncIterable<Item>): AsyncIterator<Item> {
  if (isIterable(iterable)) {
    iterable = fromIterable(iterable);
  }
  return iterable[Symbol.asyncIterator]();
}
//</async>

type UnwrapIterable<I> =
  I extends AsyncIterable<infer Item>
  ? Item
  : I extends Iterable<infer Item>
  ? Item
  : never
;

//<sync>
// function getIterator<Item>(iterable: Iterable<Item>): Iterator<Item> {
//   return iterable[Symbol.iterator]();
// }
//</sync>

//<async-off-config>
// {
//   "renameVariable": {
//     "getAsyncIterator": "getIterator"
//   },
//   "renameType": {
//     "AsyncOrSyncIterable": "Iterable",
//     "UnwrapAsyncOrSyncIterable": "UnwrapIterable"
//   }
// }
//</async-off-config>

// Acknowledgement:
// – Types of zip() inspired by work of @ncjamieson, @BenLesh, @jamesernator
