const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const verifyRoles = require('../../middlewares/verifyRoles');

router
    .get('/dashboard-details', verifyRoles(process.env.ADMIN), adminController.getDashboardDetails)
    .get('/show-all-vehicle-owners/:search', verifyRoles(process.env.ADMIN), adminController.showAllVehicleOwners)

module.exports = router;