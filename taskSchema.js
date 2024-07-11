const mongoose = require('mongoose')

const task = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordOTP:{
        type:String,
    },
    otpExpiry:{
        type:Date
    },
    isOTPVerified:{
        type: Boolean,
        default: false
    }
})

const taskData = mongoose.model("task",task)

module.exports = taskData;