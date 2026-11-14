const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calculate}=require('../src/chat/calculator');
const {retrieve}=require('../src/chat/knowledge');
const {execute}=require('../src/chat/tools');
const {chat}=require('../src/chat/service');
const User=require('../src/models/User');

test('shared estimates convert inches and include all component charges',()=>{
 const feet=calculate({width:12,height:10,unit:'feet',shutterType:'motorized'},100);
 assert.equal(feet.totalSqFt,120);assert.equal(feet.totalWeight,312);assert.equal(feet.estimatedPrice,31200);assert.equal(feet.total,61900);
 assert.deepEqual(calculate({width:144,height:120,unit:'inches',shutterType:'motorized'},100),feet);
 assert.equal(calculate({width:10,height:10,unit:'feet',shutterType:'gear'}).total,30400);
 for(const patch of [{width:-1},{height:Infinity},{unit:'metres'},{shutterType:'unknown'}])assert.throws(()=>calculate({width:10,height:10,unit:'feet',shutterType:'manual',...patch}));
});
test('retrieval matches English and Hindi queries and returns public sources',()=>{
 assert.ok(retrieve('manual shutter compare').some(d=>d.id==='products'));
 assert.ok(retrieve('शटर कीमत वजन').some(d=>d.id==='estimates'));
 assert.equal(retrieve('unrelatedxyz').length,0);
});
test('dealer estimate uses only projected public directory data and falls back honestly',async()=>{
 const original=User.find;
 let projection;
 User.find=()=>({select(fields){projection=fields;return this;},sort(){return this;},limit(){return this;},maxTimeMS:async()=>[{_id:'abc',companyName:'Local workshop',perKgPrice:110,city:'Bareilly'}]});
 try {
  const args={width:10,height:10,unit:'feet',shutterType:'manual',location:'Bareilly'};
  await assert.rejects(()=>execute('calculate_estimate',{...args,location:undefined}));
  const result=await execute('calculate_estimate',args);
  assert.equal(result.appliedRate,110);assert.equal(result.dealer.url,'/dealer/abc');assert.ok(!projection.includes('password'));assert.ok(!projection.includes('phone'));
  User.find=()=>{throw Error('database unavailable');};
  const fallback=await execute('calculate_estimate',args);assert.equal(fallback.appliedRate,95);assert.equal(fallback.directoryUnavailable,true);assert.match(fallback.rateSource,/fallback/);
  const draft=await execute('prepare_inquiry',args);assert.equal(draft.submitted,false);assert.equal(draft.draft.unit,'Feet');assert.equal(draft.draft.phone,undefined);
  await assert.rejects(()=>execute('prepare_inquiry',{...args,location:''}));
 } finally {User.find=original;}
});
test('Gemini tool loop preserves signatures, returns calculations and hides credentials',async()=>{
 const previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-key';
 const requests=[];let calls=0;
 try{
  const result=await chat('12 by 10 feet manual in Bareilly',[],{request:async(url,options)=>{
   requests.push({url,options,body:JSON.parse(options.body)});
   if(calls++===0)return Response.json({candidates:[{content:{role:'model',parts:[{thoughtSignature:'signature',functionCall:{name:'calculate_estimate',args:{width:12,height:10,unit:'feet',shutterType:'manual',location:'Bareilly'}}}]}}]});
   return Response.json({candidates:[{content:{role:'model',parts:[{text:'Here is your approximate estimate.'}]}}]});
  },runTool:async()=>({...calculate({width:12,height:10,unit:'feet',shutterType:'manual'}),rateSource:'Indicative fallback',dealer:null})});
  assert.equal(result.estimates.length,1);assert.equal(requests.length,2);assert.equal(requests[1].body.contents[1].parts[0].thoughtSignature,'signature');
  assert.equal(requests[1].body.contents[2].parts[0].functionResponse.name,'calculate_estimate');assert.ok(result.sources.some(s=>s.url==='/#estimator'));assert.ok(!JSON.stringify(result).includes('test-key'));
 }finally{if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
test('missing configuration and provider errors produce actionable failures',async()=>{
 const previous=process.env.GEMINI_API_KEY;
 try{
  delete process.env.GEMINI_API_KEY;await assert.rejects(()=>chat('hello'),e=>e.status===503);
  process.env.GEMINI_API_KEY='test';await assert.rejects(()=>chat('hello',[],{request:async()=>new Response('',{status:429})}),e=>e.status===429);
 }finally{if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
