const router=require('express').Router();
const {limit}=require('../middleware/security');
const {chat}=require('../chat/service');
const {calculate}=require('../chat/calculator');

router.post('/estimate',(req,res)=>{
 try{return res.json({success:true,result:calculate(req.body,req.body.rate??95)});}catch(error){return res.status(400).json({success:false,message:error.message});}
});
router.post('/',limit(15,60000),async(req,res)=>{
 const {message,history:raw='[]'}=req.body;
 if(typeof message!=='string'||!message.trim()||message.length>2000||typeof raw!=='string'||raw.length>18000)return res.status(400).json({success:false,message:'Please keep your message under 2,000 characters.'});
 let history;
 try{history=JSON.parse(raw);if(!Array.isArray(history)||history.length>12||history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.text!=='string'||!m.text.trim()||m.text.length>4000))throw Error();}catch{return res.status(400).json({success:false,message:'Invalid chat history. Please start a new conversation.'});}
 try{return res.json({success:true,...await chat(message.trim(),history)});}catch(error){return res.status(error.status||502).json({success:false,message:error.status?error.message:'The assistant could not answer. Please try again or request a callback.'});}
});
module.exports=router;
