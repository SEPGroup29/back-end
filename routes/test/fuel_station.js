const express = require('express');
const router = express.Router();
const fuelStationCOntroller = require('../../controllers/fuelStationController')

router
    .get('/show-fuel-station/:name', fuelStationCOntroller.showOneFuelStation)

module.exports = router;