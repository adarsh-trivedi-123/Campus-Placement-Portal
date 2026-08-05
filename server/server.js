const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes=require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const PORT = 5000;

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

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
    res.send("This is Campus Placement Portal Backend");
});

// =======================
// Students Route
// =======================
app.get("/students", (req, res) => {

    const sql = "SELECT * FROM students";

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database Error"
            });
        }

        res.json(result);

    });

});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});