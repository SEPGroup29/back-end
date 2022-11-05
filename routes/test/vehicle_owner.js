const express = require('express');
const router = express.Router();
const vehicleOwnerController = require('../../controllers/vehicleOwnerController');

router
    .get('/show-vehicle/:regNo', vehicleOwnerController.showOneVehicle)

module.exports = router;