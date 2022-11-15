const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

router
    .get('/dashboard-details', adminController.getDashboardDetails)

module.exports = router;
