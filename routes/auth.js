const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .post('/login-vehicle-owner', authController.handleLoginVehicleOwner)
    .post('/register-email-existance', authController.handleEmailExistance)
    .post('/register', authController.handleRegister)
    .post('/login-otp', authController.handleLoginAfterOTP)

module.exports = router;