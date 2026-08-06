const db = require("../config/db");

// ================= Apply Job =================

const applyJob = (req, res) => {

    const { student_id, job_id } = req.body;

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

// ================= My Applications =================

const getMyApplications = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            applications.id,
            applications.applied_at,
            jobs.job_title,
            jobs.location,
            jobs.salary,
            companies.company_name
        FROM applications

        INNER JOIN jobs
        ON applications.job_id = jobs.id

        INNER JOIN companies
        ON jobs.company_id = companies.id

        WHERE applications.student_id = ?

        ORDER BY applications.applied_at DESC
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.status(200).json(result);

    });

};

// ================= Export =================

module.exports = {
    applyJob,
    getMyApplications
};