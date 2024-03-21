
const { boolean, array } = require('joi')
const mongoose = require('mongoose')


const SelectedServicesSchema = new mongoose.Schema({
    id:{
        type: String
    },
    customer:{
        type: String,
        required:[true, 'Please provide a customer'],
    },
    customer_email:{
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please Provide valid email'
        ]
    },
    customer_phone:{
        type: String,
        required: [true, 'Please provide phone number'],
        match: [
            /^\+?\d{1,4}\d{10}$/,
            'Please Provide valid Phone Number (Phone number must be in form +4491222... or 091222...)'
        ]
    },
    customer_address:{
        type: String,
        required: [true, 'Please provide an adress'],
        maxlength: 5000,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // serviceId:{
    //     type: String,
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: [true, 'Make sure to add a service'],
    // },
    service:{
        type: String,
        required: [true, 'Make sure to add a service'],
    },
    price: {
        type: Number,
        default: 0
    },
    paid:{
        type:Boolean,
        default: false
    },
    receipt_url: {
        type: String
      },
    date_of_service: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Please provide a scheduled date'],
    },
    reviews:{
        type: Number
    }

    



}, {timestamps: true})

module.exports = mongoose.model('SelectedServices',SelectedServicesSchema)