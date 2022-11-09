const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log("========================");
        console.log(req);
        if (!req.user_id) {
            return res.status(401).json({ message: "User id is missing." });
        }

        const userRole = req.role
        const isAllow = allowedRoles.includes(userRole)

        console.log("allowedRoles", allowedRoles)
        console.log("user role", userRole)


        if (!isAllow) {
            console.log("not allowed role")
            return res.status(401).json({ message: "Unauthorized request user not allowed" });
        }
        next()
    }
}

module.exports = verifyRoles;