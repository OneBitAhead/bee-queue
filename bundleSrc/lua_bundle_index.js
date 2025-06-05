'use strict';
const crypto = require('node:crypto');

const luaScripts = {
    "addDelayedJob": require("./addDelayedJob.lua"),
    "addJob": require("./addJob.lua"),
    "checkStalledJobs": require("./checkStalledJobs.lua"),
    "raiseDelayedJobs": require("./raiseDelayedJobs.lua"),
    "removeJob": require("./removeJob.lua")     
}

const scripts = {};
const shas = {};

function readScript(name, script) {
  scripts[name] = script;
  const hash = crypto.createHash('sha1');
  hash.update(script);
  shas[name] = hash.digest('hex'); 
}

function readScripts() {
  for(var x in luaScripts){
    readScript(x, luaScripts[x])
  }  
}

async function loadScriptIfMissing(client, scriptKey) {
  // check if it exists
  var exists = await new Promise((resolve, reject)=>{
    client.script('exists', shas[scriptKey], resolve)
  })
  // not? load it!
  if(exists === null){
    await new Promise((resolve, reject)=>{
        client.script('load', scripts[scriptKey], resolve)
    });
  }
}

async function buildCache(client) {
  readScripts()
  return Promise.all(Object.keys(shas).map((key) => loadScriptIfMissing(client, key)))
}

module.exports = {
  scripts,
  shas,
  buildCache,
};
