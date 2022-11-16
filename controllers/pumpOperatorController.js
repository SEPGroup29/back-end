const mongoose = require('mongoose');
const Queue = require('../models/queueModel')
const PumpOperator = require('../models/pumpOperatorModel')
const Vehicle = require('../models/vehicleModel')
const User = require("../models/userModel")
const VehicleOwner = require("../models/vehicleOwnerModel");

const checkVehicleEligibility = async (req, res) => {
    const { id } = req.body
    try {
        const vo = await VehicleOwner.findOne({ _id: id })
        res.status(200).json({ vo });
        console.log("VO", vo);
    }
    catch (error) {
        console.log(error);
    }

}

module.exports = {
    checkVehicleEligibility
}