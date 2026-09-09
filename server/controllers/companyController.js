const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =====================================================
// COMPANY REGISTRATION
// =====================================================

const registerCompany = async (req, res) => {

    try {

        const {
            company_name,
            email,
            password,
            location
        } = req.body;

        if (
            !company_name ||
            !email ||
            !password ||
            !location
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });

        }

        const checkSql = `
            SELECT id
            FROM companies
            WHERE email = ?
        `;

        db.query(
            checkSql,
            [email],
            async (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }

                if (result.length > 0) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Email already registered"

                    });

                }

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );

                const sql = `

                    INSERT INTO companies
                    (
                        company_name,
                        email,
                        password,
                        location
                    )

                    VALUES (?, ?, ?, ?)

                `;

                db.query(
                    sql,
                    [
                        company_name,
                        email,
                        hashedPassword,
                        location
                    ],
                    (err) => {

                        if (err) {

                            console.error(err);

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Registration Failed"

                            });

                        }

                        res.status(201).json({

                            success: true,

                            message:
                                "Company Registered Successfully"

                        });

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });

    }

};


// =====================================================
// COMPANY LOGIN
// =====================================================

const loginCompany = (req, res) => {

    const {
        email,
        password
    } = req.body;

    const sql = `
        SELECT *
        FROM companies
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        async (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }

            if (result.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Email"

                });

            }

            try {

                const match =
                    await bcrypt.compare(
                        password,
                        result[0].password
                    );

                if (!match) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Invalid Password"

                    });

                }

                const token =
                    jwt.sign(

                        {
                            id:
                                result[0].id,

                            email:
                                result[0].email,

                            role:
                                "company"

                        },

                        process.env.JWT_SECRET,

                        {
                            expiresIn:
                                "7d"
                        }

                    );

                res.status(200).json({

                    success: true,

                    message:
                        "Company Login Successful",

                    token,

                    company: {

                        id:
                            result[0].id,

                        company_name:
                            result[0].company_name,

                        email:
                            result[0].email,

                        location:
                            result[0].location

                    }

                });

            }

            catch (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Server Error"

                });

            }

        }
    );

};


// =====================================================
// VIEW APPLICANTS
// =====================================================

const getApplicants = (req, res) => {

    const {
        id
    } = req.params;

    // Company can only see
    // its own applicants

    if (
        req.user &&
        req.user.role === "company" &&
        Number(req.user.id) !==
        Number(id)
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Access Denied"

        });

    }

    const sql = `

        SELECT

            applications.id,

            students.full_name,

            students.email,

            students.phone,

            students.course,

            jobs.job_title,

            applications.status,

            applications.applied_at

        FROM applications

        INNER JOIN students

        ON applications.student_id =
           students.id

        INNER JOIN jobs

        ON applications.job_id =
           jobs.id

        WHERE jobs.company_id = ?

        ORDER BY applications.applied_at DESC

    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "Applicants Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }

            res.status(200).json({

                success: true,

                applicants:
                    result

            });

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    registerCompany,
    loginCompany,
    getApplicants

};