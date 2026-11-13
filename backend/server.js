require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5001;

async function start(){
  if(!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length<32) throw new Error('MONGO_URI and a JWT_SECRET of at least 32 characters are required.');
  if(process.env.NODE_ENV==='production' && (!process.env.CORS_ORIGINS || process.env.CORS_ORIGINS.includes('*'))) throw new Error('Explicit CORS_ORIGINS are required in production.');
  if(process.env.NODE_ENV==='production' && (!process.env.EMAIL_USER || (!process.env.BREVO_API_KEY && !process.env.SMTP_HOST))) throw new Error('Production verification requires EMAIL_USER and BREVO_API_KEY.');
  await connectDB();
  const server=app.listen(PORT,()=>console.log(`Server listening on ${PORT}`));
  const shutdown=()=>{server.close(async()=>{await mongoose.disconnect();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();};
  process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}
if(require.main===module) start().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports=app;
