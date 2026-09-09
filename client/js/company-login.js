// =====================================================
// COMPANY LOGIN
// =====================================================

const form = document.getElementById("companyLoginForm");


// Check form exists
if (!form) {

    console.error(
        "Company login form not found!"
    );

}


// =====================================================
// LOGIN SUBMIT
// =====================================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const email =
        document.getElementById("email").value.trim();


    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;

    }


    try {

        const response = await fetch(
            "http://localhost:5000/api/companies/login",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    email: email,

                    password: password

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "Company Login Response:",
            data
        );


        // =================================================
        // LOGIN FAILED
        // =================================================

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Login Failed"
            );

            return;

        }


        // =================================================
        // CHECK RESPONSE
        // =================================================

        if (
            !data.company ||
            !data.token
        ) {

            console.error(
                "Company or token missing:",
                data
            );

            alert(
                "Login response is missing company/token."
            );

            return;

        }


        // =================================================
        // SAVE COMPANY
        // =================================================

        localStorage.setItem(
            "company",
            JSON.stringify(
                data.company
            )
        );


        // =================================================
        // SAVE JWT TOKEN
        // =================================================

        localStorage.setItem(
            "companyToken",
            data.token
        );


        // =================================================
        // VERIFY STORAGE
        // =================================================

        console.log(
            "Saved Company:",
            localStorage.getItem(
                "company"
            )
        );


        console.log(
            "Saved Company Token:",
            localStorage.getItem(
                "companyToken"
            )
        );


        alert(
            "Login Successful 🎉"
        );


        // =================================================
        // REDIRECT
        // =================================================

        window.location.href =
            "company-dashboard.html";

    }


    catch (error) {

        console.error(
            "Company Login Error:",
            error
        );


        alert(
            "Server Error"
        );

    }

});