import express from 'express';
import { uploadPDF } from '../controllers/docsController.js';
import upload from '../middlewares/upload.js';
import authenticate from '../middlewares/authMiddle.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('pdf'), uploadPDF);

export default router;
