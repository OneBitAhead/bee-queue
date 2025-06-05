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
  bool,
  finallyRejectsWithInitial,
  has,
  // wrapper for asCallback
  asCallback: function (promise, callback) {
    if (typeof callback !== 'function') return promise;
    promise
      .then(result => callback(null, result))
      .catch(err => callback(err));
    return promise;
  },
  // wrapper for 
  deferred: function deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  },
  withTimeout: function(promise, ms, message = 'Operation timed out') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    });
  
    // Race the original promise against the timeout
    return Promise.race([
      promise.finally(() => clearTimeout(timeoutId)),
      timeoutPromise
    ]);
  },
  // wrapper for callAsync
  callAsync: function(thunk){
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
  },//end-of-wrapper
  //wrapper for wrapAsync
  wrapAsync:function(fn){
    return (...args) => {
      return new Promise((resolve, reject) => {
        try {
          fn(...args, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        } catch (err) {
          reject(err);
        }
      });
    };
  }//end-of-wrapper
}

