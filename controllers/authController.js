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
const { sendLoginOtpMail } = require('../services/mail/login_otp_mail');
const jwt = require('jsonwebtoken')
const token = require('../utils/token');
require('dotenv').config();
const bcrypt = require('bcrypt');
const ObjectId = require('mongoose').Types.ObjectId;


// Functions 

// Check already exisiting email
const handleEmailExistance = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.VEHICLE_OWNER) {
            res.status(200).json({ result: 'Email already exists' })
        } else {
            const { result, mail_status } = await generateAndSendOtp(email, 'Registration')
            if (result && mail_status)
                res.status(200).json({ result: 'Sent' })
            else {
                res.status(200).json({ result: 'OTP generation error' })
                console.log("Else")
            }
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

                    //Deleting any otp entry related to this email from otp collection.(For better security and consistency)
                    const otp = await OTP.deleteMany({ email })

                    res.status(200).json({ user, vehicleOwner })
                } catch (error) {
                    res.status(400).json({ error: error.message })
                }
            } else {
                res.status(200).json({ error: 'Invalid OTP' })
            }
        } else {
            res.status(200).json({ error: 'Invalid OTP' })
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
            const { result, mail_status } = await generateAndSendOtp(email, 'Login')
            if (result && mail_status)
                // res.status(200).json({ result: 'Sent' }) 
                res.status(200).json({ result: 'sent' });
            else
                res.status(200).json({ error: 'OTP generation error' })
        } else {
            res.status(200).json({ error: 'Email not found' })
        }

    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}

const handleLoginAfterOTP = async (req, res) => {
    const { email, entered_otp } = req.body
    try {
        const otp = await OTP.findOne({ email })
        if (otp) {
            // OTP check
            if (entered_otp === otp.otp) {
                const user = await User.findOne({ email }).populate('userType');
                if (user) {
                    const { authObject, access_token, refresh_token } = await getLoginData(user, email)

                    // Set to cookie
                    res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                    //Deleting any otp entry related to this email from otp collection.(For better security and consistency)
                    const delOtp = await OTP.deleteMany({ email })

                    return res.status(200).json({
                        message: "Login successful",
                        auth_object: authObject,
                        access_token
                    });
                } else {
                    res.status(200).json({ error: 'User not found' })
                }
            } else {
                res.status(200).json({ error: 'Invalid OTP' })
            }
        } else {
            res.status(200).json({ error: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handleAdminLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.ADMIN) {
            const admin = await Admin.findOne({ user: user._id })
            // console.log(user);
            // console.log(admin);
            const match = await bcrypt.compare(password, admin.password)
            if (match) {
                const { authObject, access_token, refresh_token } = await getLoginData(user, email)
                console.log({ authObject, access_token, refresh_token });

                // Set to cookie
                res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                res.status(200).json({
                    message: "Login successful",
                    auth_object: authObject,
                    access_token
                });
            } else {
                res.status(200).json({ error: 'Incorrect Password' })
            }
        } else {
            res.status(200).json({ error: 'Email not found' })
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
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.FUEL_STATION_MANAGER) {
            const manager = await Manager.findOne({ user: user._id })
            const match = await bcrypt.compare(password, manager.password)
            if (match) {
                const { authObject, access_token, refresh_token } = await getLoginData(user, email)

                // Set to cookie
                res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                res.status(200).json({
                    message: "Login successful",
                    auth_object: authObject,
                    access_token
                });
            } else {
                res.status(200).json({ error: 'Incorrect Password' })
            }
        } else {
            res.status(200).json({ error: 'Email not found' })
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

const handlePumpOperatorLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.PUMP_OPERATOR) {
            const pumpOperator = await PumpOperator.findOne({ user: user._id })
            const match = await bcrypt.compare(password, pumpOperator.password)
            if (match) {
                const { authObject, access_token, refresh_token } = await getLoginData(user, email)

                // Set to cookie
                res.cookie('jwt', refresh_token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                res.status(200).json({
                    message: "Login successful",
                    auth_object: authObject,
                    access_token
                });
            } else {
                res.status(200).json({ error: 'Incorrect Password' })
            }
        } else {
            res.status(200).json({ error: 'Email not found' })
        }



    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const handlePumpOperatorSignup = async (req, res) => {
    const { email, firstName, lastName, contactNumber, password, fuelStationId } = req.body

    try {
        // Check for existance
        const user = await User.findOne({ email }).populate('userType');
        if (user && user.userType.id == process.env.PUMP_OPERATOR) {
            res.status(200).json({ error: 'Email already exists' })
        } else {
            // Check fuel station
            if (ObjectId.isValid(fuelStationId)) {
                const fs = await FuelStation.findOne({ _id: fuelStationId })
                if (fs) {
                    // Password encryption
                    const salt = await bcrypt.genSalt(10)
                    const hash = await bcrypt.hash(password, salt)

                    // Enter to database
                    const userType = await UserTypes.findOne({ id: process.env.PUMP_OPERATOR })
                    const login = await Login.findOne({ loginType: process.env.PASSWORD_LOGIN })
                    const user = await User.create({ email: email, firstName, lastName, loginType: login._id, userType: userType._id })
                    const operator = await PumpOperator.create({ user: user._id, contactNumber, password: hash, fuelStationId })
                    res.status(200).json({ user, operator })
                } else {
                    res.status(200).json({ error: 'Fuel station not found' })
                }
            } else {
                res.status(200).json({ error: 'Fuel station not found' })
            }
        }
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
    console.log("cookiee value :", cookies);


    if (!cookies?.jwt) {
        console.log("invalid refresh token :", cookies?.jwt);

        return res.status(401).json({ "message": "Invalid token" });
    }

    const refreshToken = cookies.jwt;

    const auth = await User.find({ refreshToken }).populate('userType')

    if (!auth) {
        console.log("invalid refresh token :", refreshToken);
        return res.status(403).json({ "message": "Invalid token" });
    }

    const authObject = getAuthObject(auth);

    jwt.verify(
        refreshToken,
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


// .......................................HELPER FUNCTIONS...................................................

// Generate and send OTP
const generateAndSendOtp = async (email, type) => {
    const otp = generateOTP();
    const result = await OTP.create({ email, otp })
    let mail_status
    switch (type) {
        case 'Registration':
            mail_status = await sendRegOtpMail({ to: email, OTP: otp });
            break;
        case 'Login':
            mail_status = await sendLoginOtpMail({ to: email, OTP: otp });
            break;
        default:
            break;
    }
    return ({ result, mail_status })
}

// Get JWT auth object
const getAuthObject = (auth) => {
    return {
        id: auth._id,
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

// Get {authObject, access_token, refresh_token} at any user login
const getLoginData = async (user, email) => {
    const { authObject, access_token, refresh_token } = createAndSaveTokens(user)

    // Saving refresh token in database
    const result = await User.updateOne({ email }, { refreshToken: refresh_token })

    return ({
        authObject,
        access_token,
        refresh_token
    })
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
    handlePumpOperatorLogin,
    handlePumpOperatorSignup,
    handleNewAccessToken
}