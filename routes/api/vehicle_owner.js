const express = require('express');
const router = express.Router();
const vehicleOwnerController = require('../../controllers/vehicleOwnerController');

router
    .post('/add-vehicle', vehicleOwnerController.addVehicle)
    .get('/show-vehicles', vehicleOwnerController.showVehicles)
    .delete('/delete-vehicle/:vehicle_id', vehicleOwnerController.deleteVehicle)
    .get('/show-all-vehicle-owners', vehicleOwnerController.showAllVehicleOwners)
    .get('/get-vehicle-owner-name', vehicleOwnerController.getVehicleOwnerName)

module.exports = router;