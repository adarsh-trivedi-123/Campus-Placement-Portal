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
        (err) => {

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
        SELECT jobs.*, companies.company_name
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

        res.json(result);

    });

};

// ================= Company Jobs =================

const getCompanyJobs = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM jobs
        WHERE company_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json(result);

    });

};

// ================= Delete Job =================

const deleteJob = (req, res) => {

    const { id } = req.params;

    db.query(
        "DELETE FROM jobs WHERE id=?",
        [id],
        (err) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Delete Failed"
                });

            }

            res.json({
                success: true,
                message: "Job Deleted Successfully"
            });

        }
    );

};

// ================= Export =================

module.exports = {
    postJob,
    getAllJobs,
    getCompanyJobs,
    deleteJob
};