const express = require("express");

const router = express.Router();


// =====================================================
// JOB CONTROLLER
// =====================================================

const {
    postJob,
    getAllJobs,
    getCompanyJobs,
    deleteJob
} = require("../controllers/jobController");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware =
    require("../middleware/authMiddleware");


// =====================================================
// GET ALL JOBS
// =====================================================
// Public route
// Students can see available jobs

router.get(
    "/",
    getAllJobs
);


// =====================================================
// POST NEW JOB
// =====================================================
// Company must be logged in

router.post(
    "/",
    authMiddleware,
    postJob
);


// =====================================================
// GET COMPANY JOBS
// =====================================================
// Company can see its own jobs

router.get(
    "/company/:id",
    authMiddleware,
    getCompanyJobs
);


// =====================================================
// DELETE JOB
// =====================================================
// Company can delete its own job

router.delete(
    "/:id",
    authMiddleware,
    deleteJob
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;