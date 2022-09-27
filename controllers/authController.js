const mongoose = require('mongoose');
const VehicleOwner = require('../models/vehicleOwnerModel')
const Admin = require('../models/adminModel');
const FuelStationManager = require('../models/fuelStationManagerModal')
const PumpOperator = require('../models/pumpOperatorModel');
const {generateOTP}  = require('../services/otp');
const {sendMail} = require('../services/mail');

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
            const mail_status = await sendMail({ to: entered_email, OTP: generated_otp });
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
            const mail_status = await sendMail({ to: email, OTP: generated_otp });
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
    const { email, password } = req.body;
    try {
        const result = await Admin.findOne({ email, password });
        if (result) {
            res.status(200).json({ result: 'Login success' })
        } else {
            res.status(200).json({ result: 'Invalid credentials' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
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
    handleAdminLogin
}