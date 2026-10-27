
"use strict";

// =====================================================
// STUDENT DASHBOARD
// File: client/js/student-dashboard.js
// =====================================================

const API_BASE = "http://localhost:5000/api";

const studentData = localStorage.getItem("student");
const studentToken = localStorage.getItem("studentToken");

if (!studentData || !studentToken) {
    alert("Please login as Student first.");
    window.location.href = "student-login.html";
}

let student;

try {
    student = JSON.parse(studentData);
} catch (error) {
    localStorage.removeItem("student");
    localStorage.removeItem("studentToken");
    alert("Student session is invalid. Please login again.");
    window.location.href = "student-login.html";
}

if (!student || !student.id) {
    localStorage.removeItem("student");
    localStorage.removeItem("studentToken");
    window.location.href = "student-login.html";
}

let allJobs = [];

// =====================================================
// COMMON HELPERS
// =====================================================

function authHeaders(includeJson = false) {
    const headers = {
        Authorization: "Bearer " + studentToken
    };

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

async function readResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { message: text || "Unexpected server response" };
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function normalizeSkills(skills) {
    if (Array.isArray(skills)) {
        return skills.map(skill => String(skill).trim()).filter(Boolean);
    }

    if (typeof skills !== "string" || !skills.trim()) {
        return [];
    }

    return skills.split(",").map(skill => skill.trim()).filter(Boolean);
}

// =====================================================
// STUDENT NAME
// =====================================================

document.getElementById("studentName").textContent =
    student.full_name || "Student";

document.getElementById("welcomeName").textContent =
    "Welcome, " + (student.full_name || "Student");

// =====================================================
// LOAD ALL JOBS
// =====================================================

async function loadJobs() {
    const container = document.getElementById("jobsContainer");

    try {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">Loading available jobs...</div>
            </div>
        `;

        const response = await fetch(`${API_BASE}/jobs`, {
            method: "GET",
            headers: authHeaders()
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to load jobs");
        }

        allJobs = Array.isArray(data)
            ? data
            : (Array.isArray(data.jobs) ? data.jobs : []);

        const searchInput = document.getElementById("searchInput");
        if (searchInput && searchInput.value.trim()) {
            searchJobs();
        } else {
            await displayJobs(allJobs);
        }
    } catch (error) {
        console.error("Load jobs error:", error);

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <strong>Unable to load jobs.</strong><br>
                    ${escapeHTML(error.message)}
                </div>
            </div>
        `;
    }
}

// =====================================================
// DISPLAY AVAILABLE JOBS
// =====================================================

async function displayJobs(jobs) {
    const container = document.getElementById("jobsContainer");
    const jobCount = document.getElementById("jobCount");

    container.innerHTML = "";
    jobCount.textContent = `${jobs.length} Jobs`;

    if (!jobs.length) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-jobs">
                    <i class="bi bi-briefcase"></i>
                    No jobs available right now.
                </div>
            </div>
        `;
        return;
    }

    let applications = [];

    try {
        const response = await fetch(
            `${API_BASE}/applications/student/${student.id}`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );

        const data = await readResponse(response);

        if (response.ok) {
            applications = Array.isArray(data)
                ? data
                : (Array.isArray(data.applications) ? data.applications : []);
        }
    } catch (error) {
        console.error("Load applications for job cards error:", error);
    }

    jobs.forEach(job => {
        const alreadyApplied = applications.some(
            application => Number(application.job_id) === Number(job.id)
        );

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";

        card.innerHTML = `
            <div class="job-card h-100">
                <div class="job-card-body d-flex flex-column">
                    <div class="job-icon"><i class="bi bi-briefcase-fill"></i></div>

                    <h4 class="job-title">${escapeHTML(job.job_title || "-")}</h4>
                    <h6 class="company-name">
                        <i class="bi bi-building me-1"></i>
                        ${escapeHTML(job.company_name || "-")}
                    </h6>

                    <p class="job-description">
                        ${escapeHTML(job.job_description || "No description provided.")}
                    </p>

                    <hr class="job-divider">

                    <div class="job-detail">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span><strong>Location:</strong> ${escapeHTML(job.location || "-")}</span>
                    </div>

                    <div class="job-detail">
                        <i class="bi bi-cash-stack"></i>
                        <span><strong>Salary:</strong> ${escapeHTML(job.salary || "-")}</span>
                    </div>

                    <div class="job-detail">
                        <i class="bi bi-mortarboard-fill"></i>
                        <span><strong>Eligibility:</strong> ${escapeHTML(job.eligibility || "-")}</span>
                    </div>

                    <div class="job-detail">
                        <i class="bi bi-calendar-event"></i>
                        <span><strong>Last Date:</strong> ${escapeHTML(formatDate(job.last_date))}</span>
                    </div>

                    <div class="mt-auto pt-2">
                        ${
                            alreadyApplied
                                ? `<button class="btn btn-secondary already-applied w-100" disabled>
                                       <i class="bi bi-check-circle me-1"></i> Already Applied
                                   </button>`
                                : `<button class="btn btn-success apply-btn w-100"
                                           onclick="applyJob(${Number(job.id)})">
                                       <i class="bi bi-send me-1"></i> Apply Now
                                   </button>`
                        }
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// =====================================================
// LOAD STUDENT PROFILE AND SAVED SKILLS
// =====================================================

async function loadStudentProfile() {
    const input = document.getElementById("studentSkillsInput");
    const message = document.getElementById("skillsMessage");

    try {
        message.textContent = "Loading saved skills...";
        message.className = "small mt-3 text-muted";

        const response = await fetch(`${API_BASE}/students/profile`, {
            method: "GET",
            headers: authHeaders()
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to load student profile");
        }

        const profile = data.student || data;

        input.value = Array.isArray(profile.skills)
            ? profile.skills.join(", ")
            : (profile.skills || "");

        if (profile.full_name) {
            student.full_name = profile.full_name;
            document.getElementById("studentName").textContent = profile.full_name;
            document.getElementById("welcomeName").textContent =
                "Welcome, " + profile.full_name;
            localStorage.setItem("student", JSON.stringify({
                ...student,
                skills: profile.skills || ""
            }));
        }

        message.textContent = "Saved skills loaded.";
        message.className = "small mt-3 text-success";
    } catch (error) {
        console.error("Load student profile error:", error);
        message.textContent =
            "Could not load saved skills. You can still enter skills and try saving.";
        message.className = "small mt-3 text-danger";
    }
}

// =====================================================
// SAVE STUDENT SKILLS
// =====================================================

async function saveStudentSkills() {
    const input = document.getElementById("studentSkillsInput");
    const button = document.getElementById("saveSkillsBtn");
    const message = document.getElementById("skillsMessage");

    const skills = normalizeSkills(input.value);

    if (!skills.length) {
        message.textContent = "Please enter at least one skill.";
        message.className = "small mt-3 text-danger";
        input.focus();
        return;
    }

    if (skills.length > 50) {
        message.textContent = "Please enter no more than 50 skills.";
        message.className = "small mt-3 text-danger";
        return;
    }

    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    message.textContent = "";

    try {
        const response = await fetch(`${API_BASE}/students/skills`, {
            method: "PUT",
            headers: authHeaders(true),
            body: JSON.stringify({ skills })
        });

        const data = await readResponse(response);

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to save skills");
        }

        const savedSkills = Array.isArray(data.skills) ? data.skills : skills;

        input.value = savedSkills.join(", ");

        student.skills = savedSkills.join(", ");
        localStorage.setItem("student", JSON.stringify(student));

        message.textContent = data.message || "Skills saved successfully!";
        message.className = "small mt-3 text-success";

        await loadRecommendedJobs();
    } catch (error) {
        console.error("Save skills error:", error);
        message.textContent = error.message;
        message.className = "small mt-3 text-danger";
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-check-circle me-1"></i> Save Skills';
    }
}

// =====================================================
// LOAD AI JOB RECOMMENDATIONS
// =====================================================

async function loadRecommendedJobs() {
    const container = document.getElementById("recommendedJobsContainer");

    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-info">Finding jobs that match your skills...</div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/jobs/recommended`, {
            method: "GET",
            headers: authHeaders()
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to load job recommendations");
        }

        const recommendations = Array.isArray(data.recommendations)
            ? data.recommendations
            : [];

        renderRecommendedJobs(recommendations, data);
    } catch (error) {
        console.error("Load recommendations error:", error);

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <strong>Recommendations could not be loaded.</strong><br>
                    ${escapeHTML(error.message)}
                    <div class="small mt-2">
                        Check that you are logged in as a student and the recommendation API is running.
                    </div>
                </div>
            </div>
        `;
    }
}

// =====================================================
// RENDER AI RECOMMENDATIONS
// =====================================================

function renderRecommendedJobs(recommendations, responseData = {}) {
    const container = document.getElementById("recommendedJobsContainer");
    container.innerHTML = "";

    if (!recommendations.length) {
        const noSkills = !responseData.studentSkills ||
            responseData.studentSkills.length === 0;

        container.innerHTML = `
            <div class="col-12">
                <div class="empty-jobs">
                    <i class="bi bi-stars"></i>
                    <strong>${noSkills ? "Add your skills to get better recommendations." : "No matching jobs found."}</strong>
                    <p class="mb-0 mt-2">
                        ${noSkills
                            ? "Enter your skills above and click Save Skills."
                            : "Try updating your skills or check again later."}
                    </p>
                </div>
            </div>
        `;
        return;
    }

    recommendations.forEach(job => {
        const percentage = Math.max(
            0,
            Math.min(100, Number(job.matchPercentage) || 0)
        );

        const matchedSkills = Array.isArray(job.matchedSkills)
            ? job.matchedSkills
            : [];

        const missingSkills = Array.isArray(job.missingSkills)
            ? job.missingSkills
            : [];

        const requiredSkills = Array.isArray(job.requiredSkills)
            ? job.requiredSkills
            : [];

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";

        card.innerHTML = `
            <div class="job-card h-100">
                <div class="job-card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div class="job-icon mb-0"><i class="bi bi-stars"></i></div>
                        <span class="match-score">${percentage}% Match</span>
                    </div>

                    <div class="match-progress mb-3">
                        <div class="match-progress-bar" style="width:${percentage}%"></div>
                    </div>

                    <h4 class="job-title">${escapeHTML(job.job_title || "-")}</h4>
                    <h6 class="company-name">
                        <i class="bi bi-building me-1"></i>
                        ${escapeHTML(job.company_name || "-")}
                    </h6>

                    <p class="job-description">
                        ${escapeHTML(job.job_description || "No description provided.")}
                    </p>

                    <div class="job-detail">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span><strong>Location:</strong> ${escapeHTML(job.location || "-")}</span>
                    </div>

                    <div class="job-detail">
                        <i class="bi bi-cash-stack"></i>
                        <span><strong>Salary:</strong> ${escapeHTML(job.salary || "-")}</span>
                    </div>

                    <div class="job-detail">
                        <i class="bi bi-mortarboard-fill"></i>
                        <span><strong>Eligibility:</strong> ${escapeHTML(job.eligibility || "-")}</span>
                    </div>

                    <hr class="job-divider">

                    <div class="mb-3">
                        <div class="skills-subheading text-success">
                            <i class="bi bi-check-circle me-1"></i> Matched Skills
                        </div>
                        ${
                            matchedSkills.length
                                ? matchedSkills.map(skill =>
                                    `<span class="skill-chip">${escapeHTML(skill)}</span>`
                                  ).join("")
                                : `<span class="small text-muted">No required skills matched yet.</span>`
                        }
                    </div>

                    <div class="mb-3">
                        <div class="skills-subheading text-danger">
                            <i class="bi bi-plus-circle me-1"></i> Skills to Improve
                        </div>
                        ${
                            missingSkills.length
                                ? missingSkills.map(skill =>
                                    `<span class="skill-chip" style="background:#f8d7da;color:#842029">${escapeHTML(skill)}</span>`
                                  ).join("")
                                : `<span class="small text-success">You match all listed required skills.</span>`
                        }
                    </div>

                    ${
                        requiredSkills.length
                            ? `<p class="small text-muted">Required skills: ${requiredSkills.map(escapeHTML).join(", ")}</p>`
                            : ""
                    }

                    <p class="small text-muted">${escapeHTML(job.matchingNote || "")}</p>

                    <div class="mt-auto">
                        <button class="btn btn-success apply-btn w-100"
                            onclick="applyJob(${Number(job.id)})">
                            <i class="bi bi-send me-1"></i> Apply Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// =====================================================
// APPLY FOR JOB
// =====================================================

async function applyJob(jobId) {
    try {
        const response = await fetch(`${API_BASE}/applications/apply`, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify({
                student_id: student.id,
                job_id: jobId
            })
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Application could not be submitted");
        }

        alert(data.message || "Application submitted");

        if (data.success) {
            await loadJobs();
            await loadApplications();
            await loadRecommendedJobs();
        }
    } catch (error) {
        console.error("Apply job error:", error);
        alert(error.message || "Server Error");
    }
}

// =====================================================
// SEARCH JOBS
// =====================================================

function searchJobs() {
    const search = document.getElementById("searchInput").value.toLowerCase().trim();

    if (!search) {
        displayJobs(allJobs);
        return;
    }

    const filteredJobs = allJobs.filter(job => {
        const jobTitle = String(job.job_title || "").toLowerCase();
        const companyName = String(job.company_name || "").toLowerCase();
        const location = String(job.location || "").toLowerCase();

        return jobTitle.includes(search) ||
            companyName.includes(search) ||
            location.includes(search);
    });

    displayJobs(filteredJobs);
}

// =====================================================
// LOAD MY APPLICATIONS
// =====================================================

async function loadApplications() {
    const table = document.getElementById("applicationsTable");

    try {
        const response = await fetch(
            `${API_BASE}/applications/student/${student.id}`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Applications API Error");
        }

        const applications = Array.isArray(data)
            ? data
            : (Array.isArray(data.applications) ? data.applications : []);

        table.innerHTML = "";

        if (!applications.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No applications yet.
                    </td>
                </tr>
            `;
            return;
        }

        applications.forEach(application => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(application.id || "-")}</td>
                <td>${escapeHTML(application.job_title || "-")}</td>
                <td>${escapeHTML(application.company_name || "-")}</td>
                <td>${escapeHTML(application.location || "-")}</td>
                <td>${escapeHTML(application.salary || "-")}</td>
                <td>${getStatusBadge(application.status)}</td>
                <td>${escapeHTML(formatDate(application.applied_at))}</td>
            `;

            table.appendChild(row);
        });
    } catch (error) {
        console.error("Load applications error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Unable to load applications: ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

// =====================================================
// APPLICATION STATUS BADGE
// =====================================================

function getStatusBadge(status) {
    const normalized = String(status || "Applied").toLowerCase();

    if (normalized === "selected") {
        return '<span class="status-badge status-selected">Selected</span>';
    }

    if (normalized === "shortlisted") {
        return '<span class="status-badge status-shortlisted">Shortlisted</span>';
    }

    if (normalized === "rejected") {
        return '<span class="status-badge status-rejected">Rejected</span>';
    }

    return '<span class="status-badge status-applied">Applied</span>';
}

// =====================================================
// LOGOUT
// =====================================================

function logout() {
    localStorage.removeItem("student");
    localStorage.removeItem("studentToken");
    window.location.href = "student-login.html";
}

// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.loadJobs = loadJobs;
window.displayJobs = displayJobs;
window.searchJobs = searchJobs;
window.applyJob = applyJob;
window.loadApplications = loadApplications;
window.loadStudentProfile = loadStudentProfile;
window.saveStudentSkills = saveStudentSkills;
window.loadRecommendedJobs = loadRecommendedJobs;
window.logout = logout;

// =====================================================
// INITIAL LOAD
// =====================================================

loadJobs();
loadApplications();
loadStudentProfile();
loadRecommendedJobs();
