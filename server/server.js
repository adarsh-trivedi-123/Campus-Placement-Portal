
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// API Routes
// =======================
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// =======================
// Serve Frontend
// =======================
app.use(express.static(path.join(__dirname, "../client")));

// =======================
// Home Route
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// =======================
// About Route
// =======================
app.get("/about", (req, res) => {
    res.send("AI-Enabled Campus Placement Portal Backend");
});

// =======================
// Students Route (Secure)
// Password field is excluded
// =======================
app.get("/students", (req, res) => {
    const sql = `
        SELECT
            id,
            full_name,
            email,
            phone,
            course,
            semester,
            skills,
            created_at
        FROM students
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Students database error:", err);

            return res.status(500).json({
                success: false,
                error: "Database Error"
            });
        }

        res.status(200).json(result);
    });
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
    console.log(
        `🚀 AI-Enabled Campus Placement Portal running at http://localhost:${PORT}`
    );
});
