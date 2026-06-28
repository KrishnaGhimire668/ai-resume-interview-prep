const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const PDFDocument = require("pdfkit")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

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
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)
}

/**
 * @description Generates a pure binary PDF buffer out of plain text fields using PDFKit 
 */
async function generatePdfFromText(structuredContent) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 40
        });

        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            let pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on("error", (err) => reject(err));

        // Document Header / Title
        doc.fillColor("#1e293b").fontSize(24).text(structuredContent.name || "Tailored Resume", { align: "center" });
        doc.fontSize(10).fillColor("#64748b").text(structuredContent.contactInfo || "", { align: "center" });
        doc.moveDown(1.5);

        // Summary Section
        if (structuredContent.summary) {
            doc.fillColor("#0f172a").fontSize(14).text("Professional Summary");
            doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fillColor("#334155").fontSize(10).text(structuredContent.summary, { align: "justify" });
            doc.moveDown(1.5);
        }

        // Core Experience
        if (structuredContent.experience) {
            doc.fillColor("#0f172a").fontSize(14).text("Professional Experience");
            doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fillColor("#334155").fontSize(10).text(structuredContent.experience, { align: "left" });
            doc.moveDown(1.5);
        }

        // Skills Matrix
        if (structuredContent.skills) {
            doc.fillColor("#0f172a").fontSize(14).text("Technical Skills");
            doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fillColor("#334155").fontSize(10).text(structuredContent.skills, { align: "left" });
        }

        doc.end();
    });
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    // We update the schema to prompt Gemini for pure markdown/text keys instead of tricky HTML
    const resumeSchema = z.object({
        name: z.string().describe("Candidate full name"),
        contactInfo: z.string().describe("Email, Phone, Location, Portfolio Links separated by pipes |"),
        summary: z.string().describe("An ATS-friendly professional summary optimized specifically for the target job"),
        experience: z.string().describe("Detailed professional experience section containing jobs, titles, dates, and metric-driven bullet points"),
        skills: z.string().describe("Clean categorized list of relevant technical and soft skills matching the job description")
    })

    const prompt = `Generate an ATS-optimized resume based on these inputs:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Highlight the candidate's technical strengths matching the job description. The experience bullet points should sound real, professional, and written by a human. Make it highly competitive.`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumeSchema),
        }
    })

    const structuredContent = JSON.parse(response.text)
    
    // Pass clean object straight into native memory-safe compiler engine
    const pdfBuffer = await generatePdfFromText(structuredContent)

    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }