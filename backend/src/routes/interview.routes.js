const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

/**
 * @description generate new interview report on the basis of user self description, resume pdf and job description.
 */
interviewRouter.post("/generate", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @description get interview report by interviewId.
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @description get all interview reports of logged in user.
 */
interviewRouter.get("/reports", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 */
interviewRouter.post("/report/:interviewReportId/pdf", authMiddleware.authUser, interviewController.generateResumePdfController)

module.exports = interviewRouter