const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= Company Registration =================

const registerCompany = async (req, res) => {

    try {

        const { company_name, email, password, location } = req.body;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO companies
            (company_name, email, password, location)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [company_name, email, hashedPassword, location],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Registration Failed"
                    });

                }

                res.status(201).json({
                    success: true,
                    message: "Company Registered Successfully"
                });

            }
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ================= Company Login =================

const loginCompany = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM companies WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {

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

        // Compare Password
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

        // Generate JWT
        const token = jwt.sign(

            {
                id: result[0].id,
                email: result[0].email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        res.status(200).json({

            success: true,
            message: "Company Login Successful",

            token,

            company: {

                id: result[0].id,
                company_name: result[0].company_name,
                email: result[0].email,
                location: result[0].location

            }

        });

    });

};

// ================= View Applicants =================

const getApplicants = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            students.full_name,
            students.email,
            students.phone,
            students.course,
            jobs.job_title,
            applications.applied_at

        FROM applications

        INNER JOIN students
            ON applications.student_id = students.id

        INNER JOIN jobs
            ON applications.job_id = jobs.id

        WHERE jobs.company_id = ?

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
    registerCompany,
    loginCompany,
    getApplicants
};