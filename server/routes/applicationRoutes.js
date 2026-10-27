const express = require("express");
const router = express.Router();

const {
    applyJob,
    getMyApplications,
    getCompanyApplications,
    updateApplicationStatus
} = require("../controllers/applicationController");

const {
    getApplicationResume,
    requireStudentResume
} = require("../controllers/resumeController");

const authMiddleware = require("../middleware/authMiddleware");
const verifyToken = authMiddleware;
const authorizeRoles = authMiddleware.authorizeRoles;

router.post(
    "/apply",
    verifyToken,
    authorizeRoles("student"),
    requireStudentResume,
    applyJob
);

router.get(
    "/student/:id",
    verifyToken,
    authorizeRoles("student"),
    getMyApplications
);

router.get(
    "/company/:id",
    verifyToken,
    authorizeRoles("company"),
    getCompanyApplications
);

router.put(
    "/status/:id",
    verifyToken,
    authorizeRoles("company"),
    updateApplicationStatus
);

router.get(
    "/:id/resume",
    verifyToken,
    authorizeRoles("company", "admin"),
    getApplicationResume
);

module.exports = router;