const VehicleOwner = require('../models/vehicleOwnerModel')
const FuelStation = require('../models/fuelStationModel')
const User = require('../models/userModel')
const Vehicle = require("../models/vehicleModel")

const getDashboardDetails = async (req, res) => {
    try {
        const vehicleOwnerCount = await VehicleOwner.countDocuments()
        const fuelStationCount = await FuelStation.countDocuments()
        const userCount = await User.countDocuments()
        const vehicleCount = await Vehicle.countDocuments()

        res.status(200).json({
            vehicleOwnerCount,
            fuelStationCount,
            userCount,
            vehicleCount
        })
        console.log(vehicleOwnerCount, fuelStationCount, userCount, vehicleCount)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    getDashboardDetails
}