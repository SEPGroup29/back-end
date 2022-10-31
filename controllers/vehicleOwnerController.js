const Vehicle = require("../models/vehicleModel")
const VehicleOwner = require("../models/vehicleOwnerModel")
const VehicleTypes = require("../models/vehicleTypesModel")
const User = require("../models/userModel")
const RegisteredVehicles = require("../models/registeredVehiclesModel")
const FuelQuota = require("../models/fuelQuotaModel")
const { log } = require("handlebars/runtime")

const addVehicle = async (req, res) => {
    const { regNo, chassisNo, vehicleType, fuelType } = req.body

    // Validations
    // ..............

    try {
        // Check for chassis number validity
        const registeredVehicle = await RegisteredVehicles.findOne({ chassisNo })
        if (registeredVehicle && registeredVehicle.regNo === regNo) {
            const NIC = '123456789V'    // Should get current user's nic
            const vo = await VehicleOwner.findOne({ NIC }).populate("fuelQuota")
            //Check for vehicle count
            const vehicle_count = await Vehicle.find({ vehicleOwnerId: vo._id }).count()
            if (vehicle_count === 3) {
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
                                    // Update fuel quota
                                    const updatedQuota = await updateQuota(result, fuelType, vo.id, vo)
                                    // Add vehicle
                                    const vehicle = await Vehicle.create({ regNo, chassisNo, vehicleType: result.id, fuelType, vehicleOwnerId: vo.id })
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
        } else {
            res.status(200).json({ error: 'Invalid chassis number' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}

const showVehicles = async (req, res) => {
    try {
        const NIC = '123456789V'

        //Get vehicle owner
        const vo = await VehicleOwner.findOne({ NIC })
        if (vo) {
            const vehicles = await Vehicle.find({ vehicleOwnerId: vo._id }).populate('vehicleType');
            res.status(200).json({ vehicles })
        } else {
            res.status(200).json({ error: 'Vehicle owner not found' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const deleteVehicle = async (req, res) => {
    const { vehicle_id } = req.params
    console.log(vehicle_id)
    try {
        const vehicle = await Vehicle.findOneAndDelete({ _id: vehicle_id })
        if (vehicle) {
            res.status(200).json({ success: 'Deleted' })
        } else {
            res.status(200).json({ error: 'Vehicle does not exisis' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const showAllVehicleOwners = async (req, res) => {
    try {
        const vehicleOwners = await VehicleOwner.find().sort({ name: 1 }).populate('user')
        console.log(vehicleOwners);
        res.status(200).json({ vehicleOwners, result: 'success' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getVehicleOwnerName = async (req, res) => {
    const NIC = '123456789V'
    try {
        const user = await VehicleOwner.findOne({ NIC }).populate('user')
        const name = user.user.firstName
        res.status(200).json({ name, result: "success" })
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Fuel quota update after adding a new vehicle
const updateQuota = async (vehicle, fuelType, vehicleOwnerId, vo) => {
    try {
        const preVehicles = await Vehicle.find({ vehicleOwnerId, fuelType }).populate("vehicleType")
        console.log("PREVEH LENGTH: ", preVehicles.length)
        if (preVehicles.length > 0) {
            //------- Algorithm----------
            const newVehicleQuota = vehicle.fuelAllocation
            const currentQuota = fuelType === 'petrol' ? vo.fuelQuota.EPQ : vo.fuelQuota.EDQ 
            var newQuota
            switch (preVehicles.length) {
                case 1:
                    // console.log("Inside case 1");
                    // console.log(parseFloat(currentQuota))
                    // console.log(parseFloat(newVehicleQuota)*5)
                    // console.log(parseFloat(preVehicles[0].vehicleType.fuelAllocation))
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation))*(60/100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
                    break;
                case 2:
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation), parseFloat(preVehicles[1].vehicleType.fuelAllocation))*(60/100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
                    break;
                default:
                    return false
            }
        } else {
            switch (fuelType) {
                case 'petrol':
                    var quota = await FuelQuota.create({ EPQ: vehicle.fuelAllocation })
                    var vehicleOwner = await VehicleOwner.findOneAndUpdate({ _id: vehicleOwnerId }, { fuelQuota: quota._id })
                    break;
                case 'diesel':
                    var quota = await FuelQuota.create({ EDQ: vehicle.fuelAllocation })
                    var vehicleOwner = await VehicleOwner.findOneAndUpdate({ _id: vehicleOwnerId }, { fuelQuota: quota._id })
                    break;
                default:
                    break;
            }
            return quota
        }
    } catch (error) {
        return false
    } 
}

module.exports = {
    addVehicle,
    showVehicles,
    deleteVehicle,
    showAllVehicleOwners,
    getVehicleOwnerName
}