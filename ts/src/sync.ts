
function* map<T, U>(mapperFn: (x: T) => U, iterable: Iterable<T>): Iterable<U> {
  for (const x of iterable) {
    yield mapperFn(x);
  }
}
function* filter<T>(filterFn: (x: T) => boolean, iterable: Iterable<T>): Iterable<T> {
  for (const x of iterable) {
    if (filterFn(x)) {
      yield x;
    }
  }
}
function* flatMap<T, U>(mapperFn: (x: T) => U | Array<U>, iterable: Iterable<T>): Iterable<U> {
  for (const x of iterable) {
    const result = mapperFn(x);
    if (Array.isArray(result)) {
      yield* result;
    } else {
      yield result;
    }
  }
}
function* take<T>(limit: number, iterable: Iterable<T>): Iterable<T> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for (const x of iterable) {
    if (i >= limit) break;
    yield x;
    i++;
  }
}
function* drop<T>(limit: number, iterable: Iterable<T>): Iterable<T> {
  let i=0;
  // Use `for-of` instead of `for` so that abrupt termination is handled correctly
  for (const x of iterable) {
    if (i >= limit) {
      yield x;
    }
    i++;
  }
}

function* asIndexedPairs<T>(iterable: Iterable<T>): Iterable<[number, T]> {
  let index=0;
  for (const value of iterable) {
    yield [index, value];
    index++;
  }
}

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

type ThreeArgs<In, Out> = [reducer: (acc: Out, elem: In) => Out, initialValue: Out, iterable: Iterable<In>];
type TwoArgs<InOut> = [reducer: (acc: InOut, elem: InOut) => InOut, iterable: Iterable<InOut>];
function reduce<In, Out>(...args: ThreeArgs<In, Out>): Out;
function reduce<InOut>(...args: TwoArgs<InOut>): InOut;
function reduce<In, Out>(...args: ThreeArgs<In, Out> | TwoArgs<In>): any {
  let reducer, initialValue, iterable;
  if (args.length === 3) {
    [reducer, initialValue, iterable] = args;
  } else {
    [reducer, iterable] = args;
    initialValue = NO_INITIAL_VALUE;
  }

  let accumulator: any  = initialValue;
  for (const value of iterable) {
    if (accumulator === NO_INITIAL_VALUE) {
      accumulator = value;
      continue;
    }
    accumulator = reducer(accumulator, value);
  }
  if (accumulator === NO_INITIAL_VALUE) {
    return undefined;
  }
  return accumulator;
}

function forEach<Item>(fn: (item: Item) => void, items: Iterable<Item>): void {
  for (const item of items) {
    fn(item);
  }
}

/**
 * Can be used with infinite iterables.
 */
function some<Item>(pred: (item: Item) => boolean, items: Iterable<Item>): boolean {
  for (const item of items) {
    if (pred(item)) {
      return true;
    }
  }
  return false;
}

/**
 * Can be used with infinite iterables.
 */
 function every<Item>(pred: (item: Item) => boolean, items: Iterable<Item>): boolean {
  for (const item of items) {
    if (!pred(item)) {
      return false;
    }
  }
  return true;
}

/**
 * Can be used with infinite iterables.
 */
 function find<Item>(pred: (item: Item) => boolean, items: Iterable<Item>): undefined | Item {
  for (const item of items) {
    if (pred(item)) {
      return item;
    }
  }
  return undefined;
}

type UnwrapIterable<T> = T extends Iterable<infer U> ? U : never;

/**
 * `T` must include `unknown` somewhere, so that the Array stays mixed (heterogeneous).
 */
type MixedArray<T> = Array<T> | [T];

/**
 * `T` must include `unknown` somewhere, so that the object stays mixed (heterogeneous).
 */
type MixedObject<T> = {[key: string]: T};

function zip<MArr extends MixedArray<Iterable<unknown>>>(iterables: MArr): Iterable<{[Key in keyof MArr]: UnwrapIterable<MArr[Key]>}>;
function zip<MObj extends MixedObject<Iterable<unknown>>>(iterables: MObj): Iterable<{[Key in keyof MObj]: UnwrapIterable<MObj[Key]>}>;
function* zip(iterables: any): unknown {
  const ItemConstructor = Array.isArray(iterables) ? Array : Object;
  
  const keyToIterator = new Map<string, Iterator<unknown>>(
    Object.keys(iterables).map(
      key => [key, iterables[key][Symbol.iterator]()]
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

function toArray<T>(iterable: Iterable<T>) {
  const result = [];
  for (const item of iterable) {
    result.push(item);
  }
  return result;
}


export const Iterable = {
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

// Acknowledgement:
// – Types of zip() inspired by work of @ncjamieson, @BenLesh, @jamesernator
