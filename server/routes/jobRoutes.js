
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

// AI matching controller — new addition
const {
    getRecommendedJobs
} = require("../controllers/aiMatchingController");


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
// AI-ASSISTED JOB RECOMMENDATIONS
// =====================================================
// Authenticated students only

router.get(
    "/recommended",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    getRecommendedJobs
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
