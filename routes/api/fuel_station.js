const express = require('express');
const fuelStationController = require('../../controllers/fuelStationController');
const verifyRoles = require('../../middlewares/verifyRoles');
const router = express.Router();

router
    .post('/add-fuel-station', verifyRoles(process.env.FUEL_STATION_MANAGER), fuelStationController.insertFuelStation)
    .get('/show-all-fuel-stations/:search', verifyRoles(process.env.VEHICLE_OWNER), fuelStationController.showAllFuelStations)
    .post('/update-stock', verifyRoles(process.env.FUEL_STATION_MANAGER), fuelStationController.updateStock)
    .get('/get-stock/:fs_id', verifyRoles(process.env.FUEL_STATION_MANAGER), fuelStationController.getStock)
    .get('/get-three-fuel-stations', verifyRoles(process.env.VEHICLE_OWNER), fuelStationController.getThreeFuelStations)

module.exports = router;