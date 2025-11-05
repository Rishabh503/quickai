import express from "express";
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import { exportResumePDF, extractResumeText, getResumeHistory, resumeReviewNew, saveResumeVersion } from "../controllers/resumeController.js";
import { youtubeAnalyze } from "../controllers/youtbeController.js";

const aiRouter=express.Router()

aiRouter.post('/generate-article',auth,generateArticle)
aiRouter.post('/generate-blog-title',auth,generateBlogTitle)
aiRouter.post('/generate-image',auth,generateImage)
aiRouter.post('/remove-image-background',upload.single('image'),auth,removeImageBackground)
aiRouter.post('/remove-image-object',upload.single('image'),auth,removeImageObject)
aiRouter.post('/resume-review',upload.single('resume'),auth,resumeReview)
aiRouter.post('/youtube-analyze',auth,youtubeAnalyze)


// resume review ones 

aiRouter.post('/resume-review-new',upload.single('file'),auth,resumeReviewNew)
aiRouter.post('/extract-resume-text',upload.single('file'),auth,extractResumeText)
aiRouter.post('/save-resume-version',auth,saveResumeVersion)
aiRouter.post('/resume-history',auth,getResumeHistory)
aiRouter.post('/export-resume-pdf',auth,exportResumePDF)


export default aiRouter