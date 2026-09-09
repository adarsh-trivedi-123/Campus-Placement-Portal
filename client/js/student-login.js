const form = document.getElementById("studentLoginForm");


// =====================================================
// STUDENT LOGIN
// =====================================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        alert("Please enter email and password.");

        return;

    }


    try {

        const response = await fetch(
            "http://localhost:5000/api/students/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        console.log("Student Login Response:", data);


        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Login Failed"
            );

            return;

        }


        // =================================================
        // SAVE STUDENT DATA
        // =================================================

        localStorage.setItem(
            "student",
            JSON.stringify(data.student)
        );


        // =================================================
        // SAVE JWT TOKEN
        // =================================================

        localStorage.setItem(
            "studentToken",
            data.token
        );


        console.log(
            "Student saved:",
            localStorage.getItem("student")
        );


        console.log(
            "Token saved:",
            localStorage.getItem("studentToken")
        );


        alert(
            "Login Successful 🎉"
        );


        // Redirect

        window.location.href =
            "student-dashboard.html";

    }

    catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert(
            "Server Error"
        );

    }

});