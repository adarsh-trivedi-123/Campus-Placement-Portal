"use strict";

const adminResumeToken = localStorage.getItem("token");

let adminResumeDecorating = false;

async function viewApplicationResume(applicationId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${applicationId}/resume`,
            {
                headers: {
                    Authorization: "Bearer " + adminResumeToken
                }
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
                data.message || "Resume is not available for this application."
            );
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const openedWindow = window.open(url, "_blank");

        if (!openedWindow) {
            URL.revokeObjectURL(url);
            throw new Error("Please allow pop-ups to view the resume.");
        }

        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        console.error("View application resume error:", error);
        alert(error.message || "Unable to open resume.");
    }
}

function decorateAdminApplicationsTable() {
    if (adminResumeDecorating) return;

    const pageTitle = document.getElementById("pageTitle");

    if (
        !pageTitle ||
        pageTitle.textContent.trim().toLowerCase() !== "applications"
    ) {
        return;
    }

    const head = document.getElementById("tableHead");
    const body = document.getElementById("dataTable");

    if (!head || !body) return;

    adminResumeDecorating = true;

    try {
        const headerRow = head.querySelector("tr");

        if (
            headerRow &&
            !Array.from(headerRow.cells).some(
                cell => cell.textContent.trim().toLowerCase() === "resume"
            )
        ) {
            const actionHeader = Array.from(headerRow.cells).find(
                cell => cell.textContent.trim().toLowerCase() === "action"
            );

            const resumeHeader = document.createElement("th");
            resumeHeader.textContent = "Resume";

            if (actionHeader) {
                headerRow.insertBefore(resumeHeader, actionHeader);
            } else {
                headerRow.appendChild(resumeHeader);
            }
        }

        body.querySelectorAll("tr").forEach(row => {
            const cells = row.querySelectorAll("td");

            if (!cells.length) return;

            if (cells.length === 1) {
                cells[0].setAttribute("colspan", "10");
                return;
            }

            if (row.dataset.resumeColumnAdded === "true") return;

            // Existing columns: ID, Student, Email, Phone, Course,
            // Company, Job, Applied At, Action.
            if (cells.length < 9) return;

            const applicationId = cells[0].textContent
                .replace("#", "")
                .trim();

            if (!/^\d+$/.test(applicationId)) return;

            const resumeCell = document.createElement("td");
            const button = document.createElement("button");

            button.type = "button";
            button.className = "btn btn-outline-primary btn-sm";
            button.innerHTML =
                '<i class="bi bi-file-earmark-pdf me-1"></i> View Resume';

            button.addEventListener("click", () => {
                viewApplicationResume(applicationId);
            });

            resumeCell.appendChild(button);

            row.insertBefore(resumeCell, cells[8]);
            row.dataset.resumeColumnAdded = "true";
        });
    } finally {
        adminResumeDecorating = false;
    }
}

const originalAdminLoadApplications = window.loadApplications;

if (typeof originalAdminLoadApplications === "function") {
    window.loadApplications = async function (...args) {
        const result = await originalAdminLoadApplications.apply(this, args);
        decorateAdminApplicationsTable();
        return result;
    };
}

const adminHead = document.getElementById("tableHead");
const adminBody = document.getElementById("dataTable");

if (adminHead && adminBody) {
    const observer = new MutationObserver(() => {
        decorateAdminApplicationsTable();
    });

    observer.observe(adminHead, {
        childList: true,
        subtree: true
    });

    observer.observe(adminBody, {
        childList: true,
        subtree: true
    });
}

window.viewApplicationResume = viewApplicationResume;