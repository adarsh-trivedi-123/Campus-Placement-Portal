const express = require("express");

const router = express.Router();

const {
    registerCompany,
    loginCompany,
    getApplicants
} = require("../controllers/companyController");

const verifyToken =
    require("../middleware/authMiddleware");


// =====================================================
// COMPANY REGISTRATION
// =====================================================

router.post(
    "/register",
    registerCompany
);


// =====================================================
// COMPANY LOGIN
// =====================================================

router.post(
    "/login",
    loginCompany
);


// =====================================================
// VIEW APPLICANTS
// =====================================================

router.get(
    "/applicants/:id",
    verifyToken,
    getApplicants
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;