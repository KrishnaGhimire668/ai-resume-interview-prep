const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {

        const { selfDescription, jobDescription } = req.body

        // SAFETY CHECK - require either a resume file OR a self description
        if (!req.file && !selfDescription) {
            return res.status(400).json({
                message: "Either a resume file or a self description is required"
            })
        }

        // Only parse PDF if a resume file was actually uploaded
        let resumeContent = ""
        if (req.file) {
            const data = await pdfParse(req.file.buffer)
            resumeContent = data.text
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (error) {
        console.error("Interview Generate Error:", error)

        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        // Safety wrap for long-running AI streaming/generation tasks on Render free tiers
        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        // EXPOSE headers explicitly so Axios running on your decoupled frontend domain can read the binary data stream
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Access-Control-Expose-Headers": "Content-Disposition"
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("PDF Generation Error on Server:", error);
        res.status(500).json({ 
            message: "Failed to generate resume PDF due to internal server error." 
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}