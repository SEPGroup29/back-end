
const authController = require('./authController')
const mongoose = require('mongoose');
const FuelStation = require('../models/fuelStationModel');
const FuelStationManager = require('../models/fuelStationManagerModal');
const { getCurrentUser } = require('../helpers/functions/getCurrentUser');
const PumpOperator = require('../models/pumpOperatorModel');
const ObjectId = require('mongoose').Types.ObjectId;

const insertFuelStation = async (req, res) => {
    const { name, nearCity, ownerName ,mnFirstName, mnLastName, contactNumber, mnEmail} = req.body
    console.log({ name, nearCity, ownerName ,mnFirstName, mnLastName, contactNumber, mnEmail});
    try {
        const result = await FuelStation.findOne({ name,nearCity })
        
        if (result) {
            res.status(200).json({ error: 'Fuel station already exists' })
            return
        }
        const fs = await FuelStation.create({ name, nearCity, ownerName })
        if(!fs){
            res.status(200).json({ error: 'Fuel station not created' })
            return
        }
        const fs_manager = await authController.handleManagerSignup( name, nearCity, ownerName,mnFirstName, mnLastName, contactNumber, mnEmail, fs._id)
        if(!fs_manager){
            res.status(200).json({ error: 'Fuel station manager creation failed' })
            return
        }
        res.status(200).json(fs_manager);
    
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const showAllFuelStations = async (req, res) => {
    const { search } = req.params
    try {
        if (search === 'null') {
            var stations = await FuelStation.find().sort({ name: 1 })
            res.status(200).json({ stations, result: 'success' });
        } else {
            var stations = await FuelStation.find({ name: { $regex: search, '$options': 'i' } }).sort({ name: 1 })
            res.status(200).json({ stations, result: 'success' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const showOneFuelStation = async (req, res) => {
    const { name } = req.params
    try {
        const fs = await FuelStation.findOne({ name })
        res.status(200).json({ fs });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const showFuelStation = async (req, res) => {
    try {
        const user = await getCurrentUser(req)
        console.log("USER", user);
        if (!user) {
            res.status(200).json({ error: "User not found" })
            return
        }
        const fs = await FuelStationManager.findOne({ user: user._id }).populate('fuelStationId')
        if (!fs) {
            res.status(200).json({ error: "Fuel station not found" })
            return
        }
        const pumpOperators = await PumpOperator.find({fuelStationId: fs.fuelStationId.id}).populate('user')
        res.status(200).json({ fs, pumpOperators });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getStock = async (req, res) => {
    const { fs_id } = req.params
    if (ObjectId.isValid(fs_id)) {
        const station = await FuelStation.findOne({ _id: fs_id })
        if (station) {
            res.status(200).json({ petrol: station.rpstock, diesel: station.rdstock })
        } else {
            res.status(200).json({ error: 'Fuel station not found' })
        }
    } else {
        res.status(200).json({ error: 'Fuel station not found' })
    }
}

const updateStock = async (req, res) => {
    const { fuel, amount, fuelStationId } = req.body

    if (ObjectId.isValid(fuelStationId)) {
        const station = await FuelStation.findOne({ _id: fuelStationId })
        if (station) {
            let updatedStation
            switch (fuel) {
                case 'Petrol':
                    updatedStation = await FuelStation.updateOne(
                        { _id: fuelStationId },
                        {
                            pstock: parseFloat(station.pstock) + amount,
                            rpstock: parseFloat(station.rpstock) + amount
                        }
                    )
                    break;
                case 'Diesel':
                    updatedStation = await FuelStation.updateOne(
                        { _id: fuelStationId },
                        {
                            dstock: parseFloat(station.dstock) + amount,
                            rdstock: parseFloat(station.rdstock) + amount
                        }
                    )
                    break;
                default:
                    break;
            }
            res.status(200).json({ updatedStation })

        } else {
            res.status(200).json({ error: 'Fuel station not found' })
        }
    } else {
        res.status(200).json({ error: 'Fuel station not found' })
    }
}

const getThreeFuelStations = async (req, res) => {
    try {
        // Get the count of all fuel stations
        FuelStation.count().exec(function (err, count) {

            // Get a random entry
            var random = Math.floor(Math.random() * count)

            // Again query all fuel stations but only fetch one offset by our random #
            FuelStation.find().limit(3).skip(random).exec(
                function (err, result) {
                    res.status(200).json({result})
                })
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    insertFuelStation,
    showAllFuelStations,
    showOneFuelStation,
    getStock,
    updateStock,
    getThreeFuelStations,
    showFuelStation,
}