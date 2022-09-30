const mongoose = require('mongoose');
const VehicleOwner = require('../models/vehicleOwnerModel')
const Admin = require('../models/adminModel');
const Manager = require('../models/fuelStationManagerModal')
const PumpOperator = require('../models/pumpOperatorModel');
const {generateOTP}  = require('../services/otp');
const {sendRegOtpMail} = require('../services/mail/reg_otp_mail');
const {sendRegSuccessMail} = require('../services/mail/reg_success_mail');
const {sendLoginOtpMail} = require('../services/mail/login_otp_mail');
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

// functions 

let generated_otp
let entered_email 
// Check already exisiting email
const handleEmailExistance = async (req, res) => {
    console.log('insideemailexistence')
    const { email } = req.body;
    entered_email = email
    try {
        const result = await VehicleOwner.findOne({ email });
        if (result) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            generated_otp = generateOTP();
            // OTP reset after 1min timeout
            // setTimeout(() => {
            //     generated_otp = null
            // }, 60000)
            const mail_status = await sendRegOtpMail({ to: entered_email, OTP: generated_otp });
            console.log(mail_status)
            res.status(200).json({ result: 'Sent' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleRegister = async (req, res) => {
    const { NIC, email, entered_otp, firstName, lastName } = req.body
    console.log(entered_otp, generated_otp)
    
    if(entered_email === email){
        // OTP check
        if (entered_otp === generated_otp) {
            // Data validation
                // ................
        
            //Enter to database
            try {
                const vehicleOwner = await VehicleOwner.create({ NIC, email, firstName, lastName })
                const mail_status = await sendRegSuccessMail({ to: entered_email });
                console.log(mail_status)
                res.status(200).json(vehicleOwner)
            } catch (error) {
                res.status(400).json({ error: error.message })
            }
        } else {
            res.status(200).json({ error: 'Invalid OTP' })
        }
    } else{
        res.status(200).json({ error: 'Email mismatch' })
    }


}

const handleLoginVehicleOwner = async (req, res) => {
    const { email } = req.body;
    entered_email = email
    // email validation
        // ................

    // Find email in database
    try {
        const result = await VehicleOwner.findOne({ email });
        if(result){
            generated_otp = generateOTP();
            const mail_status = await sendLoginOtpMail({ to: email, OTP: generated_otp });
            //console.log(mail_status)
            res.status(200).json({result:'OTP sent', generated_otp});
        } else{
            res.status(400).json({ error: 'Email not found' })
        }
       
    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}

const handleLoginAfterOTP = async (req, res) => {
    const { entered_otp} = req.body
        // OTP check
        if (entered_otp === generated_otp) {
            try {
                const result = await VehicleOwner.findOne({ entered_email });
                res.status(200).json(result)
            } catch (error) {
                res.status(400).json({ error: error.message })
            }
        } else {
            res.status(400).json({ error: 'Invalid OTP' })
        }
}

const handleLoginFuelStation = async (req, res) => {
    const { id } = req.body;

    // Input id validation
        // ................

    // Find id in database

}

const handleAdminLogin = async (req, res) => {
    const {email, password} = req.body

    try {
      const result = await Admin.login(email, password)
  
      if(!result.error){
        const token = createToken(result._id)
        res.status(200).json({email, token, result: 'Logged in'})
      } else{
        res.status(200).json({error: result.error})
      }

    } catch (error) {
      res.status(400).json({error: error.message})
    }
}

const handleAdminSignup = async (req, res) => {
    const {email, password} = req.body

    try {
      const user = await Admin.signup(email, password)
  
      res.status(200).json({user})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
}

//-----------------------

const handleManagerLogin = async (req, res) => {
    const {email, password} = req.body

    try {
        const result = await Manager.login(email, password)
    
        if(!result.error){
          const token = createToken(result._id)
          res.status(200).json({email, token, result: 'Logged in'})
        } else{
          res.status(200).json({error: result.error})
        }
  
      } catch (error) {
        res.status(400).json({error: error.message})
      }
}

const handleManagerSignup = async (req, res) => {
    const {firstName, lastName, contactNumber, email, password, fuelStationId } = req.body

    try {
      const user = await Manager.signup(firstName, lastName, contactNumber, email, password, fuelStationId)
  
      res.status(200).json({user})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
}


const handleLogout = async (req, res) => {

}

module.exports = {
    handleEmailExistance,
    handleRegister,
    handleLoginVehicleOwner,
    handleLoginFuelStation,
    handleLogout,
    handleLoginAfterOTP,
    handleAdminLogin,
    handleAdminSignup,
    handleManagerLogin,
    handleManagerSignup
}