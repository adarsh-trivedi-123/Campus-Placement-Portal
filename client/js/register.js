const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const student = {

        full_name: document.getElementById("full_name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        course: document.getElementById("course").value,
        password: document.getElementById("password").value

    };

    try {

        const response = await fetch("http://localhost:5000/api/students/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)

        });

        const data = await response.json();

        if (data.success) {

            alert("Registration Successful 🎉");

            form.reset();

            window.location.href = "student-login.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Server Error");

    }

});