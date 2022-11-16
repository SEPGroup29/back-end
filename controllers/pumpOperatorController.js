const Queue = require('../models/queueModel')
const PumpOperator = require('../models/pumpOperatorModel')
const Vehicle = require('../models/vehicleModel')
const VehicleOwner = require("../models/vehicleOwnerModel");
const FuelStation = require('../models/fuelStationModel')

const checkVehicleEligibility = async (req, res) => {
    const { id, pumpOperatorId } = req.body
    try {
        const vo = await VehicleOwner.findOne({ _id: id })
        const vehicles  = await Vehicle.find({ vehicleOwnerId: vo._id })
        const po = await PumpOperator.findOne({ _id: pumpOperatorId })
        const fsId = po.fuelStationId
        const vehicleList = []
        if (vehicles.length > 0) {
            for (const vehicle in vehicles) {
                if (vehicles[vehicle].eligibleFuel){
                    const registeredFuelQue = await Queue.findOne({ _id: vehicles[vehicle].queueId })
                    const regFuelStation = await FuelStation.findOne({ _id: registeredFuelQue.fuelStationId })
                    if (regFuelStation._id.toString() === fsId.toString()) {
                        vehicleList.push(vehicles[vehicle])
                    }
                }
            }
            if (vehicleList.length > 0) {
                res.status(200).json({ vehicleList, result: 'success' })
            }
            else {
                res.status(200).json({ error: 'No eligible vehicles found' })
            }
        }
        else {
            res.status(200).json({ error: 'No vehicles registered' })
            return
        }
        res.status(200).json({ fsId });
    }
    catch (error) {
        console.log(error);
    }

}

module.exports = {
    checkVehicleEligibility
}