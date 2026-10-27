const express = require("express");
const router = express.Router();

const {
    registerStudent,
    loginStudent,
    getStudentProfile,
    updateStudentSkills
} = require("../controllers/studentController");

const {
    uploadOwnResume,
    getOwnResumeStatus,
    getOwnResumeFile
} = require("../controllers/resumeController");

const { uploadResume } = require("../middleware/resumeUpload");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.get(
    "/profile",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    getStudentProfile
);

router.put(
    "/skills",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    updateStudentSkills
);

router.post(
    "/resume",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    uploadResume,
    uploadOwnResume
);

router.get(
    "/resume/status",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    getOwnResumeStatus
);

router.get(
    "/resume/file",
    authMiddleware,
    authMiddleware.authorizeRoles("student"),
    getOwnResumeFile
);

module.exports = router;