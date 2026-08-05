const db = require("../config/db");

// ================= Apply Job =================

const applyJob = (req, res) => {

    const { student_id, job_id } = req.body;

    // Check if already applied
    const checkSql = `
        SELECT * FROM applications
        WHERE student_id = ? AND job_id = ?
    `;

    db.query(checkSql, [student_id, job_id], (err, result) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Already Applied"
            });

        }

        const insertSql = `
            INSERT INTO applications(student_id, job_id)
            VALUES (?, ?)
        `;

        db.query(insertSql, [student_id, job_id], (err) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Application Failed"
                });

            }

            res.status(201).json({
                success: true,
                message: "Application Submitted Successfully"
            });

        });

    });

};

module.exports = {
    applyJob
};