const student = JSON.parse(localStorage.getItem("student"));
const token = localStorage.getItem("token");

if (!student || !token) {

    window.location.href = "student-login.html";

}

async function loadApplications() {

    try {

        const response = await fetch(

            `http://localhost:5000/api/applications/student/${student.id}`,

            {

                headers: {

                    "Authorization": "Bearer " + token

                }

            }

        );

        const data = await response.json();

        const table = document.getElementById("applicationsTable");

        table.innerHTML = "";

        if (data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No Applications Found
                    </td>
                </tr>
            `;

            return;

        }

        data.forEach(app => {

            table.innerHTML += `

            <tr>

                <td>${app.company_name}</td>

                <td>${app.job_title}</td>

                <td>${app.location}</td>

                <td>${app.salary}</td>

                <td>${new Date(app.applied_at).toLocaleDateString()}</td>

            </tr>

            `;

        });

    } catch (error) {

        console.error(error);

        alert("Unable to load applications");

    }

}

function logout() {

    localStorage.removeItem("student");
    localStorage.removeItem("token");

    window.location.href = "student-login.html";

}

loadApplications();