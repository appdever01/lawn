
const { boolean, array } = require('joi')
const mongoose = require('mongoose')

//user service selection
const ServicesSchema = new mongoose.Schema({
    
    service:{
        type: String,
        required: [true, 'Make sure to add a service name'],
        unique: true,
        maxlength: 2500,
    },
    bio:{
        type: String,
        required: [true, 'Make sure to add a bio'],
        maxlength: 5500,
    },
    pic_originalname: {
        type: String,
        required: [true, 'Please provide a picture'],
    },
    pic_path:{
        type: String,
        required: [true, 'Please provide a picture']
    },


}, {timestamps: true})

module.exports = mongoose.model('Services',ServicesSchema)