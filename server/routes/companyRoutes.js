const express = require("express");

const router = express.Router();

const {
    registerCompany,
    loginCompany
} = require("../controllers/companyController");

// Company Registration
router.post("/register", registerCompany);

// Company Login
router.post("/login", loginCompany);

module.exports = router;