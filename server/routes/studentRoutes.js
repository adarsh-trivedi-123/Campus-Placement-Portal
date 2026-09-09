const express = require("express");

const router = express.Router();

const {

    registerStudent,
    loginStudent

} = require("../controllers/studentController");


// =====================================================
// STUDENT REGISTRATION
// =====================================================

router.post(
    "/register",
    registerStudent
);


// =====================================================
// STUDENT LOGIN
// =====================================================

router.post(
    "/login",
    loginStudent
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;