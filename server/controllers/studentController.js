const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =====================================================
// STUDENT REGISTRATION
// =====================================================

const registerStudent = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password,
            phone,
            course
        } = req.body;


        if (
            !full_name ||
            !email ||
            !password ||
            !phone ||
            !course
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });

        }


        // Check existing email

        const checkSql = `

            SELECT id

            FROM students

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

                    INSERT INTO students
                    (
                        full_name,
                        email,
                        password,
                        phone,
                        course
                    )

                    VALUES (?, ?, ?, ?, ?)

                `;


                db.query(

                    sql,

                    [
                        full_name,
                        email,
                        hashedPassword,
                        phone,
                        course
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
                                "Student Registered Successfully"

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
// STUDENT LOGIN
// =====================================================

const loginStudent = (req, res) => {

    const {
        email,
        password
    } = req.body;


    const sql = `

        SELECT *

        FROM students

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


                // Create Student JWT

                const token =
                    jwt.sign(

                        {

                            id:
                                result[0].id,

                            email:
                                result[0].email,

                            role:
                                "student"

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
                        "Student Login Successful",

                    token,

                    student: {

                        id:
                            result[0].id,

                        full_name:
                            result[0].full_name,

                        email:
                            result[0].email,

                        phone:
                            result[0].phone,

                        course:
                            result[0].course

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
// EXPORT
// =====================================================

module.exports = {

    registerStudent,
    loginStudent

};