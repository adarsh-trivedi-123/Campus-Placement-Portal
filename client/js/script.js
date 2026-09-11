console.log("Homepage script loaded");

document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".feature-card");

    console.log("Feature cards found:", cards.length);

    cards.forEach(function (card) {
        card.style.display = "block";
        card.style.visibility = "visible";
        card.style.opacity = "1";
        card.style.transform = "none";
    });

});