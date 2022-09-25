const mongoose = require('mongoose');
const VehicleOwner = require('../models/vehicleOwnerModel')
const FuelStationManager = require('../models/fuelStationManagerModal')
const PumpOperator = require('../models/pumpOperatorModel');

// functions 
const handleRegister = async (req, res) => {
    const {NIC, email, firstName, lastName} = req.body

    // Data validation
        // ................

    //Enter to database
    try {
        const vehicleOwner = await VehicleOwner.create({ NIC, email, firstName, lastName })
        res.status(200).json(vehicleOwner)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
}

const handleLoginVehicleOwner = async (req, res) => {
    const { email } = req.body;
    console.log(email)

    // email validation
        // ................

    // Find email in database
    try {
        const result = await VehicleOwner.findOne({email});
        res.status(200).json( result );
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
    handleRegister,
    handleLoginVehicleOwner,
    handleLoginFuelStation,
    handleLogout,
}