const User=require('../models/User');
const listedDealer=require('../models/listedDealer');
const {calculate}=require('./calculator');
const {retrieve}=require('./knowledge');
async function findDealers(location) {
 if(typeof location!=='string'||!location.trim()||location.length>120) throw new Error('A city, state, or pincode is required.');
 const text=location.trim(), escaped=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const regex=new RegExp('^'+escaped,'i');
 const results=await User.find({...listedDealer(),$and:[{$or:[{city:regex},{area:regex},{state:regex},{pincode:text}]}]})
 .select('companyName city area state pincode perKgPrice').sort({createdAt:-1}).limit(5).maxTimeMS(4000);
 return results.map(d=>({id:String(d._id),name:d.companyName||'Workshop',city:d.city,area:d.area,state:d.state,pincode:d.pincode,rate:d.perKgPrice,url:`/dealer/${d._id}`}));
}
async function execute(name,args) {
 if(!args||typeof args!=='object'||Array.isArray(args)) throw new Error('Invalid tool arguments.');
 if(name==='search_knowledge') return {documents:retrieve(args.query)};
 if(name==='find_dealers') return {dealers:await findDealers(args.location)};
 if(name==='calculate_estimate') {
  // Validate inputs before touching the database.
  calculate(args);
  if(typeof args.location!=='string'||!args.location.trim()||args.location.length>120)throw new Error('Please provide your city or pincode.');
  let dealers=[],unavailable=false;
  try {dealers=await findDealers(args.location);} catch {unavailable=true;}
  const dealer=dealers.find(d=>Number.isFinite(d.rate)&&d.rate>0);
  return {...calculate(args,dealer?.rate||95),dealer:dealer||null,rateSource:dealer?'Listed dealer rate':'Indicative fallback rate, not a local market quote',directoryUnavailable:unavailable,location:args.location};
 }
 if(name==='prepare_inquiry') {
  calculate(args);
  if(typeof args.location!=='string'||!args.location.trim()||args.location.length>120)throw new Error('Please provide your city or pincode.');
  return {draft:{width:String(args.width),height:String(args.height),unit:args.unit==='feet'?'Feet':'Inches',shutterType:{manual:'Manual',gear:'Gear',motorized:'Motorized'}[args.shutterType],message:`Shutter inquiry for ${args.location.trim()}. Please confirm site measurements, final pricing, GST, installation and freight.`},submitted:false};
 }
 throw new Error('Unknown tool.');
}
const dimensions={width:{type:'NUMBER'},height:{type:'NUMBER'},unit:{type:'STRING',enum:['feet','inches']},shutterType:{type:'STRING',enum:['manual','gear','motorized']},location:{type:'STRING',description:'Customer city, state or pincode; ask if missing.'}};
const declarations=[
 {name:'search_knowledge',description:'Retrieve approved website information for product, material, measurement, installation and maintenance questions.',parameters:{type:'OBJECT',properties:{query:{type:'STRING'}},required:['query']}},
 {name:'find_dealers',description:'Search the current public workshop directory by city, state or pincode.',parameters:{type:'OBJECT',properties:{location:{type:'STRING'}},required:['location']}},
 {name:'calculate_estimate',description:'Calculate indicative shutter weight and a full price breakdown using a listed local dealer rate if available. Required for every numerical quotation. For comparisons call once per shutter type.',parameters:{type:'OBJECT',properties:dimensions,required:Object.keys(dimensions)}},
 {name:'prepare_inquiry',description:'Prepare a contact-form draft for customer review. Does not submit or contact anyone. Only use when the customer asks to prepare an inquiry.',parameters:{type:'OBJECT',properties:dimensions,required:Object.keys(dimensions)}}
];
module.exports={execute,declarations,findDealers};
