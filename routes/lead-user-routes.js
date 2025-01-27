const express = require('express');
const multer = require('multer');
const { addLeadStudents, assignFilteredLeads } = require('../controllers/lead-controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/admin/bulk-add', upload.single('file'), addLeadStudents);
router.post('/admin/assign-leads', assignFilteredLeads);

module.exports = router;