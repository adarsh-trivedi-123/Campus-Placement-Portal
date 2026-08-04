const db = require("../config/db");

// ================= Post Job =================

const postJob = (req, res) => {

    const {
        company_id,
        job_title,
        job_description,
        location,
        salary,
        eligibility,
        last_date
    } = req.body;

    const sql = `
        INSERT INTO jobs
        (company_id, job_title, job_description, location, salary, eligibility, last_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            company_id,
            job_title,
            job_description,
            location,
            salary,
            eligibility,
            last_date
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Job Posting Failed"
                });

            }

            res.status(201).json({
                success: true,
                message: "Job Posted Successfully"
            });

        }
    );

};

// ================= View All Jobs =================

const getAllJobs = (req, res) => {

    const sql = `
        SELECT
            jobs.*,
            companies.company_name
        FROM jobs
        INNER JOIN companies
            ON jobs.company_id = companies.id
        ORDER BY jobs.id DESC
    `;

    db.query(sql, (err, result) => {

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
    postJob,
    getAllJobs
};