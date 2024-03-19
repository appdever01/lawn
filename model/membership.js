const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  user:{
    type: mongoose.Schema.ObjectId,
    required: true
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