const express = require('express');
const multer = require('multer');
const { addLeadStudents } = require('../controllers/lead-controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/admin/bulk-add', upload.single('file'), addLeadStudents);

module.exports = router;