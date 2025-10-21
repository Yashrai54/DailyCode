import express from 'express';
import handleSubmission from '../controllers/submission.controller.js';

import isAuth from '../middlewares/isAuth.js';
import { upload } from '../config/multer.js';
const submissionRouter=express.Router();

submissionRouter.post("/:id",isAuth,upload.single('codeFile'),handleSubmission);

export default submissionRouter;