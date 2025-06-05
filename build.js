const fs = require("node:fs");
const { build } = require('esbuild');


var config = {
    minify: true,
    debug: false
}

// PREPARATION OF TEMP FOLDER
// 1. Copy src into new temp folder
fs.cpSync('./lib', './temp/lib', { recursive: true });
fs.cpSync('./index.js', './temp/index.js', { recursive: true });
// 2. Replace the lib/lua/index.js with the content of the /bundleSrc/lua_bundle_index.js
fs.cpSync('./bundleSrc/lua_bundle_index.js', './temp/lib/lua/index.js');

async function main() {

    // Build bundle including redis client (to use without any npm install at all!)
    var result = await build({
        entryPoints: ['./temp/index.js'],
        bundle: true,
        metafile: true,
        minify: (config.minify === true) ? true : false,
        external: ["redis"],
        platform: "node",
        outfile: 'dist/bundle.js',
        loader: { '.lua': 'text' }
    });
    if(config.debug) console.log(result.metafile.outputs["dist/bundle.js"]);


    // Build bundle without redis client (to use where the redis client already exists or is included...)
    var result = await build({
        entryPoints: ['./temp/index.js'],
        bundle: true,
        metafile: true,
        minify: (config.minify === true) ? true : false,
        external: [],
        platform: "node",
        outfile: 'dist/bundle_wo_redis.js',
        loader: { '.lua': 'text' }
    });
    if(config.debug) console.log(result.metafile.outputs["dist/bundle_wo_redis.js"]);

    fs.rmSync('./temp', { recursive: true });
}
main();