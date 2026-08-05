const express = require("express");

const router = express.Router();

const {
    postJob,
    getAllJobs,
    getCompanyJobs,
    deleteJob
} = require("../controllers/jobController");

// Post Job
router.post("/post", postJob);

// View All Jobs
router.get("/", getAllJobs);

// Company Jobs
router.get("/company/:id", getCompanyJobs);

// Delete Job
router.delete("/:id", deleteJob);

module.exports = router;