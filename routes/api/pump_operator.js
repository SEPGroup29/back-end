const express = require('express');
const pumpOperatorController = require('../../controllers/pumpOperatorController');
const router = express.Router();
// const verifyRoles = require('../../middlewares/verifyRoles');

router
    .get('/check-vehicle-eligibility/:voId/:poId', pumpOperatorController.checkVehicleEligibility)
    .post('/pump-fuel', pumpOperatorController.pumpFuel)

module.exports = router;