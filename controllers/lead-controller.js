const LeadUser = require("../models/lead-user");
const { readExcelFile } = require("../services/excel-file-service");

const addLeadStudents = async (req, res) => {
    try {
        const file = req?.file;

        if (!file) {
            return res.status(400).json({ code: 400, status_code: "error", message: 'No file uploaded' });
        }

        const { data, error } = await readExcelFile(file);

        if (error) {
            return res.status(500).json({ code: 500, status_code: "error", message: 'Error reading the Excel file' });
        }

        const leads = [];
        const invalidRows = [];
        const fileMobileNumbers = new Set();
        const fileDuplicates = [];

        // Step 1: Data Validation & File Duplicates Check
        data.forEach((lead, index) => {
            const studentName = String(lead.studentName || "").trim();
            const studentContact = String(lead.studentContact || "").trim();
            const email = String(lead.email || "").trim();
            const parentContact = String(lead.parentContact || "").trim();
            const leadSource = String(lead.leadSource || "organic").trim();
            const priority = String(lead.priority || "medium").trim();

            if (!studentName || !studentContact) {
                invalidRows.push({ row: index + 2, data: lead, reason: 'Missing required fields' });
                return;
            }

            // Check for duplicates within the same file
            if (fileMobileNumbers.has(studentContact)) {
                fileDuplicates.push({ row: index + 2, data: lead, reason: 'Duplicate mobile number in the file' });
                return;
            }

            // Add to the file's unique mobile number set
            fileMobileNumbers.add(studentContact);

            // Prepare the lead for insertion
            leads.push({
                fullName: studentName,
                mobileNo: studentContact,
                email,
                parentContact,
                leadSource,
                status: 'new',
                priority
            });
        });

        if (leads.length === 0) {
            return res.status(400).json({
                code: 400,
                status_code: "error",
                message: 'No valid leads found in the file',
                invalidRows,
                fileDuplicates
            });
        }

        // Step 2: Check for Existing Duplicates in the Database
        const existingContacts = await LeadUser.find({
            mobileNo: { $in: Array.from(fileMobileNumbers) }
        });

        const dbDuplicates = existingContacts.map(lead => lead.mobileNo);

        // Step 3: Filter Out Existing Duplicates Before Insert
        const filteredLeads = leads.filter(lead => !dbDuplicates.includes(lead.mobileNo));

        // Step 4: Bulk Insert for Valid Leads Only
        const bulkWriteOperations = filteredLeads.map(lead => ({
            updateOne: {
                filter: { mobileNo: lead.mobileNo },
                update: { $setOnInsert: lead },
                upsert: true
            }
        }));

        const bulkWriteResult = await LeadUser.bulkWrite(bulkWriteOperations, { ordered: false });

        // Step 5: Response Summary
        return res.status(201).json({
            code: 201,
            status_code: "success",
            data: {
                insertedCount: bulkWriteResult.insertedCount || filteredLeads.length,
                invalidRows,
                fileDuplicates,
                dbDuplicates
            },
            message: `Bulk leads processed successfully. ${filteredLeads.length} leads added, ${dbDuplicates.length} duplicates found.`
        });
    } catch (error) {
        console.error('Error processing bulk leads:', error);
        return res.status(500).json({
            code: 500,
            status_code: "error",
            message: 'An error occurred while adding leads in bulk',
            error: error.message
        });
    }
};

module.exports = { addLeadStudents };