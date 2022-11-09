
const authController = require('./authController')
const mongoose = require('mongoose');
const FuelStation = require('../models/fuelStationModel')
const ObjectId = require('mongoose').Types.ObjectId;

const insertFuelStation = async (req, res) => {
    const { name, nearCity, ownerName ,mnFirstName, mnLastName, contactNumber, mnEmail} = req.body
    console.log(name, nearCity, ownerName);
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
        const result = await FuelStation.findOne({ name,nearCity })
        
        if (result) {
            res.status(200).json({ error: 'Fuel station already exists' })
            return
        }
        const fs = await FuelStation.create([{ name, nearCity, ownerName }],{session})
        if(!fs){
            res.status(200).json({ error: 'Fuel station not created' })
            return
        }
        const fs_manager = await authController.handleManagerSignup(mnFirstName, mnLastName, contactNumber, mnEmail, fs._id,{session},res)
        if(!fs_manager){
            res.status(200).json({ error: 'Fuel station manager creation failed' })
            return
        }
        res.status(200).json(fs_manager);
    })
    session.endSession();
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

const showOneFuelStation = async(req,res) =>{
    const{ name } = req.params
    try{
        const fs = await FuelStation.findOne({name})
        res.status(200).json({ fs });
    }catch(error){
        res.status(400).json({error: error.message})
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
    showOneFuelStation,
    getStock,
    updateStock,
}