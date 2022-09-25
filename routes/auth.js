const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .post('/login-vehicle-owner', authController.handleLoginVehicleOwner)
    // .post('/login-fuel-station', authController.handleLoginFuelStation)
    .post('/register', authController.handleRegister)

module.exports = router;