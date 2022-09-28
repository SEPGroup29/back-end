const Vehicle = require("../models/vehicleModel")
const VehicleOwner = require("../models/vehicleOwnerModel")
const VehicleTypes = require("../models/vehicleTypesModel")

const addVehicle = async (req, res) => {
    const { regNo, chassisNo, vehicleType, fuelType } = req.body

    // Validations
    // ..............

    //Check for vehicle count
    try {
        const NIC = '123456789V'    // Should get current user's nic
        const vehicleOwner = await VehicleOwner.findOne({ NIC })
        const vehicle_objects = vehicleOwner.vehicles
        let v_ids = []
        vehicle_objects.forEach((vo) => {
            v_ids.push(vo.toString())
        })
        const vehicles = await Vehicle.find({ _id: { $in: v_ids } })
        if (vehicles.length === 3) {
            res.status(200).json({ error: 'Vehicle limit reached' })
        }
        else {
            // Check for existing vehicles
            try {
                const result = await Vehicle.findOne({ regNo })
                if (result) {
                    res.status(200).json({ error: 'Vehicle already exists' })
                } else {
                    //Get vehicle type
                    try {
                        const result = await VehicleTypes.findOne({ type: vehicleType })
                        if (result) {
                            //Enter to database
                            try {
                                const vehicle = await Vehicle.create({ regNo, chassisNo, vehicleType: result.id, fuelType })
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
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}

const showVehicles = async (req, res) => {
    try {
        const NIC = '123456789V'
        const vo = await VehicleOwner.findOne({ NIC })
            .populate('vehicles')
            .exec()
        const vehicles = vo.vehicles
        // console.log(vehicles)
        // const newVehicles = await
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteVehicle = async (req, res) => {
    const { id } = req.body
    try {
        const vehicle = await Vehicle.findOneAndDelete({ _id: id })
        if (vehicle) {
            res.status(200).json({ success: 'Deleted' })
        } else {
            res.status(200).json({ error: 'Vehicle does not exisis' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// const getVehicleTypes = async (req, res) => {
//     try {
//         const typesd= await VehicleTypes.
//     } catch (error) {

//     }
// }

module.exports = {
    addVehicle,
    showVehicles,
    deleteVehicle,
}