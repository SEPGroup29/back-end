const express = require('express');
const router = express.Router();
const vehicleOwnerController = require('../../controllers/vehicleOwnerController');

router
    .post('/add-vehicle', vehicleOwnerController.addVehicle)
    .get('/show-vehicles', vehicleOwnerController.showVehicles)
    .delete('/delete-vehicle', vehicleOwnerController.deleteVehicle)

module.exports = router;