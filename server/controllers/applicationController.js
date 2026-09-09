const db = require("../config/db");


// =====================================================
// APPLY JOB
// =====================================================

const applyJob = (req, res) => {

    const {
        student_id,
        job_id
    } = req.body;


    // Student ID must match JWT

    if (
        Number(student_id) !==
        Number(req.user.id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "You can only apply using your own account"

        });

    }


    if (!job_id) {

        return res.status(400).json({

            success: false,

            message:
                "Job ID is required"

        });

    }


    // Check student

    const studentSql = `

        SELECT id

        FROM students

        WHERE id = ?

    `;


    db.query(
        studentSql,
        [student_id],
        (err, studentResult) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                studentResult.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student Not Found"

                });

            }


            // Check job

            const jobSql = `

                SELECT id

                FROM jobs

                WHERE id = ?

            `;


            db.query(
                jobSql,
                [job_id],
                (err, jobResult) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Database Error"

                        });

                    }


                    if (
                        jobResult.length === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message:
                                "Job Not Found"

                        });

                    }


                    // Duplicate check

                    const checkSql = `

                        SELECT id

                        FROM applications

                        WHERE student_id = ?
                        AND job_id = ?

                    `;


                    db.query(
                        checkSql,
                        [student_id, job_id],
                        (err, result) => {

                            if (err) {

                                console.error(err);

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Database Error"

                                });

                            }


                            if (
                                result.length > 0
                            ) {

                                return res.status(400).json({

                                    success: false,

                                    message:
                                        "You have already applied for this job"

                                });

                            }


                            const insertSql = `

                                INSERT INTO applications
                                (
                                    student_id,
                                    job_id,
                                    status
                                )

                                VALUES
                                (?, ?, 'Applied')

                            `;


                            db.query(
                                insertSql,
                                [
                                    student_id,
                                    job_id
                                ],
                                (err) => {

                                    if (err) {

                                        console.error(err);

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Application Failed"

                                        });

                                    }


                                    res.status(201).json({

                                        success: true,

                                        message:
                                            "Application Submitted Successfully"

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};


// =====================================================
// GET MY APPLICATIONS
// =====================================================

const getMyApplications = (req, res) => {

    const {
        id
    } = req.params;


    // Student can only see
    // their own applications

    if (
        Number(id) !==
        Number(req.user.id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "You can only view your own applications"

        });

    }


    const sql = `

        SELECT

            applications.id,

            applications.job_id,

            applications.status,

            applications.applied_at,

            jobs.job_title,

            jobs.location,

            jobs.salary,

            companies.company_name

        FROM applications

        INNER JOIN jobs

        ON applications.job_id =
           jobs.id

        INNER JOIN companies

        ON jobs.company_id =
           companies.id

        WHERE applications.student_id = ?

        ORDER BY applications.applied_at DESC

    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            res.status(200).json(result);

        }
    );

};


// =====================================================
// GET COMPANY APPLICATIONS
// =====================================================

const getCompanyApplications = (req, res) => {

    const {
        id
    } = req.params;


    // Company can only see
    // applications for its own jobs

    if (
        Number(id) !==
        Number(req.user.id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "You can only view applications for your own company"

        });

    }


    const sql = `

        SELECT

            applications.id,

            applications.status,

            applications.applied_at,

            students.id AS student_id,

            students.full_name,

            students.email,

            students.phone,

            students.course,

            jobs.id AS job_id,

            jobs.job_title

        FROM applications

        INNER JOIN jobs

        ON applications.job_id =
           jobs.id

        INNER JOIN students

        ON applications.student_id =
           students.id

        WHERE jobs.company_id = ?

        ORDER BY applications.applied_at DESC

    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            res.status(200).json(result);

        }
    );

};


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

const updateApplicationStatus = (req, res) => {

    const {
        id
    } = req.params;


    const {
        status
    } = req.body;


    const allowedStatuses = [

        "Applied",
        "Shortlisted",
        "Rejected",
        "Selected"

    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid Application Status"

        });

    }


    // First find the company
    // that owns this application

    const checkSql = `

        SELECT

            jobs.company_id

        FROM applications

        INNER JOIN jobs

        ON applications.job_id =
           jobs.id

        WHERE applications.id = ?

    `;


    db.query(
        checkSql,
        [id],
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                result.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application Not Found"

                });

            }


            const companyId =
                result[0].company_id;


            // Company can update
            // only its own applications

            if (
                Number(companyId) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only update applications for your own jobs"

                });

            }


            const updateSql = `

                UPDATE applications

                SET status = ?

                WHERE id = ?

            `;


            db.query(
                updateSql,
                [status, id],
                (err, updateResult) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Database Error"

                        });

                    }


                    if (
                        updateResult.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message:
                                "Application Not Found"

                        });

                    }


                    res.status(200).json({

                        success: true,

                        message:
                            "Application Status Updated Successfully"

                    });

                }
            );

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    applyJob,
    getMyApplications,
    getCompanyApplications,
    updateApplicationStatus

};