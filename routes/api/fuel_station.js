const express = require('express');
const fuelStationController = require('../../controllers/fuelStationController');
const verifyRoles = require('../../middlewares/verifyRoles');
const router = express.Router();

router
    .post('/add-fuel-station', verifyRoles(process.env.FUEL_STATION_MANAGER), fuelStationController.insertFuelStation)
    .get('/show-all-fuel-stations/:search', fuelStationController.showAllFuelStations)
    .post('/update-stock', verifyRoles(process.env.FUEL_STATION_MANAGER), fuelStationController.updateStock)
    .get('/get-stock/:fs_id', fuelStationController.getStock)

module.exports = router;