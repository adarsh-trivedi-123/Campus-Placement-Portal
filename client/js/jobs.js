const student = JSON.parse(localStorage.getItem("student"));

async function loadJobs() {

    try {

        const response = await fetch("http://localhost:5000/api/jobs");

        const jobs = await response.json();

        const container = document.getElementById("jobsContainer");

        container.innerHTML = "";

        jobs.forEach(job => {

            container.innerHTML += `

            <div class="col-md-4 mb-4">

                <div class="card shadow h-100">

                    <div class="card-body">

                        <h4>${job.job_title}</h4>

                        <h6 class="text-primary">${job.company_name}</h6>

                        <p>${job.job_description}</p>

                        <p><strong>Location:</strong> ${job.location}</p>

                        <p><strong>Salary:</strong> ${job.salary}</p>

                        <p><strong>Eligibility:</strong> ${job.eligibility}</p>

                        <p><strong>Last Date:</strong> ${job.last_date}</p>

                        <button
                            class="btn btn-success w-100"
                            onclick="applyJob(${job.id})">

                            Apply Now

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    } catch (error) {

        console.log(error);

        alert("Unable to Load Jobs");

    }

}

async function applyJob(jobId) {

    if (!student) {

        alert("Please login as Student first.");

        window.location.href = "student-login.html";

        return;

    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/applications/apply",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    student_id: student.id,
                    job_id: jobId

                })

            }
        );

        const data = await response.json();

        alert(data.message);

    } catch (error) {

        console.log(error);

        alert("Server Error");

    }

}

loadJobs();