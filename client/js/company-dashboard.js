const company = JSON.parse(localStorage.getItem("company"));

if (!company) {

    window.location.href = "company-login.html";

}

document.getElementById("companyName").innerText =
"Welcome, " + company.company_name;

const form = document.getElementById("jobForm");

async function loadJobs() {

    const response = await fetch(
        `http://localhost:5000/api/jobs/company/${company.id}`
    );

    const jobs = await response.json();

    const table = document.getElementById("jobsTable");

    table.innerHTML = "";

    jobs.forEach(job => {

        table.innerHTML += `

        <tr>

        <td>${job.job_title}</td>

        <td>${job.location}</td>

        <td>${job.salary}</td>

        <td>

        <button
        class="btn btn-danger btn-sm"
        onclick="deleteJob(${job.id})">

        Delete

        </button>

        </td>

        </tr>

        `;

    });

}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const job = {

        company_id: company.id,

        job_title: job_title.value,

        job_description: job_description.value,

        location: location.value,

        salary: salary.value,

        eligibility: eligibility.value,

        last_date: last_date.value

    };

    const response = await fetch(
        "http://localhost:5000/api/jobs/post",
        {

            method: "POST",

            headers: {

                "Content-Type":"application/json"

            },

            body: JSON.stringify(job)

        });

    const data = await response.json();

    alert(data.message);

    form.reset();

    loadJobs();

});

async function deleteJob(id){

    if(!confirm("Delete this Job?")) return;

    await fetch(

        `http://localhost:5000/api/jobs/${id}`,

        {

            method:"DELETE"

        }

    );

    loadJobs();

}

function logout(){

    localStorage.removeItem("company");

    window.location.href="company-login.html";

}

loadJobs();