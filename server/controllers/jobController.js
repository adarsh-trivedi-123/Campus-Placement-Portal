const db = require("../config/db");


// =====================================================
// POST NEW JOB
// =====================================================

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


    // =================================================
    // CHECK REQUIRED FIELDS
    // =================================================

    if (
        !company_id ||
        !job_title ||
        !job_description ||
        !location ||
        !salary ||
        !eligibility ||
        !last_date
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All job fields are required"

        });

    }


    // =================================================
    // SECURITY CHECK
    // =================================================
    // Logged-in company can only post
    // jobs for its own company

    if (
        !req.user ||
        req.user.role !== "company"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Only companies can post jobs"

        });

    }


    if (
        Number(req.user.id) !==
        Number(company_id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "You can only post jobs for your own company"

        });

    }


    // =================================================
    // INSERT JOB
    // =================================================

    const sql = `

        INSERT INTO jobs
        (
            company_id,
            job_title,
            job_description,
            location,
            salary,
            eligibility,
            last_date
        )

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

                console.error(
                    "Post Job Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to Post Job"

                });

            }


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Job Posted Successfully",

                job_id:
                    result.insertId

            });

        }

    );

};


// =====================================================
// GET ALL JOBS
// =====================================================

const getAllJobs = (req, res) => {

    const sql = `

        SELECT

            jobs.id,

            jobs.company_id,

            jobs.job_title,

            jobs.job_description,

            jobs.location,

            jobs.salary,

            jobs.eligibility,

            jobs.last_date,

            companies.company_name

        FROM jobs

        INNER JOIN companies

        ON jobs.company_id =
           companies.id

        ORDER BY jobs.id DESC

    `;


    db.query(

        sql,

        (err, result) => {

            if (err) {

                console.error(
                    "Get Jobs Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.status(200).json(
                result
            );

        }

    );

};


// =====================================================
// GET COMPANY JOBS
// =====================================================

const getCompanyJobs = (req, res) => {

    const {
        id
    } = req.params;


    // =================================================
    // SECURITY CHECK
    // =================================================

    if (
        !req.user ||
        req.user.role !== "company"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Only companies can access company jobs"

        });

    }


    if (
        Number(req.user.id) !==
        Number(id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Access Denied"

        });

    }


    // =================================================
    // GET JOBS
    // =================================================

    const sql = `

        SELECT

            id,
            company_id,
            job_title,
            job_description,
            location,
            salary,
            eligibility,
            last_date

        FROM jobs

        WHERE company_id = ?

        ORDER BY id DESC

    `;


    db.query(

        sql,

        [id],

        (err, result) => {

            if (err) {

                console.error(
                    "Get Company Jobs Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.status(200).json(
                result
            );

        }

    );

};


// =====================================================
// DELETE JOB
// =====================================================

const deleteJob = (req, res) => {

    const {
        id
    } = req.params;


    // =================================================
    // CHECK JOB
    // =================================================

    const checkSql = `

        SELECT company_id

        FROM jobs

        WHERE id = ?

    `;


    db.query(

        checkSql,

        [id],

        (err, result) => {

            if (err) {

                console.error(
                    "Check Job Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            // =================================================
            // JOB NOT FOUND
            // =================================================

            if (
                result.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job Not Found"

                });

            }


            const jobCompanyId =
                result[0].company_id;


            // =================================================
            // ONLY COMPANY CAN DELETE
            // =================================================

            if (
                !req.user ||
                req.user.role !== "company"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only companies can delete jobs"

                });

            }


            // =================================================
            // CHECK JOB OWNER
            // =================================================

            if (
                Number(req.user.id) !==
                Number(jobCompanyId)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete your own jobs"

                });

            }


            // =================================================
            // DELETE APPLICATIONS FIRST
            // =================================================

            const deleteApplicationsSql = `

                DELETE FROM applications

                WHERE job_id = ?

            `;


            db.query(

                deleteApplicationsSql,

                [id],

                (err) => {

                    if (err) {

                        console.error(
                            "Delete Applications Error:",
                            err
                        );


                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to delete applications"

                        });

                    }


                    // =================================================
                    // DELETE JOB
                    // =================================================

                    const deleteJobSql = `

                        DELETE FROM jobs

                        WHERE id = ?

                    `;


                    db.query(

                        deleteJobSql,

                        [id],

                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Delete Job Error:",
                                    err
                                );


                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to delete job"

                                });

                            }


                            if (
                                result.affectedRows === 0
                            ) {

                                return res.status(404).json({

                                    success: false,

                                    message:
                                        "Job Not Found"

                                });

                            }


                            // =================================================
                            // SUCCESS
                            // =================================================

                            return res.status(200).json({

                                success: true,

                                message:
                                    "Job Deleted Successfully"

                            });

                        }

                    );

                }

            );

        }

    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    postJob,
    getAllJobs,
    getCompanyJobs,
    deleteJob

};