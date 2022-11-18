const Vehicle = require("../models/vehicleModel")
const VehicleOwner = require("../models/vehicleOwnerModel")
const VehicleTypes = require("../models/vehicleTypesModel")
const User = require("../models/userModel")
const RegisteredVehicles = require("../models/registeredVehiclesModel")
const FuelQuota = require("../models/fuelQuotaModel")
const Queue = require("../models/queueModel")
const { getCurrentUser } = require("../helpers/functions/getCurrentUser")
const FuelStation = require("../models/fuelStationModel")
const { sendQueueMail } = require("../services/mail/queue_mail")
const moment = require("moment/moment")

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
            const vo = await VehicleOwner.findOne({ user: user._id }).populate('fuelQuota')
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
            // const qVehicles = []
            // vehicles.forEach(vehicle => {
            //     if (vehicle.queueId) {
            //         qVehicles.push(vehicle)
            //     }
            // });
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
        const vehicle = await Vehicle.findOne({ _id: vehicle_id })
        if (!vehicle) {
            res.status(200).json({ error: 'Vehicle does not exisit' })
            return
        }
        if (vehicle.queueId) {
            res.status(200).json({ error: 'Cannot delete a vehicle when it is in a fuel queue' })
            return
        }
        const deletedVehicle = await Vehicle.findOneAndDelete({ _id: vehicle_id })
        res.status(200).json({ success: 'Deleted' })

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
                    console.log("INSIDE CASE 1 newQuota", parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation)) * (60 / 100));
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation)) * (60 / 100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ _id: vo.fuelQuota.id }, { EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
                    break;
                case 2:
                    newQuota = parseFloat(currentQuota) + Math.min(parseFloat(newVehicleQuota), parseFloat(preVehicles[0].vehicleType.fuelAllocation), parseFloat(preVehicles[1].vehicleType.fuelAllocation)) * (60 / 100)
                    var quota = fuelType === 'petrol' ? await FuelQuota.findOneAndUpdate({ _id: vo.fuelQuota.id }, { EPQ: newQuota }) : await FuelQuota.findOneAndUpdate({ EDQ: vehicle.fuelAllocation })
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
    console.log({ stationId, fuel, regNo, amount });
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
            // Check amount is less than fuel quota
            const user = await getCurrentUser(req)
            const vo = await VehicleOwner.findOne({ user: user.id }).populate('fuelQuota')
            pq = fuel === 'petrol' ? vo.fuelQuota.EPQ : vo.fuelQuota.EDQ
            if (floatAmount > pq) {
                res.status(200).json({ error: 'Entered amount must be less than allocated quota' })
                return
            }
            // Find queue position
            const eligibleVehicles = await Vehicle.find({ queueId: queue._id, eligibleFuel: true })
            const nonEligibleVehicles = await Vehicle.find({ queueId: queue._id, eligibleFuel: false })
            // Check whether the remaing stock is enough to supply amount entered by vehicle owner
            switch (queue.queueType) {
                case 'petrol':
                    if (!(queue.fuelStationId.tempPetrolStock >= floatAmount)) {
                        const joinedVehicle = await Vehicle.updateOne({ regNo }, { queueId: queue._id, tempQueuePosition: nonEligibleVehicles.length + 1, requestedFuel: floatAmount, eligibleFuel: false })
                        const updatedFs = await FuelStation.updateOne({ _id: queue.fuelStationId.id }, { tempPetrolStock: 0 })
                        res.status(200).json({ success: `Vehicle ${regNo} successfully joined to ${queue.fuelStationId.name}, ${queue.fuelStationId.nearCity}. You will be notified when fuel is available`, joinedVehicle })
                        return
                    } else {
                        const joinedVehicle = await Vehicle.updateOne({ regNo }, { queueId: queue._id, queuePosition: eligibleVehicles.length + 1, requestedFuel: floatAmount, eligibleFuel: true })
                        const updatedFs = await FuelStation.updateOne({ _id: queue.fuelStationId.id }, { tempPetrolStock: queue.fuelStationId.tempPetrolStock - floatAmount })
                        console.log(joinedVehicle);
                        //send email
                        const result = await sendQueueMail({ to: user.email, date: moment().format('D/MM/YYYY'), fsName: queue.fuelStationId.name, city: queue.fuelStationId.nearCity, regNo, queueType: fuel, position: eligibleVehicles.length + 1 })

                        res.status(200).json({ success: `Vehicle ${regNo} successfully joined to ${queue.fuelStationId.name}, ${queue.fuelStationId.nearCity}. You can refill today!`, joinedVehicle })
                        return
                    }
                    break;
                case 'diesel':
                    if (!(queue.fuelStationId.tempDieselStock >= floatAmount)) {
                        const joinedVehicle = await Vehicle.updateOne({ regNo }, { queueId: queue._id, tempQueuePosition: nonEligibleVehicles.length + 1, requestedFuel: floatAmount, eligibleFuel: false })
                        const updatedFs = await FuelStation.updateOne({ _id: queue.fuelStationId.id }, { tempDieselStock: 0 })
                        res.status(200).json({ success: `Vehicle ${regNo} successfully joined to ${queue.fuelStationId.name}, ${queue.fuelStationId.nearCity}. You will be notified when fuel is available`, joinedVehicle })
                        return
                    } else {
                        const joinedVehicle = await Vehicle.updateOne({ regNo }, { queueId: queue._id, queuePosition: eligibleVehicles.length + 1, requestedFuel: floatAmount, eligibleFuel: true })
                        const updatedFs = await FuelStation.updateOne({ _id: queue.fuelStationId.id }, { tempPetrolStock: queue.fuelStationId.tempDieselStock - floatAmount })

                        //send email
                        const result = await sendQueueMail({ to: user.email, date: moment().format('D/MM/YYYY'), fsName: queue.fuelStationId.name, city: queue.fuelStationId.nearCity, regNo, queueType: fuel, position: eligibleVehicles.length + 1 })

                        res.status(200).json({ success: `Vehicle ${regNo} successfully joined to ${queue.fuelStationId.name}, ${queue.fuelStationId.nearCity}. You can refill today!`, joinedVehicle })
                        return
                    }
                    break;
                default:
                    res.status(200).json({ error: 'Invalid queue type' })
                    return
            }
        } else {
            res.status(200).json({ error: 'Vehicle not found' })
            return
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const showQueue = async (req, res) => {
    const { queueId } = req.params

    try {
        const queue = await Queue.findOne({ _id: queueId }).populate('fuelStationId')
        if (!queue) {
            res.status(200).json({ error: 'Queue not found' })
            return
        }
        res.status(200).json({ queue })
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

const withdrawFromQueue = async (req, res) => {
    const { queueId, regNo } = req.params
    try {
        const vehicle = await Vehicle.findOne({ queueId, regNo })
        console.log("VEHICLE FOUND", vehicle)
        if (!vehicle) {
            res.status(200).json({ error: 'Vehicle not found in this queue' })
            return
        }
        if (vehicle.queuePosition > 0) {
            res.status(200).json({ error: 'Cannot withdraw while the vehicle is in an eligible queue' })
            return
        }
        const modifiedVehicle = await Vehicle.updateOne(
            { _id: vehicle.id },
            {
                eligibleFuel: false,
                queueId: null,
                requestedFuel: 0,
                tempQueuePosition: 0,
                queuePosition: 0
            }
        )

        // Add the amount of withdrawed vehicle to temp stock
        const queue = await Queue.findOne({_id: queueId})
        const tempQueue = queue.queueType === 'petrol' ? 'tempPetrolStock' : 'tempDieselStock'
        const updatedFs = await FuelStation.updateOne({_id: queue.fuelStationId}, {$inc: {[tempQueue]: vehicle.requestedFuel}})
        res.status(200).json({ success: 'Successfully withdrawed from the queue' })
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
    showQueue,
    withdrawFromQueue,
}
