const express = require("express");

const router = express.Router();

const {
    applyJob,
    getMyApplications
} = require("../controllers/applicationController");

// Apply Job
router.post("/apply", applyJob);

// My Applications
router.get("/student/:id", getMyApplications);

module.exports = router;