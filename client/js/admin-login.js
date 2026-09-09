const form = document.getElementById("adminLoginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const admin = {

        email: document.getElementById("email").value,

        password: document.getElementById("password").value

    };

    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/login",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(admin)

            }
        );

        const data = await response.json();

        if (data.success) {

            alert("Admin Login Successful 🎉");

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            window.location.href =
                "admin-dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});