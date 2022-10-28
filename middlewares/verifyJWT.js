const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    console.log('JWT verification...');

    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('authHeader', authHeader);


    if (!authHeader?.startsWith('Bearer ')) {
        console.log('Invalid token VERIFYJWT : ', authHeader);
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid token" });
            }
            req.user_id = decoded.user_id;
            req.user_type = decoded.user_type;
            console.log('JWT verified...');
            console.log("decoded :", decoded)
            next();
        }
    )
}

module.exports = verifyJWT;