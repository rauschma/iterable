import * as assert from 'assert/strict';
import { Iterable } from '../../src/sync.js';

suite('sync-termination_test.ts');

test('Does map() forward an abrupt termination?', () => {
  {
    const {trackedIterable: iterable, trackingStatus: status} = trackIteratorReturn(['a', 'b', 'c']);
    for (const x of Iterable.map(x => x + x, iterable)) {
      // no abrupt termination
    }
    assert.equal(status.returnWasCalled, false);
  }
  {
    const {trackedIterable: iterable, trackingStatus: status} = trackIteratorReturn(['a', 'b', 'c']);
  
    for (const x of Iterable.map(x => x + x, iterable)) {
      break; // abrupt termination
    }
  
    assert.equal(status.returnWasCalled, true);
  }
});

test('Does flatMap() forward an abrupt termination?', () => {
  {
    const {trackedIterable: iterable, trackingStatus: status} = trackIteratorReturn(['a', 'b', 'c']);
    for (const x of Iterable.flatMap(x => [x, x], iterable)) {
      // no abrupt termination
    }
    assert.equal(status.returnWasCalled, false);
  }
  {
    const {trackedIterable: iterable, trackingStatus: status} = trackIteratorReturn(['a', 'b', 'c']);
  
    for (const x of Iterable.flatMap(x => [x, x], iterable)) {
      break; // abrupt termination
    }
  
    assert.equal(status.returnWasCalled, true);
  }
});

test('Does zip() forward an abrupt termination?', () => {
  {
    const {trackedIterable: firstIterable, trackingStatus: firstStatus} = trackIteratorReturn(['a', 'b']);
    const {trackedIterable: secondIterable, trackingStatus: secondStatus} = trackIteratorReturn([0, 1]);

    for (const x of Iterable.zip({first: firstIterable, second: secondIterable })) {
      break; // abrupt termination
    }
  
    assert.equal(firstStatus.returnWasCalled, true, 'firstStatus');
    assert.equal(secondStatus.returnWasCalled, true, 'secondStatus');
  }
  {
    const {trackedIterable: firstIterable, trackingStatus: firstStatus} = trackIteratorReturn(['a', 'b']);
    const {trackedIterable: secondIterable, trackingStatus: secondStatus} = trackIteratorReturn([0, 1]);

    for (const x of Iterable.zip({first: firstIterable, second: secondIterable })) {
      // no abrupt termination
    }
  
    assert.equal(firstStatus.returnWasCalled, false, 'firstStatus');
    assert.equal(secondStatus.returnWasCalled, false, 'secondStatus');
  }
});

test('Does zip() tell an iterable when it doesn’t exhaust it?', () => {
  // Iterables have the same “length”
  {
    const {trackedIterable: firstIterable, trackingStatus: firstStatus} = trackIteratorReturn(['a', 'b']);
    const {trackedIterable: secondIterable, trackingStatus: secondStatus} = trackIteratorReturn([0, 1]);
  
    // We must exhaust what zip() returns!
    [...Iterable.zip({first: firstIterable, second: secondIterable })];
  
    // Both iterables were exhausted
    assert.equal(firstStatus.returnWasCalled, false, 'firstStatus');
    assert.equal(secondStatus.returnWasCalled, false, 'secondStatus');  
  }
  // Iterables have different “lengths”
  {
    const {trackedIterable: firstIterable, trackingStatus: firstStatus} = trackIteratorReturn(['a', 'b']);
    const {trackedIterable: secondIterable, trackingStatus: secondStatus} = trackIteratorReturn([0, 1, 2]);
  
    // We must exhaust what zip() returns!
    [...Iterable.zip({first: firstIterable, second: secondIterable })];
  
    assert.equal(firstStatus.returnWasCalled, false, 'firstStatus');
    assert.equal(secondStatus.returnWasCalled, true, 'secondStatus');  
  }
});

//========== Helpers

interface TrackIteratorReturnResult<T> {
  trackedIterable: Iterable<T>;
  trackingStatus: {returnWasCalled: boolean};
}
function trackIteratorReturn<T>(iterable: Iterable<T>): TrackIteratorReturnResult<T> {
  let trackingStatus = {returnWasCalled: false};
  return {
    trackedIterable: {
      [Symbol.iterator](): Iterator<T> {
        const iterator = iterable[Symbol.iterator]();
        return {
          next: iterator.next.bind(iterator),
          return(value: any): IteratorResult<T> {
            trackingStatus.returnWasCalled = true;
            if (iterator.return) {
              return iterator.return(value);
            }
            return {done: true, value: undefined};
          },
        };
      },
    },
    trackingStatus,
  };
}
