
const db = require("../config/db");

// =====================================================
// SKILL DICTIONARY
// =====================================================

const SKILL_DICTIONARY = {
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript"],
    "Python": ["python"],
    "Java": ["java"],
    "C++": ["c++"],
    "HTML": ["html"],
    "CSS": ["css"],
    "React": ["react", "reactjs", "react.js"],
    "Node.js": ["node.js", "nodejs"],
    "Express.js": ["express.js", "expressjs"],
    "SQL": ["sql", "mysql", "postgresql", "postgres"],
    "MongoDB": ["mongodb", "mongo db"],
    "Git": ["git", "github"],
    "REST API": ["rest api", "restful api"],
    "PHP": ["php"],
    "Django": ["django"],
    "Machine Learning": ["machine learning"],
    "Data Analysis": ["data analysis", "data analytics"],
    "Excel": ["excel", "microsoft excel"],
    "Power BI": ["power bi"],
    "AWS": ["aws", "amazon web services"],
    "Docker": ["docker"],
    "Bootstrap": ["bootstrap"],
    "Tailwind CSS": ["tailwind css"],
    "Next.js": ["next.js", "nextjs"],
    "Angular": ["angular"],
    "Vue.js": ["vue.js", "vuejs"],
    "DSA": ["dsa", "data structures and algorithms"],

    // HR skills
    "Recruitment": ["recruitment", "recruiting", "talent acquisition"],
    "Human Resources": ["human resources", "hr management"],
    "Communication": ["communication", "communication skills"],
    "Interviewing": ["interviewing", "interview coordination"],
    "Employee Relations": ["employee relations"],
    "Payroll": ["payroll"],
    "HR Analytics": ["hr analytics", "human resources analytics"],

    // Marketing skills
    "Digital Marketing": ["digital marketing"],
    "SEO": ["seo", "search engine optimization"],
    "Social Media Marketing": ["social media marketing"],
    "Content Marketing": ["content marketing"],
    "Market Research": ["market research"],
    "Google Analytics": ["google analytics"],
    "Email Marketing": ["email marketing"],
    "Advertising": ["advertising", "paid advertising"],
    "Sales": ["sales", "lead generation"],
    "Brand Management": ["brand management"]
};

// =====================================================
// HELPERS
// =====================================================

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const containsSkill = (text, alias) => {
    const pattern = new RegExp(
        `(^|[^a-z0-9])${escapeRegex(alias)}($|[^a-z0-9])`,
        "i"
    );

    return pattern.test(text);
};

const normalizeText = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.join(", ").toLowerCase();
    }

    const text = String(value);

    try {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
            return parsed.join(", ").toLowerCase();
        }
    } catch {
        // Keep ordinary text.
    }

    return text.toLowerCase();
};

const extractSkills = (value) => {
    const text = normalizeText(value);

    if (!text) {
        return [];
    }

    return Object.entries(SKILL_DICTIONARY)
        .filter(([, aliases]) =>
            aliases.some(alias => containsSkill(text, alias))
        )
        .map(([skill]) => skill);
};

// =====================================================
// GET RECOMMENDED JOBS
// GET /api/jobs/recommended
// =====================================================

const getRecommendedJobs = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "student") {
        return res.status(403).json({
            success: false,
            message: "Only students can get job recommendations"
        });
    }

    // Fetch student's skills.
    const studentSql = `
        SELECT id, skills
        FROM students
        WHERE id = ?
        LIMIT 1
    `;

    db.query(studentSql, [req.user.id], (studentError, students) => {
        if (studentError) {
            console.error("Student Skills Error:", studentError);

            return res.status(500).json({
                success: false,
                message: "Unable to load student skills"
            });
        }

        if (!students.length) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const studentSkills = extractSkills(students[0].skills);

        // DEBUG: Check skills loaded for this student.
        console.log("DEBUG STUDENT:", {
            id: students[0].id,
            savedSkills: students[0].skills,
            detectedSkills: studentSkills
        });

        // Fetch jobs including required_skills.
        const jobsSql = `
            SELECT
                jobs.id,
                jobs.company_id,
                jobs.job_title,
                jobs.job_description,
                jobs.location,
                jobs.salary,
                jobs.eligibility,
                jobs.last_date,
                jobs.required_skills,
                companies.company_name
            FROM jobs
            INNER JOIN companies
                ON jobs.company_id = companies.id
            ORDER BY jobs.id DESC
        `;

        db.query(jobsSql, (jobsError, jobs) => {
            if (jobsError) {
                console.error("Recommended Jobs Error:", jobsError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load job recommendations"
                });
            }

            // DEBUG: Confirm what MySQL returned.
            console.log(
                "DEBUG JOB SKILLS:",
                jobs.map(job => ({
                    id: job.id,
                    title: job.job_title,
                    savedRequiredSkills: job.required_skills
                }))
            );

            const recommendations = jobs.map(job => {
                const explicitSkills = extractSkills(job.required_skills);

                const fallbackText = [
                    job.job_title,
                    job.job_description
                ].filter(Boolean).join(" ");

                const requiredSkills = explicitSkills.length
                    ? explicitSkills
                    : extractSkills(fallbackText);

                const matchedSkills = requiredSkills.filter(skill =>
                    studentSkills.includes(skill)
                );

                const missingSkills = requiredSkills.filter(skill =>
                    !studentSkills.includes(skill)
                );

                const matchPercentage = requiredSkills.length > 0
                    ? Math.round(
                        (matchedSkills.length / requiredSkills.length) * 100
                    )
                    : null;

                let matchingNote;

                if (!studentSkills.length) {
                    matchingNote =
                        "Add your actual skills to your student profile.";
                } else if (!requiredSkills.length) {
                    matchingNote =
                        "No recognized skills found for this job. Add required skills in the job record.";
                } else {
                    matchingNote =
                        `${matchedSkills.length} of ${requiredSkills.length} required skills match.`;
                }

                return {
                    id: job.id,
                    company_id: job.company_id,
                    job_title: job.job_title,
                    job_description: job.job_description,
                    location: job.location,
                    salary: job.salary,
                    eligibility: job.eligibility,
                    last_date: job.last_date,
                    company_name: job.company_name,
                    requiredSkills,
                    matchedSkills,
                    missingSkills,
                    matchPercentage,
                    matchingNote
                };
            });

            recommendations.sort((a, b) => {
                if (a.matchPercentage === null) return 1;
                if (b.matchPercentage === null) return -1;

                return (
                    b.matchPercentage - a.matchPercentage ||
                    b.id - a.id
                );
            });

            return res.status(200).json({
                success: true,
                method: "Explainable skill matching",
                studentSkills,
                totalJobs: recommendations.length,
                recommendations
            });
        });
    });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getRecommendedJobs
};
