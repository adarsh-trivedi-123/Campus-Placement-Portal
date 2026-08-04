const db = require("../config/db");

// ================= Company Registration =================

const registerCompany = (req, res) => {

    const { company_name, email, password, location } = req.body;

    const sql = `
        INSERT INTO companies
        (company_name, email, password, location)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [company_name, email, password, location], (err, result) => {

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

    });

};

// ================= Company Login =================

const loginCompany = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM companies WHERE email = ?";

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
            message: "Company Login Successful",
            company: {
                id: result[0].id,
                company_name: result[0].company_name,
                email: result[0].email,
                location: result[0].location
            }
        });

    });

};

// ================= Export =================

module.exports = {
    registerCompany,
    loginCompany
};