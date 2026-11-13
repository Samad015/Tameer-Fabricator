const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    width: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: 'Feet'
    },
    shutterType: {
      type: String,
      default: 'Manual'
    },
    message: {
      type: String,
      maxlength: 2000,
      default: ''
    },
    location: {city:{type:String,maxlength:120},state:{type:String,maxlength:120},pincode:{type:String,maxlength:6},latitude:{type:Number,min:-90,max:90},longitude:{type:Number,min:-180,max:180},accuracy:{type:Number,min:0},source:{type:String,enum:['gps','manual']},capturedAt:Date},
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);