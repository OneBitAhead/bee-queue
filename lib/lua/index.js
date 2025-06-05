'use strict';

const fsp = require('node:fs/promises');
const crypto = require('node:crypto');
const path = require('node:path');


const scripts = {};
const shas = {};
let scriptsRead = false;
let scriptsPromise = null;

async function readScript(file) {  
  var script = await fsp.readFile(path.join(__dirname, file), 'utf8')  
  const name = file.slice(0, -4);
  scripts[name] = script;
  const hash = crypto.createHash('sha1');
  hash.update(script);
  shas[name] = hash.digest('hex');  
}

async function readScripts() {
  if (scriptsRead) return scriptsPromise;
  scriptsRead = true;
  return (scriptsPromise = fsp.readdir(__dirname)
    .then((files) =>
      Promise.all(files.filter((file) => file.endsWith('.lua')).map(readScript))
  )
  .then(() => scripts));
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
  // We could theoretically pipeline this, but it's pretty insignificant.
  await readScripts()
  return Promise.all(Object.keys(shas).map((key) => loadScriptIfMissing(client, key)))
}

module.exports = {
  scripts,
  shas,
  buildCache,
};
