const express = require('express');
const multer = require('multer');
const { addLeadStudents, assignFilteredLeads, getLeads, UpdateLeadCallResponse } = require('../controllers/lead-controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/admin/bulk-add', upload.single('file'), addLeadStudents);
router.post('/admin/assign-leads', assignFilteredLeads);
router.get('/admin/fetch-leads', getLeads);
router.post('/update/call-response', UpdateLeadCallResponse);

module.exports = router;