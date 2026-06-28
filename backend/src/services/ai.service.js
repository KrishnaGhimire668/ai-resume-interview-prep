const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const PDFDocument = require("pdfkit");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    });
    return JSON.parse(response.text);
}

/**
 * Modern Executive Resume PDF Generator
 */
async function generatePdfFromText(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            bufferPages: true
        });

        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        const pageWidth = doc.page.width - 100;

        // Header
        doc.fillColor("#1e293b")
           .fontSize(28)
           .font("Helvetica-Bold")
           .text(data.name || "Candidate Name", { align: "center" });

        doc.moveDown(0.5);
        doc.fillColor("#64748b")
           .fontSize(11)
           .font("Helvetica")
           .text(data.contactInfo || "", { align: "center" });

        doc.moveDown(2);

        // Professional Summary
        if (data.summary) {
            doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
            doc.moveDown(0.4);
            doc.strokeColor("#e2e8f0").lineWidth(2)
               .moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();

            doc.moveDown(0.8);
            doc.fillColor("#334155").fontSize(10.8).font("Helvetica")
               .text(data.summary, { align: "justify", lineGap: 2 });
            doc.moveDown(2);
        }

        // Experience
        if (data.experience) {
            doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("PROFESSIONAL EXPERIENCE");
            doc.moveDown(0.4);
            doc.strokeColor("#e2e8f0").lineWidth(2)
               .moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();

            doc.moveDown(0.8);
            doc.fillColor("#334155").fontSize(10.5).font("Helvetica")
               .text(data.experience, { align: "left", lineGap: 4, paragraphGap: 10 });
            doc.moveDown(2);
        }

        // Skills
        if (data.skills) {
            doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("TECHNICAL SKILLS");
            doc.moveDown(0.4);
            doc.strokeColor("#e2e8f0").lineWidth(2)
               .moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();

            doc.moveDown(0.8);
            doc.fillColor("#334155").fontSize(10.5).font("Helvetica")
               .text(data.skills, { align: "left", lineGap: 3 });
            doc.moveDown(2);
        }

        // Education
        if (data.education) {
            doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("EDUCATION");
            doc.moveDown(0.4);
            doc.strokeColor("#e2e8f0").lineWidth(2)
               .moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();

            doc.moveDown(0.8);
            doc.fillColor("#334155").fontSize(10.5).font("Helvetica")
               .text(data.education, { align: "left", lineGap: 3 });
        }

        doc.end();
    });
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumeSchema = z.object({
        name: z.string().describe("Candidate full name"),
        contactInfo: z.string().describe("Email, Phone, Location, LinkedIn, Portfolio separated by |"),
        summary: z.string().describe("Strong ATS-friendly professional summary (under 70 words)"),
        experience: z.string().describe("Detailed experience section with job titles, companies, dates, and strong bullet points"),
        skills: z.string().describe("Well-categorized technical and relevant skills"),
        education: z.string().optional().describe("Education: Degree, University, Graduation Year, etc.")
    });

    const prompt = `
Create a modern, ATS-optimized, and highly professional resume.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Rules:
- Strongly tailor the resume to the target job.
- Use confident, executive-level language.
- Quantify achievements wherever possible.
- Keep summary under 70 words.
- Each role should have 3–5 strong bullet points.
- Categorize skills clearly (Languages, Frameworks, Tools, etc.).
- Include education section.
- Return ONLY valid JSON matching the schema. No extra text.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumeSchema),
        }
    });

    const structuredContent = JSON.parse(response.text);
    const pdfBuffer = await generatePdfFromText(structuredContent);
    return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };