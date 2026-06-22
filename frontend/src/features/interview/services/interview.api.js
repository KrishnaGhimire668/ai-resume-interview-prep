import axios from "axios";

// Create an axios instance with a base URL configuration
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    timeout: 30000, 
    withCredentials: true
});

/**
 * Generate a new interview report using job description and resume upload
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    
    // Only append the file if it exists
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    const response = await API.post("/interview/generate", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

/**
 * Fetch an individual report by its unique MongoDB or Database ID
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await API.get(`/interview/report/${interviewId}`);
    return response.data;
};

/**
 * Fetch a list of all historical interview reports
 */
export const getAllInterviewReports = async () => {
    const response = await API.get("/interview/reports");
    return response.data;
};

/**
 * Request server-side generation of a PDF document and return it as a blob
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await API.post(
        `/interview/report/${interviewReportId}/pdf`,
        {},
        {
            responseType: "blob", // CRITICAL: Forces Axios to process the response data as binary streams
        }
    );
    return response.data;
};

export default API;