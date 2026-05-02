/**
 * Tiny concurrency limiter. Avoids adding p-limit as a dep.
 *
 * Usage:
 *   const limit = pLimit(3);
 *   await Promise.all(items.map(item => limit(() => doWork(item))));
 */

export function pLimit(concurrency: number) {
  if (concurrency < 1 || !Number.isInteger(concurrency)) {
    throw new Error(`concurrency must be a positive integer, got ${concurrency}`);
  }

  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= concurrency) return;
    const task = queue.shift();
    if (task) {
      active++;
      task();
    }
  };

  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
  };
}
