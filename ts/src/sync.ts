//========== Functions

function* map<In, Out>(mapperFn: (x: In) => Out, iterable: Iterable<In>): Iterable<Out> {
  for (const x of iterable) {
    yield mapperFn(x);
  }
}
function* filter<Item>(filterFn: (x: Item) => boolean, iterable: Iterable<Item>): Iterable<Item> {
  for (const x of iterable) {
    if (filterFn(x)) {
      yield x;
    }
  }
}
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
function* take<Item>(limit: number, iterable: Iterable<Item>): Iterable<Item> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for (const x of iterable) {
    if (i >= limit) break;
    yield x;
    i++;
  }
}
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

function forEach<Item>(fn: (item: Item) => void, iterable: Iterable<Item>): void {
  for (const item of iterable) {
    fn(item);
  }
}

/**
 * Can be used with infinite iterables.
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
 * Can be used with infinite iterables.
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
 * Can be used with infinite iterables.
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

