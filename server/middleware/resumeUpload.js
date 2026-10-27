const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const resumeDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    "resumes"
);

if (!fs.existsSync(resumeDirectory)) {
    fs.mkdirSync(resumeDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, resumeDirectory);
    },

    filename: (req, file, callback) => {
        const studentId = String(req.user?.id || "student")
            .replace(/[^a-zA-Z0-9_-]/g, "");

        const unique =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

        callback(
            null,
            `student-${studentId}-${unique}.pdf`
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, callback) => {
        const isPdfExtension =
            path.extname(file.originalname || "").toLowerCase() === ".pdf";

        const isPdfMimeType =
            file.mimetype === "application/pdf";

        if (!isPdfExtension || !isPdfMimeType) {
            const error = new Error("Only PDF resumes are allowed.");
            error.statusCode = 400;
            return callback(error);
        }

        callback(null, true);
    }
}).single("resume");

function uploadResume(req, res, next) {
    upload(req, res, (error) => {
        if (!error) {
            return next();
        }

        const statusCode =
            error.statusCode ||
            (error instanceof multer.MulterError ? 400 : 500);

        return res.status(statusCode).json({
            success: false,
            message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "Resume must be 5 MB or smaller."
                    : error.message || "Resume upload failed."
        });
    });
}

module.exports = {
    uploadResume,
    resumeDirectory
};