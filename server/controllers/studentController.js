const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= Register Student =================

const registerStudent = async (req, res) => {

    try {

        const { full_name, email, phone, course, password } = req.body;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO students
            (full_name, email, phone, course, password)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [full_name, email, phone, course, hashedPassword],
            (err) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: "Registration Failed"
                    });

                }

                res.status(201).json({
                    success: true,
                    message: "Student Registered Successfully"
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

// ================= Student Login =================

const loginStudent = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM students WHERE email = ?";

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

        // Generate JWT Token
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
            message: "Login Successful",

            token,

            student: {

                id: result[0].id,
                full_name: result[0].full_name,
                email: result[0].email,
                course: result[0].course

            }

        });

    });

};

// ================= Export =================

module.exports = {
    registerStudent,
    loginStudent
};