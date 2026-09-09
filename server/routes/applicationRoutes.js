const express = require("express");

const router = express.Router();

const {

    applyJob,

    getMyApplications,

    getCompanyApplications,

    updateApplicationStatus

} = require("../controllers/applicationController");


const authMiddleware =
    require("../middleware/authMiddleware");

const verifyToken =
    authMiddleware;

const authorizeRoles =
    authMiddleware.authorizeRoles;


// =====================================================
// APPLY JOB
// Only Student
// =====================================================

router.post(

    "/apply",

    verifyToken,

    authorizeRoles("student"),

    applyJob

);


// =====================================================
// MY APPLICATIONS
// Only Student
// =====================================================

router.get(

    "/student/:id",

    verifyToken,

    authorizeRoles("student"),

    getMyApplications

);


// =====================================================
// COMPANY APPLICATIONS
// Only Company
// =====================================================

router.get(

    "/company/:id",

    verifyToken,

    authorizeRoles("company"),

    getCompanyApplications

);


// =====================================================
// UPDATE APPLICATION STATUS
// Only Company
// =====================================================

router.put(

    "/status/:id",

    verifyToken,

    authorizeRoles("company"),

    updateApplicationStatus

);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;