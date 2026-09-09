const companyData = localStorage.getItem("company");
const companyToken = localStorage.getItem("companyToken");


// =====================================================
// CHECK COMPANY LOGIN
// =====================================================

if (!companyData || !companyToken) {

    alert("Please login as a company");

    window.location.href =
        "company-login.html";

} else {

    const company =
        JSON.parse(companyData);


    // =====================================================
    // COMPANY INFORMATION
    // =====================================================

    document.getElementById(
        "companyName"
    ).innerText =
        company.company_name || "Company";


    document.getElementById(
        "welcomeCompany"
    ).innerText =
        company.company_name || "Company";


    document.getElementById(
        "companyLocation"
    ).innerText =
        company.location || "-";


    // =====================================================
    // LOAD COMPANY JOBS
    // =====================================================

    async function loadJobs() {

        try {

            const response =
                await fetch(

                    "http://localhost:5000/api/jobs/company/" +
                    company.id,

                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                "Bearer " +
                                companyToken

                        }

                    }

                );


            const data =
                await response.json();


            console.log(
                "Jobs:",
                data
            );


            const jobsTable =
                document.getElementById(
                    "jobsTable"
                );


            jobsTable.innerHTML = "";


            if (!response.ok) {

                jobsTable.innerHTML = `

                    <tr>

                        <td
                            colspan="7"
                            class="text-center text-danger"
                        >

                            Unable to load jobs

                        </td>

                    </tr>

                `;

                return;

            }


            const jobs =
                Array.isArray(data)
                    ? data
                    : data.jobs || [];


            document.getElementById(
                "jobCount"
            ).innerText =
                jobs.length;


            if (jobs.length === 0) {

                jobsTable.innerHTML = `

                    <tr>

                        <td
                            colspan="7"
                            class="text-center"
                        >

                            No jobs posted yet

                        </td>

                    </tr>

                `;

                return;

            }


            // =================================================
            // DISPLAY JOBS
            // =================================================

            jobs.forEach(job => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${job.id}
                    </td>

                    <td>
                        ${job.job_title || "-"}
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
                        ${
                            job.last_date
                                ? formatDate(
                                    job.last_date
                                  )
                                : "-"
                        }
                    </td>

                    <td>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteJob(${job.id})"
                        >

                            Delete

                        </button>

                    </td>

                `;


                jobsTable.appendChild(row);

            });

        }

        catch (error) {

            console.error(
                "Load Jobs Error:",
                error
            );


            document.getElementById(
                "jobsTable"
            ).innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-danger"
                    >

                        Unable to load jobs

                    </td>

                </tr>

            `;

        }

    }


    // =====================================================
    // POST NEW JOB
    // =====================================================

    const jobForm =
        document.getElementById(
            "jobForm"
        );


    if (jobForm) {

        jobForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                const job = {

                    company_id:
                        company.id,

                    job_title:
                        document.getElementById(
                            "job_title"
                        ).value.trim(),

                    job_description:
                        document.getElementById(
                            "job_description"
                        ).value.trim(),

                    location:
                        document.getElementById(
                            "location"
                        ).value.trim(),

                    salary:
                        document.getElementById(
                            "salary"
                        ).value.trim(),

                    eligibility:
                        document.getElementById(
                            "eligibility"
                        ).value.trim(),

                    last_date:
                        document.getElementById(
                            "last_date"
                        ).value

                };


                try {

                    const response =
                        await fetch(

                            "http://localhost:5000/api/jobs",

                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " +
                                        companyToken

                                },

                                body:
                                    JSON.stringify(job)

                            }

                        );


                    const data =
                        await response.json();


                    console.log(
                        "Post Job:",
                        data
                    );


                    if (data.success) {

                        alert(
                            "Job Posted Successfully 🎉"
                        );


                        jobForm.reset();


                        loadJobs();

                    }

                    else {

                        alert(
                            data.message ||
                            "Unable to post job"
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "Post Job Error:",
                        error
                    );


                    alert(
                        "Server Error"
                    );

                }

            }
        );

    }


    // =====================================================
    // DELETE JOB
    // =====================================================

    window.deleteJob =
        async function (jobId) {

            const confirmDelete =
                confirm(
                    "Are you sure you want to delete this job?"
                );


            if (!confirmDelete) {

                return;

            }


            try {

                const response =
                    await fetch(

                        "http://localhost:5000/api/jobs/" +
                        jobId,

                        {

                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    companyToken

                            }

                        }

                    );


                const data =
                    await response.json();


                alert(
                    data.message ||
                    "Job deleted"
                );


                if (data.success) {

                    loadJobs();

                }

            }

            catch (error) {

                console.error(
                    "Delete Job Error:",
                    error
                );


                alert(
                    "Unable to delete job"
                );

            }

        };


    // =====================================================
    // LOAD APPLICANTS
    // =====================================================

    async function loadApplicants() {

        try {

            const response =
                await fetch(

                    "http://localhost:5000/api/applications/company/" +
                    company.id,

                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                "Bearer " +
                                companyToken

                        }

                    }

                );


            const data =
                await response.json();


            console.log(
                "Applicants:",
                data
            );


            const applicantsTable =
                document.getElementById(
                    "applicantsTable"
                );


            applicantsTable.innerHTML = "";


            if (!response.ok) {

                applicantsTable.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            class="text-center text-danger"
                        >

                            Unable to load applicants

                        </td>

                    </tr>

                `;


                document.getElementById(
                    "applicantCount"
                ).innerText = "0";


                return;

            }


            const applicants =
                Array.isArray(data)
                    ? data
                    : data.applications || [];


            document.getElementById(
                "applicantCount"
            ).innerText =
                applicants.length;


            if (applicants.length === 0) {

                applicantsTable.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            class="text-center"
                        >

                            No applications received yet

                        </td>

                    </tr>

                `;

                return;

            }


            // =================================================
            // DISPLAY APPLICANTS
            // =================================================

            applicants.forEach(
                application => {


                    const currentStatus =
                        application.status ||
                        "Applied";


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${application.id || "-"}
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
                            ${application.job_title || "-"}
                        </td>


                        <td>

                            ${getStatusBadge(
                                currentStatus
                            )}

                        </td>


                        <td>

                            <div
                                class="d-flex gap-1 flex-wrap"
                            >


                                <button
                                    class="btn btn-primary btn-sm"
                                    onclick="updateApplicationStatus(${application.id}, 'Shortlisted')"
                                >

                                    🔵 Shortlist

                                </button>


                                <button
                                    class="btn btn-success btn-sm"
                                    onclick="updateApplicationStatus(${application.id}, 'Selected')"
                                >

                                    🟢 Select

                                </button>


                                <button
                                    class="btn btn-danger btn-sm"
                                    onclick="updateApplicationStatus(${application.id}, 'Rejected')"
                                >

                                    🔴 Reject

                                </button>


                            </div>

                        </td>

                    `;


                    applicantsTable.appendChild(
                        row
                    );

                }

            );

        }

        catch (error) {

            console.error(
                "Load Applicants Error:",
                error
            );


            document.getElementById(
                "applicantsTable"
            ).innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="text-center text-danger"
                    >

                        Unable to load applicants

                    </td>

                </tr>

            `;

        }

    }


    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================

    window.updateApplicationStatus =
        async function (
            applicationId,
            status
        ) {


            let message = "";


            if (
                status ===
                "Shortlisted"
            ) {

                message =
                    "Are you sure you want to shortlist this student?";

            }

            else if (
                status ===
                "Selected"
            ) {

                message =
                    "Are you sure you want to select this student?";

            }

            else if (
                status ===
                "Rejected"
            ) {

                message =
                    "Are you sure you want to reject this application?";

            }


            if (
                !confirm(message)
            ) {

                return;

            }


            try {

                const response =
                    await fetch(

                        "http://localhost:5000/api/applications/status/" +
                        applicationId,

                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    companyToken

                            },


                            body:
                                JSON.stringify({

                                    status:
                                        status

                                })

                        }

                    );


                const data =
                    await response.json();


                console.log(
                    "Update Status:",
                    data
                );


                alert(
                    data.message ||
                    "Status updated"
                );


                if (data.success) {

                    loadApplicants();

                }

            }

            catch (error) {

                console.error(
                    "Update Status Error:",
                    error
                );


                alert(
                    "Unable to update application status"
                );

            }

        };


    // =====================================================
    // STATUS BADGE
    // =====================================================

    function getStatusBadge(status) {


        if (
            status ===
            "Selected"
        ) {

            return `

                <span
                    class="badge bg-success"
                >

                    🟢 Selected

                </span>

            `;

        }


        if (
            status ===
            "Shortlisted"
        ) {

            return `

                <span
                    class="badge bg-primary"
                >

                    🔵 Shortlisted

                </span>

            `;

        }


        if (
            status ===
            "Rejected"
        ) {

            return `

                <span
                    class="badge bg-danger"
                >

                    🔴 Rejected

                </span>

            `;

        }


        return `

            <span
                class="badge bg-warning text-dark"
            >

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


        return parsedDate.toLocaleDateString(
            "en-IN"
        );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    window.logout =
        function () {

            localStorage.removeItem(
                "company"
            );


            localStorage.removeItem(
                "companyToken"
            );


            window.location.href =
                "company-login.html";

        };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadJobs();

    loadApplicants();

}