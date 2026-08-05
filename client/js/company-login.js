const form = document.getElementById("companyLoginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const company = {

        email: document.getElementById("email").value,
        password: document.getElementById("password").value

    };

    try {

        const response = await fetch("http://localhost:5000/api/companies/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(company)

        });

        const data = await response.json();

        if (data.success) {

            alert("Login Successful 🎉");

            localStorage.setItem("company", JSON.stringify(data.company));

            window.location.href = "company-dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});