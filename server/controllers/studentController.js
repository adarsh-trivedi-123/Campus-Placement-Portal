
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

        if (!full_name || !email || !password || !phone || !course) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const checkSql = "SELECT id FROM students WHERE email = ?";

        db.query(checkSql, [email], async (err, result) => {
            if (err) {
                console.error("Registration email check error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO students
                    (full_name, email, password, phone, course)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [full_name, email, hashedPassword, phone, course],
                    (insertError) => {
                        if (insertError) {
                            console.error("Student registration error:", insertError);
                            return res.status(500).json({
                                success: false,
                                message: "Registration Failed"
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message: "Student Registered Successfully"
                        });
                    }
                );
            } catch (hashError) {
                console.error("Password hashing error:", hashError);
                return res.status(500).json({
                    success: false,
                    message: "Server Error"
                });
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// =====================================================
// STUDENT LOGIN
// =====================================================

const loginStudent = (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM students WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.error("Student login database error:", err);
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
            const studentRecord = result[0];
            const match = await bcrypt.compare(
                password,
                studentRecord.password
            );

            if (!match) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                });
            }

            const token = jwt.sign(
                {
                    id: studentRecord.id,
                    email: studentRecord.email,
                    role: "student"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

            return res.status(200).json({
                success: true,
                message: "Student Login Successful",
                token,
                student: {
                    id: studentRecord.id,
                    full_name: studentRecord.full_name,
                    email: studentRecord.email,
                    phone: studentRecord.phone,
                    course: studentRecord.course,
                    skills: studentRecord.skills || ""
                }
            });
        } catch (error) {
            console.error("Student login error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    });
};

// =====================================================
// GET LOGGED-IN STUDENT PROFILE
// =====================================================

const getStudentProfile = (req, res) => {
    const studentId = req.user && req.user.id;

    if (!studentId) {
        return res.status(401).json({
            success: false,
            message: "Student authentication required"
        });
    }

    const sql = `
        SELECT id, full_name, email, phone, course, semester, skills
        FROM students
        WHERE id = ?
    `;

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.error("Get student profile error:", err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            student: {
                ...result[0],
                skills: result[0].skills || ""
            }
        });
    });
};

// =====================================================
// UPDATE STUDENT SKILLS
// =====================================================

const updateStudentSkills = (req, res) => {
    const studentId = req.user && req.user.id;
    const submittedSkills = req.body && req.body.skills;

    if (!studentId) {
        return res.status(401).json({
            success: false,
            message: "Student authentication required"
        });
    }

    if (
        typeof submittedSkills !== "string" &&
        !Array.isArray(submittedSkills)
    ) {
        return res.status(400).json({
            success: false,
            message: "Skills must be provided as text or an array"
        });
    }

    const skills = (Array.isArray(submittedSkills)
        ? submittedSkills.join(",")
        : submittedSkills
    )
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean);

    // Remove duplicate skills without regard to letter case.
    const uniqueSkills = [
        ...new Map(
            skills.map(skill => [skill.toLowerCase(), skill])
        ).values()
    ];

    if (uniqueSkills.length > 50) {
        return res.status(400).json({
            success: false,
            message: "You can enter up to 50 skills"
        });
    }

    const skillsText = uniqueSkills.join(", ");

    const sql = "UPDATE students SET skills = ? WHERE id = ?";

    db.query(sql, [skillsText, studentId], (err, result) => {
        if (err) {
            console.error("Update student skills error:", err);
            return res.status(500).json({
                success: false,
                message: "Unable to save skills"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Skills saved successfully",
            skills: uniqueSkills
        });
    });
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    registerStudent,
    loginStudent,
    getStudentProfile,
    updateStudentSkills
};
