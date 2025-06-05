'use strict';

const redis = require('redis');

function createClient(settings, createNew) {
  let client;
  if (isClient(settings)) {
    // We assume it's a redis client from either node_redis or ioredis.
    client = settings;

    if (createNew) {
      // Both node_redis and ioredis support the duplicate method, which creates
      // a new redis client with the same configuration.
      client = client.duplicate();
    } else if (isReady(client)) {
      // If we were given a redis client, and we don't want to clone it (to
      // enable connection sharing between Queue instances), and it's already
      // ready, then just return it.
      return Promise.resolve(client);
    } // otherwise, we wait for the client to be in the ready state.
  } else {
    // node_redis mutates the options object we provide it, so we clone the
    // settings first.
    if (typeof settings === 'object') {
      settings = Object.assign({}, settings);
    }
    client = redis.createClient(settings);
  }


  // Wait for the client to be ready, then resolve with the client itself.
  return new Promise((resolve, reject) => {

    client.on('ready', async () => {     
      resolve(client);
    });
    client.on('reconnecting', (err) => {
      console.log("Reconnecting:", err);
    });
    client.on('error', (err) => {
      console.log(err);
      disconnect(client);
      reject(err);
    });
  });

}

function disconnect(client) {
  // Redis#end is deprecated for ioredis.
  /* istanbul ignore if: this is only for ioredis */
  if (client.disconnect) {
    client.disconnect();
  } else {
    // true indicates that it should invoke all pending callbacks with an
    // AbortError; we need this behavior.
    client.end(true);
  }
}

function isAbortError(err) {
  // node_redis has a designated class for abort errors, but ioredis just has
  // a constant message defined in a utils file.
  return (
    err.name === 'AbortError' ||
    /* istanbul ignore next: this is only for ioredis */
    err.message === 'Connection is closed.'
  );
}

function isClient(object) {
  if (!object || typeof object !== 'object') return false;
  const name = object.constructor.name;
  return name === 'Redis' || name === 'RedisClient';
}

function isReady(client) {
  // node_redis has a ready property, ioredis has a status property.
  return client.ready || client.status === 'ready';
}

exports.createClient = createClient;
exports.disconnect = disconnect;
exports.isAbortError = isAbortError;
exports.isClient = isClient;
exports.isReady = isReady;
