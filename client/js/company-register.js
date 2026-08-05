const form = document.getElementById("companyRegisterForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const company = {

        company_name: document.getElementById("company_name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        location: document.getElementById("location").value

    };

    try {

        const response = await fetch("http://localhost:5000/api/companies/register", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(company)

        });

        const data = await response.json();

        if (data.success) {

            alert("🎉 Company Registered Successfully");

            window.location.href = "company-login.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});