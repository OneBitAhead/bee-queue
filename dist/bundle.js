var c=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var q=c(f=>{"use strict";var $=require("redis");function X(n,e){let t;if(K(n)){if(t=n,e)t=t.duplicate();else if(I(t))return Promise.resolve(t)}else typeof n=="object"&&(n=Object.assign({},n)),t=$.createClient(n);return new Promise((i,s)=>{t.on("ready",async()=>{i(t)}),t.on("reconnecting",r=>{console.log("Reconnecting:",r)}),t.on("error",r=>{console.log(r),E(t),s(r)})})}function E(n){n.disconnect?n.disconnect():n.end(!0)}function Q(n){return n.name==="AbortError"||n.message==="Connection is closed."}function K(n){if(!n||typeof n!="object")return!1;let e=n.constructor.name;return e==="Redis"||e==="RedisClient"}function I(n){return n.ready||n.status==="ready"}f.createClient=X;f.disconnect=E;f.isAbortError=Q;f.isClient=K;f.isReady=I});var w=c((we,j)=>{"use strict";var Z=Object.prototype.hasOwnProperty;function ee(n,e){return Z.call(n,e)}function te(n,e){return typeof n=="boolean"?n:e}function ie(n,e){return n.then(t=>Promise.resolve(e()).then(()=>t),t=>{let i=()=>Promise.reject(t);return new Promise(s=>s(e())).then(i,i)})}j.exports={has:ee,bool:te,finallyRejectsWithInitial:ie,asCallback:function(n,e){return typeof e!="function"||n.then(t=>e(null,t)).catch(t=>e(t)),n},callAsync:function(n){return new Promise((e,t)=>{try{n((i,s)=>{if(i)return t(i);e(s)})}catch(i){t(i)}})},deferred:function(){let e,t;return{promise:new Promise((s,r)=>{e=s,t=r}),resolve:e,reject:t}},delay:function(e){return new Promise(t=>setTimeout(t,e))},withTimeout:function(n,e,t="Operation timed out"){let i,s=new Promise((r,a)=>{i=setTimeout(()=>a(new Error(t)),e)});return Promise.race([n.finally(()=>clearTimeout(i)),s])},wrapAsync:function(n,e={}){let t=typeof e.catchExceptions=="boolean"?e.catchExceptions:!0;return async function(...s){try{return n.length>s.length?await new Promise((r,a)=>{n.call(this,...s,(l,o)=>{if(l)return a(l);r(o)})}):await n.apply(this,s)}catch(r){if(t)throw r;return}}}}});var T=c((ke,C)=>{"use strict";var se=require("node:events").EventEmitter,u=w(),m=class extends se{constructor(e,t,i,s){super(),this.queue=e,this.id=t,this.progress=0,this.data=i||{},this.options=s||{},this.options.timestamp=this.options.timestamp||Date.now(),this.options.stacktraces=this.options.stacktraces||[],this.status="created"}static fromId(e,t,i){let s=e._commandable().then(r=>u.callAsync(a=>r.hget(e.toKey("jobs"),t,a))).then(r=>r?m.fromData(e,t,r):null);return i&&u.asCallback(s,i),s}static fromData(e,t,i){i=JSON.parse(i);let s=new m(e,t,i.data,i.options);return s.status=i.status,s.progress=i.progress,s}toData(){return JSON.stringify({data:this.data,options:this.options,status:this.status,progress:this.progress})}_save(e){let t=this.queue.toKey.bind(this.queue),i;return this.options.delay?(i=e(["addDelayedJob",4,t("id"),t("jobs"),t("delayed"),t("earlierDelayed"),this.id||"",this.toData(),this.options.delay]),this.queue.settings.activateDelayedJobs&&(i=i.then(s=>(s&&this.queue._delayedTimer.schedule(this.options.delay),s)))):i=e(["addJob",3,t("id"),t("jobs"),t("waiting"),this.id||"",this.toData()]),i.then(s=>(this.id=s,s&&this.queue.settings.storeJobs&&this.queue.jobs.set(s,this),this))}save(e){let t=this._save(i=>this.queue._evalScript.apply(this.queue,i));return e&&u.asCallback(t,e),t}setId(e){return this.id=e,this}retries(e){if(e<0)throw new Error("Retries cannot be negative");return this.options.retries=e,this}delayUntil(e){if(e&&typeof e.getTime=="function"?e=e.getTime():e=parseInt(e,10),isNaN(e)||e<0)throw new Error("invalid delay timestamp");return e>Date.now()&&(this.options.delay=e),this}timeout(e){if(e<0)throw new Error("Timeout cannot be negative");return this.options.timeout=e,this}backoff(e,t){if(!this.queue.backoffStrategies.has(e))throw new Error("unknown strategy");let i=!Number.isSafeInteger(t)||t<=0;if(e!=="immediate"&&i)throw new Error("delay must be a positive integer");return this.options.backoff={strategy:e,delay:t},this}reportProgress(e,t){let i;return e!=null?(this.progress=e,i=this.queue._commandable().then(s=>u.callAsync(r=>s.publish(this.queue.toKey("events"),JSON.stringify({id:this.id,event:"progress",data:e}),r)))):i=Promise.reject(new Error("Progress cannot be empty")),t&&u.asCallback(i,t),i}remove(e){let t=this.queue.removeJob(this.id).then(()=>this);return e&&u.asCallback(t,e),t}retry(e){let t=this.queue._commandable().then(i=>u.callAsync(s=>i.multi().srem(this.queue.toKey("failed"),this.id).lpush(this.queue.toKey("waiting"),this.id).exec(s)));return e&&u.asCallback(t,e),t}isInSet(e,t){let i=this.queue._commandable().then(s=>u.callAsync(r=>s.sismember(this.queue.toKey(e),this.id,r))).then(s=>s===1);return t&&u.asCallback(i,t),i}computeDelay(){let e=this.options.backoff?this.options.backoff.strategy:"immediate",t=this.options.retries>0?this.queue.backoffStrategies.get(e):null;return t?t(this):-1}};C.exports=m});var x=c((ve,J)=>{"use strict";J.exports={stallInterval:5e3,nearTermWindow:20*60*1e3,delayedDebounce:1e3,prefix:"bq",isWorker:!0,getEvents:!0,ensureScripts:!0,activateDelayedJobs:!1,sendEvents:!0,storeJobs:!0,removeOnSuccess:!1,removeOnFailure:!1,redisScanCount:100,initialRedisFailureRetryDelay:1e3,"#close":{timeout:5e3},"#process":{concurrency:1}}});var D=c((Se,re)=>{re.exports=`--[[
key 1 -> bq:name:id (job ID counter)
key 2 -> bq:name:jobs
key 3 -> bq:name:delayed
key 4 -> bq:name:earlierDelayed
arg 1 -> job id
arg 2 -> job data
arg 3 -> job delay timestamp
]]

local jobId = ARGV[1]
if jobId == "" then
  jobId = "" .. redis.call("incr", KEYS[1])
end
if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
redis.call("hset", KEYS[2], jobId, ARGV[2])
redis.call("zadd", KEYS[3], tonumber(ARGV[3]), jobId)

-- if this job is the new head, alert the workers that they need to update their timers
-- if we try to do something tricky like checking the delta between this job and the next job, we
-- can enter a pathological case where jobs incrementally creep sooner, and each one never updates
-- the timers
local head = redis.call("zrange", KEYS[3], 0, 0)
if head[1] == jobId then
  redis.call("publish", KEYS[4], ARGV[3])
end

return jobId
`});var A=c((Ee,ne)=>{ne.exports=`--[[
key 1 -> bq:name:id (job ID counter)
key 2 -> bq:name:jobs
key 3 -> bq:name:waiting
arg 1 -> job id
arg 2 -> job data
]]

local jobId = ARGV[1]
if jobId == "" then
  jobId = "" .. redis.call("incr", KEYS[1])
end
if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
redis.call("hset", KEYS[2], jobId, ARGV[2])
redis.call("lpush", KEYS[3], jobId)

return jobId
`});var R=c((Ke,ae)=>{ae.exports=`--[[
key 1 -> bq:name:stallBlock
key 2 -> bq:name:stalling
key 3 -> bq:name:waiting
key 4 -> bq:name:active
arg 1 -> ms stallInterval

returns {resetJobId1, resetJobId2, ...}

workers are responsible for removing their jobId from the stalling set every stallInterval ms
if a jobId is not removed from the stalling set within a stallInterval window,
we assume the job has stalled and should be reset (moved from active back to waiting)
--]]

-- It isn't clear what this value should be, it depends on memory available for the stack.
-- This seems a reasonable limit.
local maxUnpack = 1024

-- try to update the stallBlock key
if not redis.call("set", KEYS[1], "1", "PX", tonumber(ARGV[1]), "NX") then
  -- hasn't been long enough (stallInterval) since last check
  return {}
end

-- reset any stalling jobs by moving from active to waiting
local stalling, stalled = redis.call("smembers", KEYS[2]), {}
if next(stalling) ~= nil then
  -- not worth optimizing - this should be a rare occurrence, better to keep it straightforward
  for i, jobId in ipairs(stalling) do
    local removed = redis.call("lrem", KEYS[4], 0, jobId)
    -- safety belts: we only restart stalled jobs if we can find them in the active list
    -- the only place we add jobs to the stalling set is in this script, and the two places we
    -- remove jobs from the active list are in this script, and in the MULTI after the job finishes
    if removed > 0 then
      stalled[#stalled + 1] = jobId
    end
  end
  
  -- lpush instead of rpush so that jobs which cause uncaught exceptions don't
  -- hog the job consumers and starve the whole system. not a great situation
  -- to be in, but this is fairer.
  local pushed = 0
  local nStalled = #stalled
  -- don't lpush zero jobs (the redis command will fail)
  while pushed < nStalled do
    redis.call("lpush", KEYS[3], unpack(stalled, pushed + 1, math.min(pushed + maxUnpack, nStalled)))
    pushed = pushed + maxUnpack
  end
  redis.call("del", KEYS[2])
end

-- copy currently active jobs into stalling set
local actives, added = redis.call("lrange", KEYS[4], 0, -1), 0
local nActives = #actives
while added < nActives do
  redis.call("sadd", KEYS[2], unpack(actives, added + 1, math.min(added + maxUnpack, nActives)))
  added = added + maxUnpack
end

return stalled
`});var P=c((Ie,oe)=>{oe.exports=`--[[
key 1 -> bq:name:delayed
key 2 -> bq:name:waiting
arg 1 -> ms timestamp ("now")
arg 2 -> debounce window (in milliseconds)

returns number of jobs raised and the timestamp of the next job (within the near-term window)
--]]

local now = tonumber(ARGV[1])

-- raise any delayed jobs that are now valid by moving from delayed to waiting
local offset = 0
-- There is a default 1024 element restriction
local count = 1000
while true do
  local raising = redis.call("zrangebyscore", KEYS[1], 0, ARGV[1], 'LIMIT', offset, count)
  local numRaising = #raising
  offset = offset + numRaising

  if numRaising > 0 then
    redis.call("lpush", KEYS[2], unpack(raising))
  else
    break
  end
end
redis.call("zremrangebyscore", KEYS[1], 0, ARGV[1])

local head = redis.call("zrange", KEYS[1], 0, 0, "WITHSCORES")
local nearTerm = -1
if next(head) ~= nil then
  local proximal = redis.call("zrevrangebyscore", KEYS[1], head[2] + tonumber(ARGV[2]), 0, "WITHSCORES", "LIMIT", 0, 1)
  nearTerm = proximal[2]
end

return {offset, nearTerm}`});var Y=c((qe,le)=>{le.exports=`--[[
key 1 -> bq:test:succeeded
key 2 -> bq:test:failed
key 3 -> bq:test:waiting
key 4 -> bq:test:active
key 5 -> bq:test:stalling
key 6 -> bq:test:jobs
key 7 -> bq:test:delayed
arg 1 -> jobId
]]

local jobId = ARGV[1]

if (redis.call("sismember", KEYS[1], jobId) + redis.call("sismember", KEYS[2], jobId)) == 0 then
  redis.call("lrem", KEYS[3], 0, jobId)
  redis.call("lrem", KEYS[4], 0, jobId)
end

redis.call("srem", KEYS[1], jobId)
redis.call("srem", KEYS[2], jobId)
redis.call("srem", KEYS[5], jobId)
redis.call("hdel", KEYS[6], jobId)
redis.call("zrem", KEYS[7], jobId)
`});var F=c((je,N)=>{"use strict";var he=require("node:crypto"),O={addDelayedJob:D(),addJob:A(),checkStalledJobs:R(),raiseDelayedJobs:P(),removeJob:Y()},k={},p={};function ce(n,e){k[n]=e;let t=he.createHash("sha1");t.update(e),p[n]=t.digest("hex")}function de(){for(var n in O)ce(n,O[n])}async function ue(n,e){var t=await new Promise((i,s)=>{n.script("exists",p[e],i)});t===null&&await new Promise((i,s)=>{n.script("load",k[e],i)})}async function fe(n){return de(),Promise.all(Object.keys(p).map(e=>ue(n,e)))}N.exports={scripts:k,shas:p,buildCache:fe}});var G=c((Ce,z)=>{"use strict";var g=new Map;g.set("immediate",()=>0);g.set("fixed",n=>n.options.backoff.delay);g.set("exponential",n=>{let e=n.options.backoff,t=e.delay;return e.delay*=2,t});z.exports=g});var V=c((Te,M)=>{"use strict";var me=require("node:events").EventEmitter,v=class extends me{constructor(e){if(super(),!Number.isSafeInteger(e)||e<=0)throw new Error("maximum delay must be a positive integer");this._maxDelay=e,this._nextTime=null,this._timer=null,this._stopped=!1,this._boundTrigger=this._trigger.bind(this)}schedule(e){if(this._stopped)return;let t=Date.now();if(e<0||e==null||isNaN(e))e=t+this._maxDelay;else{if(e<=t)return this._schedule(t+this._maxDelay),this.emit("trigger");e=Math.min(e,t+this._maxDelay)}(!this._timer||e<this._nextTime)&&this._schedule(e)}stop(){this._stop(),this._stopped=!0}_stop(){this._timer&&(clearTimeout(this._timer),this._nextTime=null,this._timer=null)}_schedule(e){let t=e-Date.now();this._stop(),this._nextTime=e,this._timer=setTimeout(this._boundTrigger,t)}_trigger(){let e=Date.now(),t=this._nextTime-e;if(t>0){this._timer=setTimeout(this._boundTrigger,t);return}this._schedule(e+this._maxDelay),this.emit("trigger")}};M.exports=v});var B=c((Je,U)=>{"use strict";var b=q(),ye=require("node:events").EventEmitter,_=T(),y=x(),W=F(),h=w(),be=G(),pe=V(),S=class extends ye{constructor(e,t={}){super(),this.name=e,this.paused=!1,this.jobs=new Map,this.activeJobs=new Set,this.checkTimer=null,this.backoffStrategies=new Map(be),this._closed=null,this._isClosed=!1,this._emitError=i=>void this.emit("error",i),this._emitErrorAfterTick=i=>void process.nextTick(()=>this.emit("error",i)),this.client=null,this.bclient=null,this.eclient=null,this.settings={redis:t.redis||{},quitCommandClient:t.quitCommandClient,keyPrefix:(t.prefix||y.prefix)+":"+this.name+":",autoConnect:h.bool(t.autoConnect,!0)},this._isReady=!1,this._ready=!1;for(let i in y){let s=y[i],r=t[i],a=typeof s;a==="boolean"?this.settings[i]=typeof r=="boolean"?r:s:a==="number"&&(this.settings[i]=Number.isSafeInteger(r)?r:s)}this.settings.redis.socket&&(this.settings.redis=Object.assign({},this.settings.redis,{path:this.settings.redis.socket})),typeof this.settings.quitCommandClient!="boolean"&&(this.settings.quitCommandClient=!b.isClient(this.settings.redis)),this._delayedTimer=this.settings.activateDelayedJobs?new pe(this.settings.nearTermWindow):null,this._delayedTimer&&this._delayedTimer.on("trigger",this._activateDelayed.bind(this)),this.settings.autoConnect&&this.connect()}makeClient(e,t){return b.createClient(this.settings.redis,t).then(i=>(i.on("error",this._emitError),this[e]=i))}connect(){return new Promise((e,t)=>{try{if(this._isReady)return e(this._isReady);let s=(()=>this.settings.getEvents||this.settings.activateDelayedJobs?this.makeClient("eclient",!0).then(()=>{this.eclient.on("message",this._onMessage.bind(this));let r=[];return this.settings.getEvents&&r.push(this.toKey("events")),this.settings.activateDelayedJobs&&r.push(this.toKey("earlierDelayed")),Promise.all(r.map(a=>h.callAsync(l=>this.eclient.subscribe(a,l))))}):null)();this._ready=Promise.all([this.makeClient("client",!1),this.settings.isWorker?this.makeClient("bclient",!0):null,s]).then(()=>{if(this.settings.ensureScripts)return W.buildCache(this.client)}).then(()=>(this._isReady=!0,setImmediate(()=>this.emit("ready")),e(this._isReady),this))}catch(i){t(i)}})}_onMessage(e,t){if(e===this.toKey("earlierDelayed")){this._delayedTimer.schedule(parseInt(t,10));return}t=JSON.parse(t),(t.event==="failed"||t.event==="retrying")&&(t.data=new Error(t.data)),this.emit("job "+t.event,t.id,t.data);let i=this.jobs.get(t.id);i&&(t.event==="progress"?i.progress=t.data:t.event==="retrying"&&(i.options.retries-=1),i.emit(t.event,t.data),(t.event==="succeeded"||t.event==="failed")&&this.jobs.delete(t.id))}isRunning(){return!this.paused}ready(e){return e&&h.asCallback(this._ready.then(()=>{}),e),this._ready}_commandable(e){return(e?this.paused:this._isClosed)?Promise.reject(new Error("closed")):this._isReady?Promise.resolve(e?this.bclient:this.client):this._ready.then(()=>this._commandable(e))}close(e,t){if(typeof e=="function"?(t=e,e=y["#close"].timeout):(!Number.isSafeInteger(e)||e<=0)&&(e=y["#close"].timeout),this.paused)return t&&h.asCallback(this._closed,t),this._closed;this.paused=!0,this.checkTimer&&(clearTimeout(this.checkTimer),this.checkTimer=null),this._delayedTimer&&this._delayedTimer.stop();let i=()=>h.finallyRejectsWithInitial(this._ready,()=>(this.settings.isWorker&&b.disconnect(this.bclient),Promise.all(Array.from(this.activeJobs,a=>a.catch(()=>{}))).then(()=>{}))),s=()=>{this._isClosed=!0;let a=[];return this.client&&(this.settings.quitCommandClient?a.push(this.client):this.client.removeListener("error",this._emitError)),this.eclient&&a.push(this.eclient),Promise.all(a.map(l=>h.callAsync(o=>l.quit(o))))},r=h.finallyRejectsWithInitial(h.withTimeout(i(),e),()=>s());return this._closed=r,t&&h.asCallback(r,t),r}destroy(e){let t=this._commandable().then(i=>{let s=h.deferred(),r=["id","jobs","stallBlock","stalling","waiting","active","succeeded","failed","delayed"].map(a=>this.toKey(a));return r.push(s.defer()),i.del.apply(i,r),s});return e&&h.asCallback(t,e),t}checkHealth(e){let t=this._commandable().then(i=>h.callAsync(s=>i.multi().llen(this.toKey("waiting")).llen(this.toKey("active")).scard(this.toKey("succeeded")).scard(this.toKey("failed")).zcard(this.toKey("delayed")).get(this.toKey("id")).exec(s))).then(i=>({waiting:i[0],active:i[1],succeeded:i[2],failed:i[3],delayed:i[4],newestJob:i[5]?parseInt(i[5],10):0}));return e&&h.asCallback(t,e),t}_scanForJobs(e,t,i,s,r){let a=Math.min(i,this.settings.redisScanCount);this.client.sscan(e,t,"COUNT",a,(l,o)=>{if(l)return r(l);let d=o[0],H=o[1];for(let L of H){if(s.size===i)break;s.add(L)}if(d==="0"||s.size>=i)return r(null,s);this._scanForJobs(e,d,i,s,r)})}_addJobsByIds(e,t){return this._commandable().then(i=>{let s=h.deferred(),r=[this.toKey("jobs")].concat(t,s.defer());return i.hmget.apply(i,r),s}).then(i=>{let s=t.length;for(let r=0;r<s;++r){let a=i[r];a&&e.push(_.fromData(this,t[r],a))}return e})}getJobs(e,t,i){typeof t=="function"&&(i=t,t=null),t=Object.assign({size:100,start:0,end:100},t);let s=this._commandable().then(r=>{let a=h.deferred(),l=a.defer(),o=this.toKey(e);switch(e){case"failed":case"succeeded":this._scanForJobs(o,"0",t.size,new Set,l);break;case"waiting":case"active":r.lrange(o,t.start,t.end,l);break;case"delayed":r.zrange(o,t.start,t.end,l);break;default:throw new Error("Improper queue type")}return a}).then(r=>{let a=[],l=[];for(let o of r){let d=this.jobs.get(o);d?a.push(d):l.push(o)}return l.length?this._addJobsByIds(a,l):a});return i&&h.asCallback(s,i),s}createJob(e){return new _(this,null,e)}getJob(e,t){let i=this._commandable().then(()=>this.jobs.has(e)?this.jobs.get(e):_.fromId(this,e)).then(s=>(s&&this.settings.storeJobs&&this.jobs.set(e,s),s));return t&&h.asCallback(i,t),i}removeJob(e,t){let i=this._evalScript("removeJob",7,this.toKey("succeeded"),this.toKey("failed"),this.toKey("waiting"),this.toKey("active"),this.toKey("stalling"),this.toKey("jobs"),this.toKey("delayed"),e).then(()=>(this.settings.storeJobs&&this.jobs.delete(e),this));return t&&h.asCallback(i,t),i}_waitForJob(){return h.callAsync(e=>this.bclient.brpoplpush(this.toKey("waiting"),this.toKey("active"),0,e)).then(e=>_.fromId(this,e),e=>b.isAbortError(e)&&this.paused?null:(this.emit("error",e),this._redisFailureRetryDelay=this._redisFailureRetryDelay?this._redisFailureRetryDelay*2:this.settings.initialRedisFailureRetryDelay,h.delay(this._redisFailureRetryDelay).then(()=>this._waitForJob())))}_getNextJob(){return this._redisFailureRetryDelay=0,this._commandable(!0).then(()=>this._waitForJob())}_runJob(e){let t=null,i=!1,s=()=>{t=null,!this._isClosed&&this._preventStall(e.id).catch(this._emitErrorAfterTick).finally(()=>{if(i||this._isClosed)return;let o=this.settings.stallInterval/2;t=setTimeout(s,o)})};s();let r=(o,d)=>(i=!0,t&&(clearTimeout(t),t=null),this._finishJob(o,d,e)),a=this.handler(e);if(e.options.timeout){let o=`Job ${e.id} timed out (${e.options.timeout} ms)`;a=h.withTimeout(a,e.options.timeout,o)}let l=a.then(o=>r(null,o),r).finally(()=>{this.activeJobs.delete(l)});return this.activeJobs.add(l),l}_preventStall(e){return h.callAsync(t=>this.client.srem(this.toKey("stalling"),e,t))}_finishJob(e,t,i){if(this._isClosed){let o=e?"failed":"succeeded";throw new Error(`unable to update the status of ${o} job ${i.id}`)}let s=this.client.multi().lrem(this.toKey("active"),0,i.id).srem(this.toKey("stalling"),i.id),r=e?i.computeDelay():-1,a=e?r>=0?"retrying":"failed":"succeeded";if(i.status=a,e){let o=e.stack||e.message||e;i.options.stacktraces.unshift(o)}switch(a){case"failed":this.settings.removeOnFailure?s.hdel(this.toKey("jobs"),i.id):(s.hset(this.toKey("jobs"),i.id,i.toData()),s.sadd(this.toKey("failed"),i.id));break;case"retrying":if(--i.options.retries,s.hset(this.toKey("jobs"),i.id,i.toData()),r===0)s.lpush(this.toKey("waiting"),i.id);else{let o=Date.now()+r;s.zadd(this.toKey("delayed"),o,i.id).publish(this.toKey("earlierDelayed"),o)}break;case"succeeded":this.settings.removeOnSuccess?s.hdel(this.toKey("jobs"),i.id):(s.hset(this.toKey("jobs"),i.id,i.toData()),s.sadd(this.toKey("succeeded"),i.id));break}this.settings.sendEvents&&s.publish(this.toKey("events"),JSON.stringify({id:i.id,event:a,data:e?e.message:t}));let l=e||t;return h.callAsync(o=>s.exec(o)).then(()=>[a,l])}process(e,t){if(!this.settings.isWorker)throw new Error("Cannot call Queue#process on a non-worker");if(this.handler)throw new Error("Cannot call Queue#process twice");if(this.paused)throw new Error("closed");typeof e=="function"&&(t=e,e=y["#process"].concurrency);let i=!0;this.handler=h.wrapAsync(t,i),this.running=0,this.queued=1,this.concurrency=e;let s=()=>{if(this.paused){this.queued-=1;return}this._getNextJob().then(r=>{if(this.paused){this.queued-=1;return}if(this.running+=1,this.queued-=1,this.running+this.queued<this.concurrency&&(this.queued+=1,setImmediate(s)),!!r)return this._runJob(r).then(a=>{if(this.running-=1,this.queued+=1,a){let l=a[0],o=a[1];this.emit(l,r,o);let d=l==="retrying"?"failed":l==="failed"?"failed:fatal":null;d&&this.emit(d,r,o)}},this._emitErrorAfterTick)}).catch(this._emitErrorAfterTick).finally(()=>setImmediate(s))};return this._doStalledJobCheck().then(s).catch(this._emitErrorAfterTick),this._activateDelayed(),this}_doStalledJobCheck(){return this._evalScript("checkStalledJobs",4,this.toKey("stallBlock"),this.toKey("stalling"),this.toKey("waiting"),this.toKey("active"),this.settings.stallInterval).then(e=>{for(let t of e)this.emit("stalled",t);return e.length})}_safeCheckStalledJobs(e,t){let i=this._checkStalledJobs(e,t);t||i.catch(this._emitErrorAfterTick)}_scheduleStalledCheck(e,t){this.checkTimer||this.paused||(this.checkTimer=setTimeout(()=>{this.checkTimer=null,this._safeCheckStalledJobs(e,t)},e))}_checkStalledJobs(e,t){let i=this._doStalledJobCheck();return t&&h.asCallback(i,t),e&&!this.checkTimer?i.finally(()=>{try{this._scheduleStalledCheck(e,t)}catch(s){this._emitErrorAfterTick(s)}}):i}checkStalledJobs(e,t){return typeof e=="function"?(t=e,e=null):Number.isSafeInteger(e)||(e=null),this._checkStalledJobs(e,t)}saveAll(e){return this._commandable().then(t=>{let i=t.batch(),s=new Map;for(let r of e)try{r._save(a=>this._evalScriptOn(i,a)).catch(a=>void s.set(r,a))}catch(a){s.set(r,a)}return h.callAsync(r=>i.exec(r)).then(()=>s)})}_activateDelayed(){!this.settings.activateDelayedJobs||this._evalScript("raiseDelayedJobs",2,this.toKey("delayed"),this.toKey("waiting"),Date.now(),this.settings.delayedDebounce).then(e=>{let t=e[0],i=e[1];t&&this.emit("raised jobs",t),this._delayedTimer.schedule(parseInt(i,10))},e=>{if(b.isAbortError(e))return this.paused?void 0:this._activateDelayed();this._emitErrorAfterTick(e)})}toKey(e){return this.settings.keyPrefix+e}_evalScriptOn(e,t){return t[0]=W.shas[t[0]],h.callAsync(i=>{t.push(i),e.evalsha.apply(e,t)})}_evalScript(){let e=Array.from(arguments);return this._commandable().then(t=>this._evalScriptOn(t,e))}};U.exports=S});module.exports=B();
