const User = require('../models/userModel')
const Login = require('../models/loginModel')
const OTP = require('../models/otpModel')
const VehicleOwner = require('../models/vehicleOwnerModel')
const Admin = require('../models/adminModel');
const Manager = require('../models/fuelStationManagerModal')
const PumpOperator = require('../models/pumpOperatorModel');
const UserTypes = require('../models/userTypesModel');
const FuelStation = require('../models/fuelStationModel')
const { generateOTP } = require('../services/otp');
const { sendRegOtpMail } = require('../services/mail/reg_otp_mail');
const { sendRegSuccessMail } = require('../services/mail/reg_success_mail');
const jwt = require('jsonwebtoken')
const token = require('../utils/token');
require('dotenv').config();
const bcrypt = require('bcrypt');

// Functions 

// Check already exisiting email
const handleEmailExistance = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.VEHICLE_OWNER) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            const { result, mail_status } = await generateAndSendOtp(email)
            if (result && mail_status)
                res.status(200).json({ result: 'Sent' })
            else
                res.status(200).json({ result: 'OTP generation error' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleRegister = async (req, res) => {
    const { NIC, email, entered_otp, firstName, lastName } = req.body

    // Data validation
    // ................
    try {
        const otp = await OTP.findOne({ email })
        if (otp) {
            // OTP check
            if (entered_otp === otp.otp) {
                //Enter to database
                try {
                    const userType = await UserTypes.findOne({ id: process.env.VEHICLE_OWNER })
                    const login = await Login.findOne({ loginType: process.env.OTP_LOGIN })
                    const user = await User.create({ email, firstName, lastName, loginType: login._id, userType: userType._id })
                    const vehicleOwner = await VehicleOwner.create({ user: user._id, NIC })
                    const mail_status = await sendRegSuccessMail({ to: email });

                    //Deleting otp entry from otp collection
                    const otp = await OTP.deleteMany({ email })

                    res.status(200).json({ user, vehicleOwner })
                } catch (error) {
                    res.status(400).json({ error: error.message })
                }
            } else {
                res.status(200).json({ error: 'Invalid OTP' })
            }
        } else {
            res.status(200).json({ error: 'Email mismatch' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}

const handleLoginVehicleOwner = async (req, res) => {
    const { email } = req.body;

    // email validation
    // ................

    // Find email in database
    try {
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.VEHICLE_OWNER) {
            const { result, mail_status } = await generateAndSendOtp(email)
            if (result && mail_status)
                // res.status(200).json({ result: 'Sent' })
                res.status(200).json({ result });
            else
                res.status(200).json({ result: 'OTP generation error' })
        } else {
            res.status(200).json({ error: 'Email not found' })
        }

    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}

const handleLoginAfterOTP = async (req, res) => {
    const { entered_otp } = req.body
    // OTP check
    if (entered_otp === generated_otp) {
        try {
            const result = await VehicleOwner.findOne({ entered_email });
            if (result) {

                const { authObject, access_token, refresh_token } = createAndSaveTokens(result)

                // Saving refresh token in database
                const updatedAdmin = await Admin.updateOne({ entered_email }, { refreshToken: refresh_token })

                // Set to cookie
                res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                return res.status(200).json({
                    "message": "Login successful",
                    "access_token": access_token
                });
            }
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    } else {
        res.status(400).json({ error: 'Invalid OTP' })
    }
}

const handleAdminLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const result = await Admin.login(email, password)
        console.log(result)

        if (!result.error) {

            const { authObject, access_token, refresh_token } = createAndSaveTokens(result)

            // Saving refresh token in database
            const updatedAdmin = await Admin.updateOne({ email }, { refreshToken: refresh_token })

            // Set to cookie
            res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                "message": "Login successful",
                "access_token": access_token
            });
        } else {
            res.status(200).json({ error: result.error })
        }

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleAdminSignup = async (req, res) => {
    const { email, firstName, lastName, password } = req.body

    try {
        // Check for existance
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.ADMIN) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            // Password encryption
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            // Enter to database
            const userType = await UserTypes.findOne({ id: process.env.ADMIN })
            const login = await Login.findOne({ loginType: process.env.PASSWORD_LOGIN })
            const user = await User.create({ email, firstName, lastName, loginType: login._id, userType: userType._id })
            const admin = await Admin.create({ user: user._id, password: hash })
            res.status(200).json({ user, admin })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleManagerLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const result = await Manager.login(email, password)

        if (!result.error) {
            const { authObject, access_token, refresh_token } = createAndSaveTokens(result)

            // Saving refresh token in database
            const updatedAdmin = await Admin.updateOne({ email }, { refreshToken: refresh_token })

            // Set to cookie
            res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                "message": "Login successful",
                "access_token": access_token
            });
        } else {
            res.status(200).json({ error: result.error })
        }

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleManagerSignup = async (req, res) => {
    const { firstName, lastName, contactNumber, email, password, fuelStationId } = req.body

    try {
        // Check for existance
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.FUEL_STATION_MANAGER) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            // Password encryption
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)
            
            // Enter to database
            const userType = await UserTypes.findOne({ id: process.env.FUEL_STATION_MANAGER })
            const login = await Login.findOne({ loginType: process.env.PASSWORD_LOGIN })
            const user = await User.create({ email: email, firstName, lastName, loginType: login._id, userType: userType._id })
            const manager = await Manager.create({ user: user._id, contactNumber, password: hash, fuelStationId })
            res.status(200).json({ user, manager })
        }
        // const userType = await UserTypes.findOne({ id: process.env.FUEL_STATION_MANAGER })
        // const fuelStation = await FuelStation.findById(fuelStationId)
        // const user = await Manager.signup(firstName, lastName, contactNumber, email, password, fuelStation, userType)
        // res.status(200).json({ user })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleLogout = async (req, res) => {

}

// Handle new access token
const handleNewAccessToken = async (req, res) => {
    console.log("requesting new access token");

    const cookies = req.cookies;
    // const cookies = req.cookies;
    console.log("cookiee value :", cookies);


    if (!cookies?.jwt) {
        console.log("invalid refresh token :", cookies?.jwt);

        return res.status(401).json({ "message": "Invalid token" });
    }

    const refresh_token = cookies.jwt;

    // const auth = await prisma.Auth.findUnique({
    //     where: {
    //         refresh_token
    //     }
    // });

    if (!auth) {
        console.log("invalid refresh token :", refresh_token);
        return res.status(403).json({ "message": "Invalid token" });
    }

    const authObject = await getAuthObject(auth);

    jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            console.log('decoded ', decoded);
            console.log('auth ', auth);
            if (err || auth.user_id !== decoded.user_id) {
                console.log("requesting new access token failed invalid token")
                return res.status(403).json({ "message": "Invalid token" });
            }

            // FIXME: check if need to update refresh token also
            const access_token = token.getAccessToken(authObject);
            console.log("new access token getting sucessfully")
            return res.status(200).json({
                "message": "Refresh token successful",
                "access_token": access_token,
            });
        })
}

// ....................HELPER FUNCTIONS..........................

// Generate and send OTP
const generateAndSendOtp = async (email) => {
    const otp = generateOTP();
    const result = await OTP.create({ email, otp })
    // OTP reset after 1min timeout
    // setTimeout(() => {
    //     generated_otp = null
    // }, 60000)
    const mail_status = await sendRegOtpMail({ to: email, OTP: otp });
    return ({ result, mail_status })
}

// Get JWT auth object
const getAuthObject = (auth) => {
    return {
        id: auth.id,
        user_type: auth.userType.type,
    }
}

//Create and save JWT auth tokens
const createAndSaveTokens = (result) => {
    const authObject = getAuthObject(result)
    const access_token = token.getAccessToken(authObject);
    const refresh_token = token.getRefreshToken(authObject);

    return ({ authObject, access_token, refresh_token })
}

module.exports = {
    handleEmailExistance,
    handleRegister,
    handleLoginVehicleOwner,
    handleLogout,
    handleLoginAfterOTP,
    handleAdminLogin,
    handleAdminSignup,
    handleManagerLogin,
    handleManagerSignup,
    handleNewAccessToken
}