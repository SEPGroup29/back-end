const express = require('express');
const router = express.Router();
const vehicleOwnerController = require('../../controllers/vehicleOwnerController');
const verifyRoles = require('../../middlewares/verifyRoles');

router
    .post('/add-vehicle', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.addVehicle)
    .get('/show-vehicles', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.showVehicles)
    .delete('/delete-vehicle/:vehicle_id', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.deleteVehicle)
    .get('/show-all-vehicle-owners', verifyRoles(process.env.ADMIN), vehicleOwnerController.showAllVehicleOwners)
    .get('/get-vehicle-owner-name', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.getVehicleOwnerName)
    .get('/get-vehicle-types', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.getVehicleTypes)
    .post('/join-queue', verifyRoles(process.env.VEHICLE_OWNER), vehicleOwnerController.joinQueue)

module.exports = router;