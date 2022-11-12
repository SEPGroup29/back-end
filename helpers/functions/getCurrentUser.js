const User = require("../../models/userModel")

const getCurrentUser = async (req) => {
    const refreshToken = req.cookies.jwt
    const user = await User.findOne({ refreshToken }).populate('userType')
    if (!user) {
        return false
    }
    return user
}

module.exports = {
    getCurrentUser
}