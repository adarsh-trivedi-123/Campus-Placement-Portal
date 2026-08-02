const db = require("../config/db");

// ================= Register Student =================

const registerStudent = (req, res) => {

    const { full_name, email, phone, course, password } = req.body;

    const sql = `
        INSERT INTO students (full_name, email, phone, course, password)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [full_name, email, phone, course, password], (err, result) => {

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

    });

};

// ================= Student Login =================

const loginStudent = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM students WHERE email = ?";

    db.query(sql, [email], (err, result) => {

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

        if (result[0].password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        res.status(200).json({
            success: true,
            message: "Login Successful",
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