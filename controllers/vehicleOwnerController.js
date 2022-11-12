const Vehicle = require("../models/vehicleModel")
const VehicleOwner = require("../models/vehicleOwnerModel")
const VehicleTypes = require("../models/vehicleTypesModel")
const User = require("../models/userModel")
const RegisteredVehicles = require("../models/registeredVehiclesModel")
const FuelQuota = require("../models/fuelQuotaModel")
const Queue = require("../models/queueModel")
const { getCurrentUser } = require("../helpers/functions/getCurrentUser")

const addVehicle = async (req, res) => {
    const { regNo, chassisNo, vehicleType, fuelType } = req.body

    // Validations
    // ..............

    try {
        // Check for chassis number validity
        const registeredVehicle = await RegisteredVehicles.findOne({ chassisNo })
        if (registeredVehicle && registeredVehicle.regNo === regNo) {
            const user = await getCurrentUser(req)
            if (!user) {
                res.status(200).json({ error: "User not found" })
                return
            }
            const vo = await VehicleOwner.findOne({ user: user._id })
            // const NIC = '123456789V'    // Should get current user's nic
            // const vo = await VehicleOwner.findOne({ NIC }).populate("fuelQuota")
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
        const user = await getCurrentUser(req)
        if (!user) {
            res.status(200).json({ error: "User not found" })
            return
        }
        const vo = await VehicleOwner.findOne({ user: user._id })
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
        res.status(200).json({ vehicleOwners, result: 'success' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getVehicleOwner = async (req, res) => {
    const user = await getCurrentUser(req)
    if (!user) {
        res.status(200).json({ error: "User not found" })
        return
    }
    try {
        const vo = await VehicleOwner.findOne({ user: user._id }).populate('user').populate('fuelQuota')
        var remainingQuota
        if (vo.fuelQuota) {
            const epq = vo.fuelQuota.EPQ
            const edq = vo.fuelQuota.EDQ
            remainingQuota = {
                rpq: vo.fuelQuota.EPQ - vo.consumedPQ,
                rdq: vo.fuelQuota.EDQ - vo.consumedDQ
            }
        } else {
            remainingQuota = {
                rpq: 0,
                rdq: 0
            }
        }
        res.status(200).json({ vo, remainingQuota })
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const showOneVehicle = async (req, res) => {
    const { regNo } = req.params
    try {
        const vehicle = await Vehicle.findOne({ regNo })
        res.status(200).json({ vehicle });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Fuel quota update after adding a new vehicle
const updateQuota = async (vehicle, fuelType, vehicleOwnerId, vo) => {
    try {
        const preVehicles = await Vehicle.find({ vehicleOwnerId, fuelType }).populate("vehicleType")
        if (preVehicles.length > 0) {
            //------- Algorithm----------
            const newVehicleQuota = vehicle.fuelAllocation
            const currentQuota = fuelType === 'petrol' ? vo.fuelQuota.EPQ : vo.fuelQuota.EDQ
            var newQuota
            switch (preVehicles.length) {
                case 1:
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation)) * (60 / 100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
                    break;
                case 2:
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation), parseFloat(preVehicles[1].vehicleType.fuelAllocation)) * (60 / 100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
                    break;
                default:
                    return false
            }
        } else {
            switch (fuelType) {
                case 'petrol':
                    if (vo.fuelQuota) {
                        var quota = await FuelQuota.findOneAndUpdate({ _id: vo.fuelQuota }, { EPQ: vehicle.fuelAllocation })
                    } else {
                        var quota = await FuelQuota.create({ EPQ: vehicle.fuelAllocation })
                        var vehicleOwner = await VehicleOwner.findOneAndUpdate({ _id: vehicleOwnerId }, { fuelQuota: quota._id })
                    }
                    break;
                case 'diesel':
                    if (vo.fuelQuota) {
                        var quota = await FuelQuota.findOneAndUpdate({ _id: vo.fuelQuota }, { EDQ: vehicle.fuelAllocation })
                    } else {
                        var quota = await FuelQuota.create({ EDQ: vehicle.fuelAllocation })
                        var vehicleOwner = await VehicleOwner.findOneAndUpdate({ _id: vehicleOwnerId }, { fuelQuota: quota._id })
                    }
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

const getVehicleTypes = async (req, res) => {
    try {
        const vehicleTypes = await VehicleTypes.find()
        res.status(200).json({ vehicleTypes, result: "success" })
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const joinQueue = async (req, res) => {
    const { stationId, fuel, regNo, amount } = req.body
    const floatAmount = parseFloat(amount)
    try {
        // Vehicle validity
        const vehicle = await Vehicle.findOne({ regNo })
        if (vehicle) {
            // Check whether the vehicle has already joined a queue
            if (vehicle.queueId) {
                res.status(200).json({ error: 'This vehicle has already joined a queue' })
                return
            }
            // Check whether the vehicle fuel type and queue type is different
            if (vehicle.fuelType !== fuel) {
                res.status(200).json({ error: 'Vehicle fuel type does not match the queue type' })
                return
            }
            // Get related queue
            const queue = await Queue.findOne({ queueType: fuel, fuelStationId: stationId, active: true }).populate('fuelStationId')
            if (!queue) {
                res.status(200).json({ error: 'This queue is not available' })
                return
            }
            // Check whether the remaing stock is enough to supply amount entered by vehicle owner
            switch (queue.queueType) {
                case 'petrol':
                    if (!(queue.fuelStationId.rpstock >= floatAmount)) {
                        res.status(200).json({ error: 'Fuel stock is not enough' })
                        return
                    }
                    break;
                case 'diesel':
                    if (!(queue.fuelStationId.rdstock >= floatAmount)) {
                        res.status(200).json({ error: 'Fuel stock is not enough' })
                        return
                    }
                    break;
                default:
                    res.status(200).json({ error: 'Invalid queue type' })
                    return
            }
            const joinedVehicle = await Vehicle.updateOne({ regNo }, { queueId: queue._id })
            res.status(200).json({ success: `Vehicle ${regNo} successfully joined to ${queue.fuelStationId.name}, ${queue.fuelStationId.nearCity}` })
        } else {
            res.status(200).json({ error: 'Vehicle not found' })
            return
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    addVehicle,
    showVehicles,
    deleteVehicle,
    showAllVehicleOwners,
    getVehicleOwner,
    showOneVehicle,
    getVehicleTypes,
    joinQueue,
}
