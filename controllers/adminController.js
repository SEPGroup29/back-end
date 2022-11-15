const VehicleOwner = require('../models/vehicleOwnerModel')
const FuelStation = require('../models/fuelStationModel')
const User = require('../models/userModel')
const Vehicle = require("../models/vehicleModel")
const UserType = require("../models/userTypesModel")
const UserTypes = require('../models/userTypesModel')

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

const showAllVehicleOwners = async (req, res) => {
    const { search } = req.params
    try {
        if (search === 'null') {
            var vehicleOwners = await VehicleOwner.find().sort({ name: 1 }).populate('user').populate('fuelQuota')
            res.status(200).json({ vehicleOwners, result: 'success' });
        } else {
            const vehicleOwnersFiltered = []
            var vehicleOwners = await VehicleOwner.find().sort({ name: 1 }).populate('user').populate('fuelQuota')
            vehicleOwners.forEach(vo => {
                if (vo.user.firstName.toLowerCase().includes(search.toLowerCase()) || vo.user.lastName.toLowerCase().includes(search.toLowerCase())){
                    vehicleOwnersFiltered.push(vo)
                }
            });
            res.status(200).json({ vehicleOwners: vehicleOwnersFiltered, result: 'success' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    getDashboardDetails,
    showAllVehicleOwners,
}