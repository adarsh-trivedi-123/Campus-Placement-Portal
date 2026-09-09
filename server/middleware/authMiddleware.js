const jwt = require("jsonwebtoken");

// =====================================================
// VERIFY JWT TOKEN
// =====================================================

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "Access Denied. No Token Provided."
        });

    }

    const parts = authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        return res.status(401).json({
            success: false,
            message: "Invalid Authorization Format"
        });

    }

    const token = parts[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "JWT Error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }

};


// =====================================================
// ROLE CHECK
// =====================================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication Required"
            });

        }

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Access Denied. You do not have permission."
            });

        }

        next();

    };

};


// =====================================================
// EXPORT
// =====================================================

// Direct export of verifyToken
module.exports = verifyToken;

// Also make authorizeRoles available
module.exports.authorizeRoles = authorizeRoles;