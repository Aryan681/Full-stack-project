const express = require('express');
const { uploadPDF } = require('../controllers/docsController');
const upload = require('../middlewares/upload');
const authenticate = require('../middlewares/authMiddle');

const router = express.Router();

router.post('/upload', authenticate, upload.single('pdf'), uploadPDF);

module.exports = router;
