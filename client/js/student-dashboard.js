// =====================================================
// STUDENT DASHBOARD
// File: client/js/student-dashboard.js
// =====================================================


// =====================================================
// GET STUDENT DATA & TOKEN
// =====================================================

const studentData = localStorage.getItem("student");
const studentToken = localStorage.getItem("studentToken");


// =====================================================
// CHECK LOGIN
// =====================================================

if (!studentData || !studentToken) {

    alert("Please login as Student first.");

    window.location.href = "student-login.html";

}


// =====================================================
// PARSE STUDENT DATA
// =====================================================

const student = JSON.parse(studentData);


// =====================================================
// SET STUDENT NAME
// =====================================================

document.getElementById("studentName").innerText =
    student.full_name || "Student";

document.getElementById("welcomeName").innerText =
    "Welcome, " + (student.full_name || "Student");


// =====================================================
// GLOBAL JOBS ARRAY
// =====================================================

let allJobs = [];


// =====================================================
// LOAD ALL JOBS
// =====================================================

async function loadJobs() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/jobs",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + studentToken
                }
            }
        );


        const data = await response.json();


        console.log(
            "Jobs Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load jobs"
            );

        }


        // =================================================
        // HANDLE API RESPONSE
        // =================================================

        allJobs =
            Array.isArray(data)
                ? data
                : data.jobs || [];


        displayJobs(allJobs);

    }

    catch (error) {

        console.error(
            "Load Jobs Error:",
            error
        );


        document.getElementById(
            "jobsContainer"
        ).innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    <strong>
                        Unable to load jobs.
                    </strong>

                    <br>

                    ${error.message}

                </div>

            </div>

        `;

    }

}


// =====================================================
// DISPLAY JOBS
// =====================================================

async function displayJobs(jobs) {

    const container =
        document.getElementById(
            "jobsContainer"
        );


    container.innerHTML = "";


    // =================================================
    // JOB COUNT
    // =================================================

    document.getElementById(
        "jobCount"
    ).innerText =
        jobs.length + " Jobs";


    // =================================================
    // NO JOBS
    // =================================================

    if (jobs.length === 0) {

        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-info">

                    No jobs available right now.

                </div>

            </div>

        `;

        return;

    }


    // =================================================
    // GET STUDENT APPLICATIONS
    // =================================================

    let applications = [];


    try {

        const response = await fetch(

            "http://localhost:5000/api/applications/student/" +
            student.id,

            {
                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " + studentToken

                }

            }

        );


        if (response.ok) {

            const data =
                await response.json();


            applications =
                Array.isArray(data)
                    ? data
                    : data.applications || [];

        }

        else {

            console.error(
                "Applications API Error"
            );

        }

    }

    catch (error) {

        console.error(
            "Load Student Applications Error:",
            error
        );

    }


    // =================================================
    // DISPLAY EACH JOB
    // =================================================

    jobs.forEach(job => {


        // =================================================
        // CHECK WHETHER STUDENT ALREADY APPLIED
        // =================================================

        const alreadyApplied =
            applications.some(

                application =>

                    Number(
                        application.job_id
                    ) === Number(job.id)

            );


        // =================================================
        // JOB CARD
        // =================================================

        const jobCard = document.createElement(
            "div"
        );


        jobCard.className =
            "col-md-6 col-lg-4 mb-4";


        jobCard.innerHTML = `

            <div class="card shadow h-100">

                <div class="card-body d-flex flex-column">


                    <h4 class="text-primary">

                        ${job.job_title || "-"}

                    </h4>


                    <h6>

                        🏢
                        ${job.company_name || "-"}

                    </h6>


                    <hr>


                    <p>

                        ${job.job_description || ""}

                    </p>


                    <p>

                        <strong>
                            📍 Location:
                        </strong>

                        ${job.location || "-"}

                    </p>


                    <p>

                        <strong>
                            💰 Salary:
                        </strong>

                        ${job.salary || "-"}

                    </p>


                    <p>

                        <strong>
                            🎓 Eligibility:
                        </strong>

                        ${job.eligibility || "-"}

                    </p>


                    <p>

                        <strong>
                            📅 Last Date:
                        </strong>

                        ${
                            job.last_date
                                ? formatDate(job.last_date)
                                : "-"
                        }

                    </p>


                    <div class="mt-auto">


                        ${
                            alreadyApplied

                            ?

                            `

                            <button
                                class="btn btn-secondary w-100"
                                disabled
                            >

                                ✅ Already Applied

                            </button>

                            `

                            :

                            `

                            <button
                                class="btn btn-success w-100"
                                onclick="applyJob(${job.id})"
                            >

                                🚀 Apply Now

                            </button>

                            `

                        }


                    </div>


                </div>

            </div>

        `;


        container.appendChild(
            jobCard
        );

    });

}


// =====================================================
// APPLY FOR JOB
// =====================================================

async function applyJob(jobId) {

    try {


        const response = await fetch(

            "http://localhost:5000/api/applications/apply",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + studentToken

                },


                body: JSON.stringify({

                    student_id:
                        student.id,

                    job_id:
                        jobId

                })

            }

        );


        const data =
            await response.json();


        console.log(
            "Apply Job Response:",
            data
        );


        alert(
            data.message ||
            "Application submitted"
        );


        if (data.success) {

            await loadJobs();

            await loadApplications();

        }

    }

    catch (error) {

        console.error(
            "Apply Job Error:",
            error
        );


        alert(
            "Server Error"
        );

    }

}


// =====================================================
// SEARCH JOBS
// =====================================================

function searchJobs() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    // =================================================
    // SHOW ALL JOBS
    // =================================================

    if (search === "") {

        displayJobs(
            allJobs
        );

        return;

    }


    // =================================================
    // FILTER JOBS
    // =================================================

    const filteredJobs =
        allJobs.filter(job => {


            const jobTitle =
                String(
                    job.job_title || ""
                ).toLowerCase();


            const companyName =
                String(
                    job.company_name || ""
                ).toLowerCase();


            const location =
                String(
                    job.location || ""
                ).toLowerCase();


            return (

                jobTitle.includes(
                    search
                )

                ||

                companyName.includes(
                    search
                )

                ||

                location.includes(
                    search
                )

            );

        });


    displayJobs(
        filteredJobs
    );

}


// =====================================================
// LOAD MY APPLICATIONS
// =====================================================

async function loadApplications() {

    try {


        const response = await fetch(

            "http://localhost:5000/api/applications/student/" +
            student.id,

            {

                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " + studentToken

                }

            }

        );


        const data =
            await response.json();


        console.log(
            "My Applications:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Applications API Error"
            );

        }


        const applications =
            Array.isArray(data)
                ? data
                : data.applications || [];


        const table =
            document.getElementById(
                "applicationsTable"
            );


        table.innerHTML = "";


        // =================================================
        // NO APPLICATIONS
        // =================================================

        if (
            applications.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center"
                    >

                        No applications yet.

                    </td>

                </tr>

            `;

            return;

        }


        // =================================================
        // DISPLAY APPLICATIONS
        // =================================================

        applications.forEach(
            application => {


                table.innerHTML += `

                    <tr>

                        <td>
                            ${application.id || "-"}
                        </td>


                        <td>
                            ${application.job_title || "-"}
                        </td>


                        <td>
                            ${application.company_name || "-"}
                        </td>


                        <td>
                            ${application.location || "-"}
                        </td>


                        <td>
                            ${application.salary || "-"}
                        </td>


                        <td>

                            ${getStatusBadge(
                                application.status
                            )}

                        </td>


                        <td>

                            ${formatDate(
                                application.applied_at
                            )}

                        </td>

                    </tr>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Load Applications Error:",
            error
        );


        document.getElementById(
            "applicationsTable"
        ).innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-danger"
                >

                    Unable to load applications.

                    <br>

                    ${error.message}

                </td>

            </tr>

        `;

    }

}


// =====================================================
// APPLICATION STATUS BADGE
// =====================================================

function getStatusBadge(status) {


    if (
        status === "Selected"
    ) {

        return `

            <span class="badge bg-success">

                🟢 Selected

            </span>

        `;

    }


    if (
        status === "Shortlisted"
    ) {

        return `

            <span class="badge bg-primary">

                🔵 Shortlisted

            </span>

        `;

    }


    if (
        status === "Rejected"
    ) {

        return `

            <span class="badge bg-danger">

                🔴 Rejected

            </span>

        `;

    }


    return `

        <span class="badge bg-warning text-dark">

            🟡 Applied

        </span>

    `;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (
        isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;

    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "student"
    );


    localStorage.removeItem(
        "studentToken"
    );


    window.location.href =
        "student-login.html";

}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.applyJob =
    applyJob;

window.searchJobs =
    searchJobs;

window.loadApplications =
    loadApplications;

window.logout =
    logout;


// =====================================================
// INITIAL LOAD
// =====================================================

loadJobs();

loadApplications();