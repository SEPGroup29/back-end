const express = require('express');
const fuelStationController = require('../../controllers/fuelStationController');
const router = express.Router();

router
    .post('/add-fuel-station', fuelStationController.insertFuelStation)
    .get('/show-all-fuel-stations', fuelStationController.showAllFuelStations)
    .post('/update-stock', fuelStationController.updateStock)
    .get('/get-stock/:fs_id', fuelStationController.getStock)

module.exports = router;