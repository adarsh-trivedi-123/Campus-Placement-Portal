const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { resumeDirectory } = require("../middleware/resumeUpload");

function getSafeResumePath(filename) {
    if (!filename || path.basename(filename) !== filename) {
        return null;
    }

    const fullPath = path.resolve(resumeDirectory, filename);
    const basePath = path.resolve(resumeDirectory) + path.sep;

    if (!fullPath.startsWith(basePath)) {
        return null;
    }

    return fullPath;
}

function sendResumeFile(res, filename) {
    const filePath = getSafeResumePath(filename);

    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: "Resume file was not found."
        });
    }

    return res.sendFile(filePath, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="resume.pdf"',
            "X-Content-Type-Options": "nosniff"
        }
    });
}

function uploadOwnResume(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please select a PDF resume."
        });
    }

    const studentId = req.user.id;
    const newFilename = req.file.filename;

    db.query(
        "SELECT resume_path FROM students WHERE id = ?",
        [studentId],
        (selectError, rows) => {
            if (selectError) {
                console.error("Resume lookup error:", selectError);
                fs.promises.unlink(req.file.path).catch(() => {});

                return res.status(500).json({
                    success: false,
                    message: "Could not save resume."
                });
            }

            if (!rows || rows.length === 0) {
                fs.promises.unlink(req.file.path).catch(() => {});

                return res.status(404).json({
                    success: false,
                    message: "Student account was not found."
                });
            }

            const oldFilename = rows[0].resume_path;

            db.query(
                "UPDATE students SET resume_path = ? WHERE id = ?",
                [newFilename, studentId],
                (updateError, result) => {
                    if (updateError || !result || result.affectedRows === 0) {
                        console.error("Resume save error:", updateError);
                        fs.promises.unlink(req.file.path).catch(() => {});

                        return res.status(500).json({
                            success: false,
                            message: "Could not save resume."
                        });
                    }

                    if (oldFilename && oldFilename !== newFilename) {
                        const oldPath = getSafeResumePath(oldFilename);

                        if (oldPath) {
                            fs.promises.unlink(oldPath).catch(() => {});
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Resume uploaded successfully.",
                        fileName: "resume.pdf"
                    });
                }
            );
        }
    );
}

function getOwnResumeStatus(req, res) {
    db.query(
        "SELECT resume_path FROM students WHERE id = ?",
        [req.user.id],
        (error, rows) => {
            if (error) {
                console.error("Resume status error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Could not check resume status."
                });
            }

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student account was not found."
                });
            }

            const filename = rows[0].resume_path;
            const filePath = filename ? getSafeResumePath(filename) : null;
            const hasResume = Boolean(
                filePath && fs.existsSync(filePath)
            );

            return res.json({
                success: true,
                hasResume,
                fileName: hasResume ? "resume.pdf" : null
            });
        }
    );
}

function getOwnResumeFile(req, res) {
    db.query(
        "SELECT resume_path FROM students WHERE id = ?",
        [req.user.id],
        (error, rows) => {
            if (error) {
                console.error("Resume file lookup error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Could not retrieve resume."
                });
            }

            if (!rows || rows.length === 0 || !rows[0].resume_path) {
                return res.status(404).json({
                    success: false,
                    message: "Please upload your resume first."
                });
            }

            return sendResumeFile(res, rows[0].resume_path);
        }
    );
}

function requireStudentResume(req, res, next) {
    db.query(
        "SELECT resume_path FROM students WHERE id = ?",
        [req.user.id],
        (error, rows) => {
            if (error) {
                console.error("Apply resume check error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Could not verify your resume."
                });
            }

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student account was not found."
                });
            }

            const filename = rows[0].resume_path;
            const filePath = filename ? getSafeResumePath(filename) : null;

            if (!filePath || !fs.existsSync(filePath)) {
                return res.status(400).json({
                    success: false,
                    message: "Upload your PDF resume before applying for a job."
                });
            }

            next();
        }
    );
}

function getApplicationResume(req, res) {
    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid application ID."
        });
    }

    const sql = `
        SELECT s.resume_path, j.company_id
        FROM applications a
        JOIN students s ON s.id = a.student_id
        JOIN jobs j ON j.id = a.job_id
        WHERE a.id = ?
        LIMIT 1
    `;

    db.query(sql, [applicationId], (error, rows) => {
        if (error) {
            console.error("Application resume lookup error:", error);

            return res.status(500).json({
                success: false,
                message: "Could not retrieve application resume."
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Application was not found."
            });
        }

        const application = rows[0];

        if (
            req.user.role === "company" &&
            String(application.company_id) !== String(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot view resumes for another company's jobs."
            });
        }

        if (!application.resume_path) {
            return res.status(404).json({
                success: false,
                message: "The student has not uploaded a resume."
            });
        }

        return sendResumeFile(res, application.resume_path);
    });
}

module.exports = {
    uploadOwnResume,
    getOwnResumeStatus,
    getOwnResumeFile,
    requireStudentResume,
    getApplicationResume
};