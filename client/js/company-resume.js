
"use strict";

const companyResumeToken = localStorage.getItem("companyToken");

async function viewApplicantResume(applicationId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${applicationId}/resume`,
            {
                headers: {
                    Authorization: "Bearer " + companyResumeToken
                }
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            throw new Error(
                data.message || "Resume is not available."
            );
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        window.open(url, "_blank", "noopener");

        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        console.error("View applicant resume error:", error);

        alert(error.message || "Unable to open resume.");
    }
}

function decorateCompanyApplicantRows() {
    const table = document.getElementById("applicantsTable");

    if (!table) return;

    const headerRow = table.closest("table")?.querySelector("thead tr");

    if (
        headerRow &&
        !Array.from(headerRow.cells).some(
            cell => cell.textContent.trim().toLowerCase() === "resume"
        )
    ) {
        const headers = Array.from(headerRow.cells);
        const statusHeader = headers.find(
            cell => cell.textContent.trim().toLowerCase() === "status"
        );

        const resumeHeader = document.createElement("th");
        resumeHeader.textContent = "Resume";

        if (statusHeader) {
            headerRow.insertBefore(resumeHeader, statusHeader);
        } else {
            headerRow.appendChild(resumeHeader);
        }
    }

    table.querySelectorAll("tr").forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));

        if (!cells.length) return;

        if (cells.length === 1) {
            cells[0].setAttribute("colspan", "9");
            return;
        }

        if (row.dataset.resumeColumnAdded === "true") return;

        // Expected original order:
        // ID, Name, Email, Phone, Course, Job, Status, Action.
        if (cells.length < 8) return;

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
            viewApplicantResume(applicationId);
        });

        resumeCell.appendChild(button);

        // Insert Resume before Status.
        row.insertBefore(resumeCell, cells[6]);

        row.dataset.resumeColumnAdded = "true";
    });
}

const companyApplicantTable =
    document.getElementById("applicantsTable");

if (companyApplicantTable) {
    const observer = new MutationObserver(() => {
        decorateCompanyApplicantRows();
    });

    observer.observe(companyApplicantTable, {
        childList: true,
        subtree: true
    });

    decorateCompanyApplicantRows();
}

window.viewApplicantResume = viewApplicantResume;
