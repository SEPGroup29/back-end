const Vehicle = require("../models/vehicleModel")
const VehicleOwner = require("../models/vehicleOwnerModel")
const VehicleTypes = require("../models/vehicleTypesModel")

const addVehicle = async (req, res) => {
    const { regNo, chassisNo, vehicleType, fuelType } = req.body

    // Validations
    // ..............

    // Check for existing vehicles
    try {
        const result = await Vehicle.findOne({ regNo })
        if (result) {
            res.status(400).json({ error: 'Vehicle already exists' })
        } else {
            //Get vehicle type
            try {
                const result = await VehicleTypes.findOne({ type: vehicleType })
                if (result) {
                    //Enter to database
                    try {
                        const vehicle = await Vehicle.create({ regNo, chassisNo, vehicleType: result.id, fuelType })
                        const NIC = '123456789V'    // Should get current user's nic
                        const r = await VehicleOwner.updateOne({ NIC }, { $push: { vehicles: vehicle } })
                        res.status(200).json(vehicle)
                    } catch (error) {
                        res.status(400).json({ error: error.message })
                    }
                } else {
                    res.status(400).json({ error: 'Invalid vehicle type' })
                }
            } catch (error) {
                res.status(400).json({ error: error.message })
            }
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const showVehicles = async (req, res) => {
    try {
        const NIC = '123456789V'    // Should get current user's nic
        const vehicleOwner = await VehicleOwner.findOne({ NIC })
        // const vehicle_objects = vehicleOwner.vehicles
        // vehicle_objects.forEach((vehicle) => {
        //     console.log(vehicle.toString())
        // })
        // const vehicle_list = []
        const rr = Vehicle.findOne({_id: vehicleOwner.vehicles[0].toString()})
        console.log(rr)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    addVehicle,
    showVehicles
}