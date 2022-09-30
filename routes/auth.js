const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .post('/login-vehicle-owner', authController.handleLoginVehicleOwner)
    .post('/register-email-existance', authController.handleEmailExistance)
    .post('/register', authController.handleRegister)
    .post('/login-otp', authController.handleLoginAfterOTP)
    .post('/login-admin', authController.handleAdminLogin)
    .post('/register-admin', authController.handleAdminSignup)
    .post('/register-manager', authController.handleManagerSignup)
    .post('/login-manager', authController.handleManagerLogin)


module.exports = router;