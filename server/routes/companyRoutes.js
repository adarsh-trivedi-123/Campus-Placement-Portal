const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    registerCompany,
    loginCompany,
    getApplicants
} = require("../controllers/companyController");

// Public Routes
router.post("/register", registerCompany);
router.post("/login", loginCompany);

// Protected Route
router.get("/applicants/:id", verifyToken, getApplicants);

module.exports = router;