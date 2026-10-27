
"use strict";

const STUDENT_RESUME_API = "http://localhost:5000/api";

function resumeHeaders() {
    return {
        Authorization: "Bearer " + localStorage.getItem("studentToken")
    };
}

async function resumeResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { message: text || "Unexpected server response" };
    }
}

async function loadStudentResumeStatus() {
    const status = document.getElementById("resumeStatusText");
    const viewButton = document.getElementById("resumeViewBtn");

    if (!status) return false;

    try {
        const response = await fetch(
            `${STUDENT_RESUME_API}/students/resume/status`,
            { headers: resumeHeaders() }
        );

        const data = await resumeResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to check resume.");
        }

        status.textContent = data.hasResume
            ? "Resume uploaded successfully."
            : "Please upload a PDF resume before applying.";

        status.className = data.hasResume
            ? "small mt-3 text-success"
            : "small mt-3 text-warning";

        if (viewButton) viewButton.hidden = !data.hasResume;

        return Boolean(data.hasResume);
    } catch (error) {
        status.textContent = error.message;
        status.className = "small mt-3 text-danger";

        if (viewButton) viewButton.hidden = true;

        return false;
    }
}

async function uploadStudentResume() {
    const fileInput = document.getElementById("resumeFile");
    const message = document.getElementById("resumeMessage");
    const button = document.getElementById("resumeUploadBtn");

    if (!fileInput?.files?.length) {
        if (message) {
            message.textContent = "Please select your PDF resume.";
            message.className = "small mt-2 text-danger";
        }
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith(".pdf")) {
        message.textContent = "Only PDF files are allowed.";
        message.className = "small mt-2 text-danger";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        message.textContent = "Maximum resume size is 5 MB.";
        message.className = "small mt-2 text-danger";
        return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    if (button) button.disabled = true;
    if (message) message.textContent = "Uploading resume...";

    try {
        const response = await fetch(
            `${STUDENT_RESUME_API}/students/resume`,
            {
                method: "POST",
                headers: resumeHeaders(),
                body: formData
            }
        );

        const data = await resumeResponse(response);

        if (!response.ok) {
            throw new Error(data.message || "Resume upload failed.");
        }

        if (message) {
            message.textContent = data.message || "Resume uploaded successfully.";
            message.className = "small mt-2 text-success";
        }

        fileInput.value = "";
        await loadStudentResumeStatus();
    } catch (error) {
        if (message) {
            message.textContent = error.message;
            message.className = "small mt-2 text-danger";
        }
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML =
                '<i class="bi bi-cloud-arrow-up me-1"></i> Upload / Replace Resume';
        }
    }
}

async function viewStudentResume() {
    let objectUrl;

    try {
        const response = await fetch(
            `${STUDENT_RESUME_API}/students/resume/file`,
            { headers: resumeHeaders() }
        );

        if (!response.ok) {
            const data = await resumeResponse(response);
            throw new Error(data.message || "Unable to open resume.");
        }

        objectUrl = URL.createObjectURL(await response.blob());

        const newWindow = window.open(objectUrl, "_blank");

        if (!newWindow) {
            URL.revokeObjectURL(objectUrl);
            throw new Error("Pop-up blocked. Allow pop-ups and try again.");
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
        alert(error.message);
    }
}

// Preserve the original applyJob function.
function installResumeCheckForApply() {
    if (typeof window.applyJob !== "function") return;
    if (window.applyJob.resumeCheckInstalled) return;

    const originalApplyJob = window.applyJob;

    async function checkedApplyJob(...args) {
        try {
            const response = await fetch(
                `${STUDENT_RESUME_API}/students/resume/status`,
                { headers: resumeHeaders() }
            );

            const data = await resumeResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Could not verify resume.");
            }

            if (!data.hasResume) {
                alert("Upload your PDF resume before applying.");

                document.getElementById("resumeSection")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;
            }

            return await originalApplyJob.apply(this, args);
        } catch (error) {
            alert(error.message || "Unable to verify resume.");
        }
    }

    checkedApplyJob.resumeCheckInstalled = true;
    window.applyJob = checkedApplyJob;
}

window.uploadStudentResume = uploadStudentResume;
window.loadStudentResumeStatus = loadStudentResumeStatus;
window.viewStudentResume = viewStudentResume;

document.addEventListener("DOMContentLoaded", () => {
    loadStudentResumeStatus();
    installResumeCheckForApply();
});
