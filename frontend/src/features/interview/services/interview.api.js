import axios from "axios";

// Dynamically use the live backend URL if it exists, otherwise fall back to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// 1. Fetch all interview reports
export async function getAllInterviewReports() {
    const response = await api.get("/interview/reports");
    return response.data;
}

// 2. Generate a new interview report
export async function generateInterviewReport({ jobDescription, selfDescription, resumeFile }) {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)

    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/interview/generate", formData)
    return response.data
}

// 3. Fetch a single interview report by ID
export async function getInterviewReportById(id) {
    const response = await api.get(`/interview/report/${id}`);
    return response.data;
}

// 4. Generate/Download the Resume PDF
export async function generateResumePdf({ interviewReportId }) {
    const response = await api.get(`/interview/report/${interviewReportId}/pdf`, {
        responseType: "blob" // Crucial for structural binary processing
    });
    return response.data;
}