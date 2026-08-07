const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    postJob,
    getAllJobs,
    getCompanyJobs,
    deleteJob
} = require("../controllers/jobController");

// Public Route - View All Jobs
router.get("/", getAllJobs);

// Protected Route - Post Job
router.post("/post", verifyToken, postJob);

// Protected Route - Company Jobs
router.get("/company/:id", verifyToken, getCompanyJobs);

// Protected Route - Delete Job
router.delete("/:id", verifyToken, deleteJob);

module.exports = router;