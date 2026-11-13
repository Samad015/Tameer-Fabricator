const nodemailer=require('nodemailer');
let transport;
module.exports=async function sendEmail({toEmail,toName,subject,htmlContent}){
 if(!toEmail || !process.env.EMAIL_USER)return false;
 try{
  if(process.env.SMTP_HOST){
   transport ||= nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,socketTimeout:10000});
   await transport.sendMail({from:{name:'Tameer Fabricators',address:process.env.EMAIL_USER},to:{name:toName||'Recipient',address:toEmail},subject,html:htmlContent});
  }else if(process.env.BREVO_API_KEY){
   const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','api-key':process.env.BREVO_API_KEY},body:JSON.stringify({sender:{name:'Tameer Fabricators',email:process.env.EMAIL_USER},to:[{email:toEmail,name:toName||'Recipient'}],subject,htmlContent})});
   if(!response.ok)throw new Error('Email rejected');
  }else return false;
  return true;
 }catch{console.error('Transactional email delivery failed');return false;}
};
