const express = require("express");
const router = express.Router();
const {
    registerStudent,
    loginStudent
} = require("../controllers/studentController");

// Student Registration
router.post("/register", registerStudent);
// Student Login
router.post("/login", loginStudent);

module.exports = router;