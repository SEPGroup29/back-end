const mongoose = require('mongoose');
const FuelStation = require('../models/fuelStationModel')

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
    try {
        const stations = await FuelStation.find().sort({name:1}) 
        // console.log(stations);
        res.status(200).json({stations, result: 'success'});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    insertFuelStation,
    showAllFuelStations,
}