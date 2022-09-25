const mongoose = require('mongoose');
const VehicleOwner = require('../models/vehicleOwnerModel')
const FuelStationManager = require('../models/fuelStationManagerModal')
const PumpOperator = require('../models/pumpOperatorModel');
const nodemailer = require('nodemailer');

// functions 

let generated_otp = null

// Check already exisiting email
const handleEmailExistance = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await VehicleOwner.findOne({ email });
        if (result) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            generated_otp = 12345;    // Should be generated
            res.status(200).json({ generated_otp })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleRegister = async (req, res) => {
    const { NIC, email, entered_otp, firstName, lastName } = req.body
    console.log(entered_otp, generated_otp)
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
        res.status(400).json({ error: 'Invalid OTP' })
    }

}

const handleLoginVehicleOwner = async (req, res) => {
    const { email } = req.body;
    console.log(email)

    // email validation
        // ................

    // Find email in database
    try {
        const result = await VehicleOwner.findOne({ email });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}

const handleLoginFuelStation = async (req, res) => {
    const { id } = req.body;

    // Input id validation
        // ................

    // Find id in database

}

const handleLogout = async (req, res) => {

}

module.exports = {
    handleEmailExistance,
    handleRegister,
    handleLoginVehicleOwner,
    handleLoginFuelStation,
    handleLogout,
}