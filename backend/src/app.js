const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const app = express();
const {security,limit} = require('./middleware/security');
const mongoose = require('mongoose');
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY || 0));

const origins=(process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080').split(',').map(s=>s.trim());
app.use(cors({origin(origin,cb){cb(null,!origin || origins.includes(origin));},credentials:true,methods:['GET','POST','PUT','DELETE','OPTIONS']}));
app.use(express.json({limit:'32kb'}));
app.use(security);
app.use('/api',limit());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({status:mongoose.connection.readyState === 1 ? 'OK':'unavailable'});
});

// Authentication & Dealer Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', require('./routes/locationRoutes'));

app.use('/api/dealers', require('./routes/dealerRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.post('/api/notify-click', (req,res) => res.status(202).json({success:true}));

// Serve Static Frontend Files in Production (Render Monorepo or Combined Setup)
if (process.env.NODE_ENV === 'production') {
  const possiblePaths = [
    path.join(__dirname, '../../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    path.join(__dirname, 'frontend/dist')
  ];

  const frontendPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  app.use(express.static(frontendPath));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
    else res.status(404).send('Frontend build not found.');
  });
}

app.use('/api', (req,res)=>res.status(404).json({success:false,message:'API endpoint not found.'}));
app.use((error,req,res,next)=>{
  if(res.headersSent) return next(error);
  const status=error.code===11000?409:(error.name==='ValidationError'||error.name==='CastError'||error.type==='entity.parse.failed'?400:error.status||500);
  res.status(status).json({success:false,message:status===500?'An unexpected error occurred. Please try again.':status===409?'This account already exists.':'Invalid request. Please check your details.'});
});
module.exports = app;
