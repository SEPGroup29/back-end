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
    .post('/fs-login', authController.handleFsLogin)
    .post('/register-manager', authController.handleManagerSignup)
    .post('/login-pump-operator', authController.handlePumpOperatorLogin)
    .post('/register-po', authController.handlePumpOperatorSignup)
    .get('/new-token', authController.handleNewAccessToken)
    .get('/logout', authController.handleLogout)
    .get('/get-user/:id', authController.getUser)

module.exports = router;