const express = require("express");

const router = express.Router();


// =====================================================
// ADMIN CONTROLLER
// =====================================================

const {
    loginAdmin,

    getStats,

    getStudents,
    deleteStudent,

    getCompanies,
    deleteCompany,

    getJobs,
    deleteJob,

    getApplications,
    deleteApplication

} = require("../controllers/adminController");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware =
    require("../middleware/authMiddleware");


// verifyToken
const verifyToken =
    authMiddleware;


// authorizeRoles
const authorizeRoles =
    authMiddleware.authorizeRoles;


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
    "/login",
    loginAdmin
);


// =====================================================
// ADMIN AUTHORIZATION
// =====================================================

const adminAuth = [
    verifyToken,
    authorizeRoles("admin")
];


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

router.get(
    "/stats",
    ...adminAuth,
    getStats
);


// =====================================================
// STUDENTS
// =====================================================

router.get(
    "/students",
    ...adminAuth,
    getStudents
);


router.delete(
    "/students/:id",
    ...adminAuth,
    deleteStudent
);


// =====================================================
// COMPANIES
// =====================================================

router.get(
    "/companies",
    ...adminAuth,
    getCompanies
);


router.delete(
    "/companies/:id",
    ...adminAuth,
    deleteCompany
);


// =====================================================
// JOBS
// =====================================================

router.get(
    "/jobs",
    ...adminAuth,
    getJobs
);


router.delete(
    "/jobs/:id",
    ...adminAuth,
    deleteJob
);


// =====================================================
// APPLICATIONS
// =====================================================

router.get(
    "/applications",
    ...adminAuth,
    getApplications
);


router.delete(
    "/applications/:id",
    ...adminAuth,
    deleteApplication
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;