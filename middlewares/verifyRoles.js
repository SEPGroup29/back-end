const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user_id) {
            // console.log("User id is missing.")
            return res.status(401).json({ message: "User id is missing." });
        }

        const userRole = req.role
        // console.log("User role:", userRole);
        // console.log("Allowed roles", allowedRoles);
        const isAllow = allowedRoles.includes(userRole)

        // console.log("allowedRoles", allowedRoles)
        // console.log("user role", userRole)


        if (!isAllow) {
            // console.log("not allowed role")
            return res.status(401).json({ message: "Unauthorized request user not allowed" });
        }
        next()
    }
}

module.exports = verifyRoles;