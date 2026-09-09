const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =====================================================
// ADMIN LOGIN
// =====================================================

const loginAdmin = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {

            console.error("Admin Login Error:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid Email"
            });

        }

        try {

            const match = await bcrypt.compare(
                password,
                result[0].password
            );

            if (!match) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                });

            }

            const token = jwt.sign(

                {
                    id: result[0].id,
                    email: result[0].email,
                    role: "admin"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );

            res.status(200).json({

                success: true,

                message: "Admin Login Successful",

                token,

                admin: {

                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email

                }

            });

        } catch (error) {

            console.error(
                "Password Verification Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message: "Server Error"

            });

        }

    });

};


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

const getStats = (req, res) => {

    const sql = `

        SELECT

        (SELECT COUNT(*) FROM students)
        AS students,

        (SELECT COUNT(*) FROM companies)
        AS companies,

        (SELECT COUNT(*) FROM jobs)
        AS jobs,

        (SELECT COUNT(*) FROM applications)
        AS applications

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(
                "Stats Error:",
                err
            );

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        res.status(200).json({

            success: true,

            students:
                result[0].students,

            companies:
                result[0].companies,

            jobs:
                result[0].jobs,

            applications:
                result[0].applications

        });

    });

};


// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = (req, res) => {

    const sql = `

        SELECT

            id,
            full_name,
            email,
            phone,
            course

        FROM students

        ORDER BY id DESC

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(
                "Get Students Error:",
                err
            );

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        res.status(200).json(result);

    });

};


// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = (req, res) => {

    const { id } = req.params;

    const deleteApplicationsSql = `

        DELETE FROM applications

        WHERE student_id = ?

    `;

    db.query(
        deleteApplicationsSql,
        [id],
        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete student applications"

                });

            }

            const deleteStudentSql = `

                DELETE FROM students

                WHERE id = ?

            `;

            db.query(
                deleteStudentSql,
                [id],
                (err, result) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to delete student"

                        });

                    }

                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message:
                                "Student Not Found"

                        });

                    }

                    res.status(200).json({

                        success: true,

                        message:
                            "Student Deleted Successfully"

                    });

                }

            );

        }

    );

};


// =====================================================
// GET ALL COMPANIES
// =====================================================

const getCompanies = (req, res) => {

    const sql = `

        SELECT

            id,
            company_name,
            email,
            location

        FROM companies

        ORDER BY id DESC

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        res.status(200).json(result);

    });

};


// =====================================================
// DELETE COMPANY
// =====================================================

const deleteCompany = (req, res) => {

    const { id } = req.params;

    const deleteApplicationsSql = `

        DELETE applications

        FROM applications

        INNER JOIN jobs

        ON applications.job_id = jobs.id

        WHERE jobs.company_id = ?

    `;

    db.query(
        deleteApplicationsSql,
        [id],
        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete company applications"

                });

            }

            const deleteJobsSql = `

                DELETE FROM jobs

                WHERE company_id = ?

            `;

            db.query(
                deleteJobsSql,
                [id],
                (err) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to delete company jobs"

                        });

                    }

                    const deleteCompanySql = `

                        DELETE FROM companies

                        WHERE id = ?

                    `;

                    db.query(
                        deleteCompanySql,
                        [id],
                        (err, result) => {

                            if (err) {

                                console.error(err);

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to delete company"

                                });

                            }

                            if (
                                result.affectedRows === 0
                            ) {

                                return res.status(404).json({

                                    success: false,

                                    message:
                                        "Company Not Found"

                                });

                            }

                            res.status(200).json({

                                success: true,

                                message:
                                    "Company Deleted Successfully"

                            });

                        }

                    );

                }

            );

        }

    );

};


// =====================================================
// GET ALL JOBS
// =====================================================

const getJobs = (req, res) => {

    const sql = `

        SELECT

            jobs.id,
            jobs.job_title,
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

    db.query(sql, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        res.status(200).json(result);

    });

};


// =====================================================
// DELETE JOB
// =====================================================

const deleteJob = (req, res) => {

    const { id } = req.params;

    const deleteApplicationsSql = `

        DELETE FROM applications

        WHERE job_id = ?

    `;

    db.query(
        deleteApplicationsSql,
        [id],
        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete job applications"

                });

            }

            const deleteJobSql = `

                DELETE FROM jobs

                WHERE id = ?

            `;

            db.query(
                deleteJobSql,
                [id],
                (err, result) => {

                    if (err) {

                        console.error(err);

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

                    res.status(200).json({

                        success: true,

                        message:
                            "Job Deleted Successfully"

                    });

                }

            );

        }

    );

};


// =====================================================
// GET ALL APPLICATIONS
// =====================================================

const getApplications = (req, res) => {

    const sql = `

        SELECT

            applications.id,

            students.full_name,

            students.email,

            students.phone,

            students.course,

            companies.company_name,

            jobs.job_title,

            applications.applied_at

        FROM applications

        INNER JOIN students

        ON applications.student_id =
           students.id

        INNER JOIN jobs

        ON applications.job_id =
           jobs.id

        INNER JOIN companies

        ON jobs.company_id =
           companies.id

        ORDER BY applications.applied_at DESC

    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(
                "Get Applications Error:",
                err
            );

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        res.status(200).json(result);

    });

};


// =====================================================
// DELETE APPLICATION
// =====================================================

const deleteApplication = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM applications
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "Delete Application Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });

            }

            if (
                result.affectedRows === 0
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
                    "Application Deleted Successfully"

            });

        }

    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    loginAdmin,

    getStats,

    getStudents,
    deleteStudent,

    getCompanies,
    deleteCompany,

    getJobs,
    deleteJob,

    getApplications,
    deleteApplication

};