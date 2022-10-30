const mongoose = require('mongoose');
const FuelStation = require('../models/fuelStationModel')
const ObjectId = require('mongoose').Types.ObjectId;

const insertFuelStation = async (req, res) => {
    const { name, nearCity, ownerName, pstock, dstock, rpstock, rdstock } = req.body
    try {
        const fs = await FuelStation.create({ name, nearCity, ownerName, pstock, dstock, rpstock, rdstock })
        res.status(200).json(fs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const showAllFuelStations = async (req, res) => {
    const { search } = req.params
    console.log(search);
    try {
        if (search === 'null') {
            var stations = await FuelStation.find().sort({ name: 1 })
            console.log("IF")
            res.status(200).json({ stations, result: 'success' });
        } else {
            console.log("ELSE")
            var stations = await FuelStation.find({ name: { $regex: search, '$options' : 'i'} }).sort({ name: 1 })
            res.status(200).json({ stations, result: 'success' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
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

module.exports = {
    insertFuelStation,
    showAllFuelStations,
    getStock,
    updateStock,
}