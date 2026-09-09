const admin = JSON.parse(
    localStorage.getItem("admin")
);

const token = localStorage.getItem("token");


// =====================================================
// AUTHENTICATION
// =====================================================

if (!admin || !token) {

    window.location.href = "admin-login.html";

}


// =====================================================
// ADMIN NAME
// =====================================================

if (admin) {

    document.getElementById("adminName").innerText =
        admin.name || "Administrator";

}


// =====================================================
// SIDEBAR
// =====================================================

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    sidebar.classList.toggle("show");
    overlay.classList.toggle("show");

}


function closeSidebar() {

    document
        .getElementById("sidebar")
        .classList.remove("show");

    document
        .getElementById("sidebarOverlay")
        .classList.remove("show");

}


// =====================================================
// ACTIVE MENU
// =====================================================

function setActiveMenu(menuId) {

    document
        .querySelectorAll(".sidebar-menu button")
        .forEach(button => {

            button.classList.remove("active");

        });


    const menu =
        document.getElementById(menuId);

    if (menu) {

        menu.classList.add("active");

    }

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

    setActiveMenu("menuDashboard");

    document.getElementById("pageTitle").innerText =
        "Dashboard";

    document.getElementById("tableTitle").innerText =
        "Management";

    document.getElementById("tableSubtitle").innerText =
        "Select a section above to view records.";

    document.getElementById("tableHead").innerHTML = "";

    document.getElementById("searchInput").value = "";

    document.getElementById("dataTable").innerHTML = `

        <tr>

            <td
                colspan="10"
                class="empty-message">

                <i class="bi bi-table fs-2 d-block mb-2"></i>

                Select Students, Companies, Jobs or
                Applications to view data.

            </td>

        </tr>

    `;

    closeSidebar();

}


// =====================================================
// LOAD STATISTICS
// =====================================================

async function loadStats() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/stats",
            {

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            console.error(
                data.message || "Unable to load statistics"
            );

            return;

        }


        document.getElementById(
            "studentCount"
        ).innerText = data.students;


        document.getElementById(
            "companyCount"
        ).innerText = data.companies;


        document.getElementById(
            "jobCount"
        ).innerText = data.jobs;


        document.getElementById(
            "applicationCount"
        ).innerText = data.applications;

    }

    catch (error) {

        console.error(
            "Statistics Error:",
            error
        );

    }

}


// =====================================================
// TABLE HELPERS
// =====================================================

function setTableLoading(message = "Loading data...") {

    document.getElementById(
        "dataTable"
    ).innerHTML = `

        <tr>

            <td
                colspan="10"
                class="empty-message">

                <div
                    class="spinner-border text-primary mb-3"
                    role="status">
                </div>

                <div>
                    ${message}
                </div>

            </td>

        </tr>

    `;

}


function setTableEmpty(message) {

    document.getElementById(
        "dataTable"
    ).innerHTML = `

        <tr>

            <td
                colspan="10"
                class="empty-message">

                <i class="bi bi-inbox fs-2 d-block mb-2"></i>

                ${message}

            </td>

        </tr>

    `;

}


// =====================================================
// LOAD STUDENTS
// =====================================================

async function loadStudents() {

    setActiveMenu("menuStudents");

    closeSidebar();

    document.getElementById("pageTitle").innerText =
        "Students";

    document.getElementById("tableTitle").innerText =
        "Registered Students";

    document.getElementById("tableSubtitle").innerText =
        "View and manage all registered students.";

    document.getElementById("searchInput").value = "";

    setTableLoading("Loading students...");


    document.getElementById("tableHead").innerHTML = `

        <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Course</th>
            <th>Action</th>

        </tr>

    `;


    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/students",
            {

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const students = await response.json();


        if (!response.ok) {

            throw new Error(
                students.message ||
                "Unable to load students"
            );

        }


        const table =
            document.getElementById("dataTable");

        table.innerHTML = "";


        if (!students.length) {

            setTableEmpty(
                "No students are registered yet."
            );

            return;

        }


        students.forEach(student => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>#${student.id}</strong>
                    </td>

                    <td>
                        ${student.full_name || "-"}
                    </td>

                    <td>
                        ${student.email || "-"}
                    </td>

                    <td>
                        ${student.phone || "-"}
                    </td>

                    <td>
                        ${student.course || "-"}
                    </td>

                    <td>

                        <button
                            class="btn btn-outline-danger delete-btn"
                            onclick="deleteStudent(${student.id})">

                            <i class="bi bi-trash3 me-1"></i>
                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

        setTableEmpty(
            "Unable to load students."
        );

    }

}


// =====================================================
// DELETE STUDENT
// =====================================================

async function deleteStudent(id) {

    if (
        !confirm(
            "Are you sure you want to delete this student?"
        )
    ) {

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/students/${id}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const data = await response.json();


        if (data.success) {

            alert(
                data.message ||
                "Student deleted successfully."
            );

            await loadStudents();

            loadStats();

        }

        else {

            alert(
                data.message ||
                "Unable to delete student."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete student."
        );

    }

}


// =====================================================
// LOAD COMPANIES
// =====================================================

async function loadCompanies() {

    setActiveMenu("menuCompanies");

    closeSidebar();

    document.getElementById("pageTitle").innerText =
        "Companies";

    document.getElementById("tableTitle").innerText =
        "Registered Companies";

    document.getElementById("tableSubtitle").innerText =
        "View and manage all registered companies.";

    document.getElementById("searchInput").value = "";

    setTableLoading("Loading companies...");


    document.getElementById("tableHead").innerHTML = `

        <tr>

            <th>ID</th>
            <th>Company</th>
            <th>Email</th>
            <th>Location</th>
            <th>Action</th>

        </tr>

    `;


    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/companies",
            {

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const companies = await response.json();


        if (!response.ok) {

            throw new Error(
                companies.message ||
                "Unable to load companies"
            );

        }


        const table =
            document.getElementById("dataTable");

        table.innerHTML = "";


        if (!companies.length) {

            setTableEmpty(
                "No companies are registered yet."
            );

            return;

        }


        companies.forEach(company => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>#${company.id}</strong>
                    </td>

                    <td>
                        ${company.company_name || "-"}
                    </td>

                    <td>
                        ${company.email || "-"}
                    </td>

                    <td>
                        ${company.location || "-"}
                    </td>

                    <td>

                        <button
                            class="btn btn-outline-danger delete-btn"
                            onclick="deleteCompany(${company.id})">

                            <i class="bi bi-trash3 me-1"></i>
                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

        setTableEmpty(
            "Unable to load companies."
        );

    }

}


// =====================================================
// DELETE COMPANY
// =====================================================

async function deleteCompany(id) {

    if (
        !confirm(
            "Delete this company and all its jobs/applications?"
        )
    ) {

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/companies/${id}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const data = await response.json();


        if (data.success) {

            alert(
                data.message ||
                "Company deleted successfully."
            );

            await loadCompanies();

            loadStats();

        }

        else {

            alert(
                data.message ||
                "Unable to delete company."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete company."
        );

    }

}


// =====================================================
// LOAD JOBS
// =====================================================

async function loadJobs() {

    setActiveMenu("menuJobs");

    closeSidebar();

    document.getElementById("pageTitle").innerText =
        "Jobs";

    document.getElementById("tableTitle").innerText =
        "Posted Jobs";

    document.getElementById("tableSubtitle").innerText =
        "View and manage all posted job opportunities.";

    document.getElementById("searchInput").value = "";

    setTableLoading("Loading jobs...");


    document.getElementById("tableHead").innerHTML = `

        <tr>

            <th>ID</th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Eligibility</th>
            <th>Last Date</th>
            <th>Action</th>

        </tr>

    `;


    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/jobs",
            {

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const jobs = await response.json();


        if (!response.ok) {

            throw new Error(
                jobs.message ||
                "Unable to load jobs"
            );

        }


        const table =
            document.getElementById("dataTable");

        table.innerHTML = "";


        if (!jobs.length) {

            setTableEmpty(
                "No jobs have been posted yet."
            );

            return;

        }


        jobs.forEach(job => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>#${job.id}</strong>
                    </td>

                    <td>
                        ${job.job_title || "-"}
                    </td>

                    <td>
                        ${job.company_name || "-"}
                    </td>

                    <td>
                        ${job.location || "-"}
                    </td>

                    <td>
                        ${job.salary || "-"}
                    </td>

                    <td>
                        ${job.eligibility || "-"}
                    </td>

                    <td>
                        ${job.last_date || "-"}
                    </td>

                    <td>

                        <button
                            class="btn btn-outline-danger delete-btn"
                            onclick="deleteJob(${job.id})">

                            <i class="bi bi-trash3 me-1"></i>
                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

        setTableEmpty(
            "Unable to load jobs."
        );

    }

}


// =====================================================
// DELETE JOB
// =====================================================

async function deleteJob(id) {

    if (
        !confirm(
            "Delete this job and all its applications?"
        )
    ) {

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/jobs/${id}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const data = await response.json();


        if (data.success) {

            alert(
                data.message ||
                "Job deleted successfully."
            );

            await loadJobs();

            loadStats();

        }

        else {

            alert(
                data.message ||
                "Unable to delete job."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete job."
        );

    }

}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    setActiveMenu("menuApplications");

    closeSidebar();

    document.getElementById("pageTitle").innerText =
        "Applications";

    document.getElementById("tableTitle").innerText =
        "All Applications";

    document.getElementById("tableSubtitle").innerText =
        "Monitor all applications submitted by students.";

    document.getElementById("searchInput").value = "";

    setTableLoading("Loading applications...");


    document.getElementById("tableHead").innerHTML = `

        <tr>

            <th>ID</th>
            <th>Student</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Course</th>
            <th>Company</th>
            <th>Job</th>
            <th>Applied At</th>
            <th>Action</th>

        </tr>

    `;


    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/applications",
            {

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const applications =
            await response.json();


        if (!response.ok) {

            throw new Error(
                applications.message ||
                "Unable to load applications"
            );

        }


        const table =
            document.getElementById("dataTable");

        table.innerHTML = "";


        if (!applications.length) {

            setTableEmpty(
                "No applications have been submitted yet."
            );

            return;

        }


        applications.forEach(application => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>#${application.id}</strong>
                    </td>

                    <td>
                        ${application.full_name || "-"}
                    </td>

                    <td>
                        ${application.email || "-"}
                    </td>

                    <td>
                        ${application.phone || "-"}
                    </td>

                    <td>
                        ${application.course || "-"}
                    </td>

                    <td>
                        ${application.company_name || "-"}
                    </td>

                    <td>
                        ${application.job_title || "-"}
                    </td>

                    <td>
                        ${application.applied_at || "-"}
                    </td>

                    <td>

                        <button
                            class="btn btn-outline-danger delete-btn"
                            onclick="deleteApplication(${application.id})">

                            <i class="bi bi-trash3 me-1"></i>
                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

        setTableEmpty(
            "Unable to load applications."
        );

    }

}


// =====================================================
// DELETE APPLICATION
// =====================================================

async function deleteApplication(id) {

    if (
        !confirm(
            "Are you sure you want to delete this application?"
        )
    ) {

        return;

    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/applications/${id}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }
        );


        const data = await response.json();


        if (data.success) {

            alert(
                data.message ||
                "Application deleted successfully."
            );

            await loadApplications();

            loadStats();

        }

        else {

            alert(
                data.message ||
                "Unable to delete application."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete application."
        );

    }

}


// =====================================================
// SEARCH / FILTER
// =====================================================

function filterTable() {

    const input =
        document.getElementById("searchInput");

    const filter =
        input.value.toLowerCase();

    const rows =
        document.querySelectorAll(
            "#dataTable tr"
        );


    rows.forEach(row => {

        const text =
            row.innerText.toLowerCase();

        if (text.includes(filter)) {

            row.style.display = "";

        }

        else {

            row.style.display = "none";

        }

    });

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("admin");

    localStorage.removeItem("token");

    window.location.href =
        "admin-login.html";

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadStats();