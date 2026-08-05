// ================= Navbar Active Link =================

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {

    link.addEventListener("click", function () {

        navLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});

// ================= Smooth Scroll =================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

// ================= Scroll Animation =================

window.addEventListener("scroll", () => {

    const cards = document.querySelectorAll(".feature-card");

    cards.forEach(card => {

        const position = card.getBoundingClientRect().top;

        const screen = window.innerHeight;

        if (position < screen - 100) {

            card.classList.add("show");

        }

    });

});

console.log("Campus Placement Portal Loaded Successfully 🚀");