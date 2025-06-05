'use strict';

const hasOwn = Object.prototype.hasOwnProperty;

function has(object, name) {
  return hasOwn.call(object, name);
}

function bool(input, defaultValue) {
  if (typeof input === 'boolean') {
    return input;
  }
  return defaultValue;
}

/**
 * A variant of the Promise#finally implementation. Instead of rejecting with
 * the error that occurs in the finally clause, it rejects with the error from
 * the original Promise first, and falls back to using the error from the
 * finally clause if no such error occurred.
 */
function finallyRejectsWithInitial(promise, fn) {
  return promise.then(
    (value) => Promise.resolve(fn()).then(() => value),
    (err) => {
      const reject = () => Promise.reject(err);
      return new Promise((resolve) => resolve(fn())).then(reject, reject);
    }
  );
}

module.exports = {
  has,
  bool,
  finallyRejectsWithInitial,
  asCallback: function (promise, callback) {
    if (typeof callback !== 'function') return promise;
    promise
      .then(result => callback(null, result))
      .catch(err => callback(err));
    return promise;
  },
  callAsync: function (thunk) {
    return new Promise((resolve, reject) => {
      try {
        thunk((err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    })
  },
  deferred: function deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  },
  delay: function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },  
  withTimeout: function (promise, ms, message = 'Operation timed out') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([
      promise.finally(() => clearTimeout(timeoutId)),
      timeoutPromise
    ]);
  },
  wrapAsync: function (fn, options = {}) {
    const catchExceptions = (typeof options.catchExceptions === 'boolean') ? options.catchExceptions : true;
    return async function asyncWrapper(...args) {
      try {      
        if (fn.length > args.length) {          
          return await new Promise((resolve, reject) => {
            fn.call(this, ...args, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
        } else {        
          return await fn.apply(this, args);
        }
      } catch (e) {
        if (catchExceptions) {
          throw e;
        }
       return;
      }
    };
  }
};

