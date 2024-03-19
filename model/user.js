const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  fullname:{
    type: String,
    required: [true, 'Please provide a full name'],
    maxlength: 50,
  },
  email:{
    type: String,
    required: [true, 'Please provide email'],
    match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please Provide valid email'
    ],
    unique: true,
},
  password: {
    type: String,
    required: [true, 'Please provide Password'],
  },
  resetToken: {
    type: String,
  },
  phone_number:{
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true,
  },
  address:{
    type: String,
    required: [true, 'Please provide an adress'],
    maxlength: 5000,
  },
  admin: {
    type: Boolean,
    default: false
  },
  blocked:{
    type: Boolean,
    default: false
  },
  gp_membership:{
    type: Boolean,
    default: false
  },
  gp_receipt_url: {
    type: String
  },
  loyalty_points:{
    type: Number,
    default: 0
  },
  legacy_discount:{
    type: Number,
    default: 0
  }

}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);