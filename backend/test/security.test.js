const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
process.env.JWT_SECRET='test-secret-that-is-longer-than-32-characters';
const User=require('../src/models/User');
const Lead=require('../src/models/Lead');
const jwt=require('jsonwebtoken');
let server,origin;
before(async()=>{server=require('../server').listen(0);await new Promise(r=>server.once('listening',r));origin=`http://127.0.0.1:${server.address().port}`;});
after(()=>server.close());
const post=(path,body,headers={})=>fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('rejects Mongo operator injection before DB access',async()=>{const r=await post('/api/auth/login',{email:{$ne:null},password:'anything'});assert.equal(r.status,400);});
test('rejects untrusted mutating origin',async()=>{const r=await post('/api/contact',{name:'Test User',phone:'9876543210'},{Origin:'https://attacker.example'});assert.equal(r.status,403);});
test('verified account cannot receive a token by resubmitting an OTP',async()=>{const original=User.findOne;User.findOne=async()=>({isVerified:true});try{const r=await post('/api/auth/verify-otp',{email:'test@example.com',otp:'123456'});assert.equal(r.status,400);assert.equal(r.headers.get('set-cookie'),null);}finally{User.findOne=original;}});
test('expired JWT is rejected',async()=>{const token=jwt.sign({id:'123'},process.env.JWT_SECRET,{expiresIn:-1});const r=await fetch(origin+'/api/auth/me',{headers:{Cookie:`tameer_session=${token}`}});assert.equal(r.status,401);});
test('subscription is never activated without verified payments in production',async()=>{const original=User.findById,env=process.env.NODE_ENV;process.env.NODE_ENV='production';User.findById=async()=>({isVerified:true,tokenVersion:0});try{const token=jwt.sign({id:'123'},process.env.JWT_SECRET);const r=await post('/api/auth/subscribe',{}, {Cookie:`tameer_session=${token}`});assert.equal(r.status,503);}finally{User.findById=original;process.env.NODE_ENV=env;}});
test('public user serialization omits secrets and payout fields',()=>{const user=new User({name:'Test',email:'test@example.com',phone:'9876543210',password:'hash',otp:'secret',accountNumber:'123',tokenVersion:2});const data=user.toJSON();for(const key of ['password','otp','accountNumber','tokenVersion'])assert.equal(key in data,false);});
test('invalid dealer IDs return 400 instead of database cast errors',async()=>{assert.equal((await fetch(origin+'/api/dealers/invalid')).status,400);});
test('general callback persists normalized phone without a dealer',async()=>{const original=Lead.prototype.save;let record;Lead.prototype.save=async function(){record=this;return this;};try{const r=await post('/api/contact',{name:'Test User',phone:'+91 98765 43210',location:{city:'Bareilly',source:'manual'}});assert.equal(r.status,200);assert.equal(record.phone,'9876543210');assert.equal(record.dealer,undefined);assert.equal(record.location.city,'Bareilly');}finally{Lead.prototype.save=original;}});
test('location coordinate validation rejects invalid latitude',async()=>{const r=await post('/api/contact',{name:'Test User',phone:'9876543210',location:{latitude:100,longitude:77}});assert.equal(r.status,400);});
test('unknown API endpoints return JSON',async()=>{const r=await fetch(origin+'/api/not-real');assert.equal(r.status,404);assert.equal((await r.json()).success,false);});
test('city lookup uses the default provider when no URL is configured', async (t) => {
  const previous = process.env.GEOCODER_URL;
  delete process.env.GEOCODER_URL;
  t.after(() => {
    if (previous !== undefined) process.env.GEOCODER_URL = previous;
  });
  const request = global.fetch;
  let provider;
  t.mock.method(global, 'fetch', async (url) => {
    provider = url;
    return Response.json({address: {city: 'Bareilly'}});
  });
  const response = await request(origin + '/api/location/reverse?lat=28.367&lon=79.431');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).address.city, 'Bareilly');
  assert.equal(provider.hostname, 'nominatim.openstreetmap.org');
  assert.equal(provider.searchParams.get('lat'), '28.37');
});
