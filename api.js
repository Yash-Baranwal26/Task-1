const express = require('express')
const mongoose = require('mongoose')
const taskData = require('./taskSchema')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const PORT = 1234;
const app = express()
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/Task-1')
.then(()=>{
    console.log("DB Connected")
}).catch(err=>{console.log(err)});

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: "stranger2copy@gmail.com", //Gmail Address
     pass: "axlt cryx qopc nzds", //Password of gmail (Genrated app password)    
     }
})

app.post('/registeration',async(req,res)=>{
    try{
        const{username,email,password} = req.body

    let send = await taskData.create({
        username:username,
        email:email,
        password:password
    })

    if(send)
        {
            res.status(200).json({"msg":"Data Inserted"})
        }
        else{
            res.status(400).json({"error":"Inavalid argu"})
        }
    } catch(err){
        res.status(500).json({'err':'Internal Server error'})
    }
})

app.post('/login',async(req,res)=>{
    try{
        const{email,password}=req.body;
 
    let login = await taskData.findOne({email:email})

    if(login){
        let cpass = await taskData.findOne({password:password})
        if(cpass){
            res.status(200).json({"msg":"Login Successfully"})
        }
        else{
            res.status(400).json({"error":"Wrong Password"})
        }
}
    else{
        res.status(400).json({"error":"Wrong User"})
    }
    } catch(err){
        res.status(500).json({'err':'Internal Server error'})
    }
})

app.post('/forget-password', async (req,res)=>{
    try{
    const{email} = req.body;

    let user = await taskData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':'User with this email does not exist'})
    }

    const otp = crypto.randomInt(100000,999999).toString();
    user.resetPasswordOTP = otp;
    user.otpExpiry = Date.now() + 3600000; // OTP valid for 1 hr
    await user.save()

    const mailOption = {
        from: '"Yash Baranwal" <stranger2copy@gmail.com>',
        to: email,
        subject: 'Pssword reset OTP',
        text: `Your OTP IS ${otp}`
    }

    transport.sendMail(mailOption, (err,info)=>{
        if(err){
            return res.status(400).json({'err':'Unable to send OTP'})
        } else{
            return res.status(200).json({'msg':'Otp sent Successfully'})
        }
    })

} catch(err){
    res.status(500).json({'err':'Internal Server error'})

}
})

app.post('/verify-otp', async(req,res)=>{
    const {email,otp} = req.body;
    const user = await taskData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':"User with this email does not exist"})
    }
    
    if(user.resetPasswordOTP === otp && user.otpExpiry > Date.now()){
        user.isOTPVerified = true;
        await user.save();
        res.status(200).json({'msg':'OTP Verified'})
    }else{
        res.status(400).json({'err':'Invalid OTP'})
    }

})

app.post('/reset-password',async (req,res)=>{
    const {email, newPassword} = req.body;

    const user = await taskData.findOne({email:email})

    if(!user){
        res.status(400).json({'err':"User with this email does not exist"})
    }

    if(user.isOTPVerified){
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.otpExpiry = undefined;
        user.isOTPVerified = false;
        await user.save();

        res.status(200).json({'msg':'Password reset successfully'})
    } else{
        res.status(400).json({'err':'OTP not verified'})
    }
})



app.listen(PORT, ()=> console.log(`Connection build on port ${PORT}`))
