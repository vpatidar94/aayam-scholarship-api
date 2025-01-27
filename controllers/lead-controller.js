const { default: mongoose } = require("mongoose");
const LeadUser = require("../models/lead-user");
const Telecaller = require('../models/telecaller-model');
const { readExcelFile } = require("../services/excel-file-service");
const LeadAssignmentHistory = require('../models/lead-assignment-history');

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
            const leadSource = String(lead.leadSource || "ORGANIC").trim();
            const priority = String(lead.priority || "MEDIUM").trim();

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
                status: 'NEW',
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

// Assign leads accordig to filter
const assignFilteredLeads = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { assignments, leadFilter } = req.body;

        if (!assignments || assignments.length === 0) {
            return res.status(400).json({
                code: 400,
                status_code: "error",
                message: 'No telecaller assignments specified.'
            });
        }

        await session.startTransaction();

        // Step 1: Validate and fetch telecallers
        const telecallerIds = assignments.map((item) => item.telecallerId);
        const telecallers = await Telecaller.find({
            _id: { $in: telecallerIds },
            isAbsent: false
        }).session(session);

        if (telecallers.length !== assignments.length) {
            await session.abortTransaction();
            return res.status(404).json({
                code: 404,
                status_code: "error",
                message: 'Some telecallers were not found or are unavailable.'
            });
        }

        // Step 2: Fetch unassigned leads based on the filter
        const leads = await LeadUser.find({
            ...leadFilter,
            assignedTo: null // Ensure only unassigned leads are considered
        })
            .sort({ priority: -1 }) // Sort leads by priority (highest first)
            .session(session);

        if (!leads.length) {
            await session.abortTransaction();
            return res.status(404).json({ code: 404, status_code: "error", message: 'No leads available for assignment.' });
        }

        // Step 3: Assign leads based on specified numbers
        const assignmentsMap = new Map(assignments.map(item => [item.telecallerId, item.count]));
        const leadQueue = [...leads]; // A queue of unassigned leads
        const assignmentResults = [];

        for (const telecaller of telecallers) {
            const leadsToAssignCount = assignmentsMap.get(String(telecaller._id)) || 0;

            if (leadsToAssignCount <= 0) continue;

            const leadsToAssign = leadQueue.splice(0, leadsToAssignCount);
            if (leadsToAssign.length > 0) {
                assignmentResults.push({
                    telecallerId: telecaller._id,
                    leadIds: leadsToAssign.map((lead) => lead._id),
                });

                telecaller.leadsAssignedToday += leadsToAssign.length;
            }
        }

        if (!assignmentResults.length) {
            await session.abortTransaction();
            return res.status(400).json({
                code: 400, status_code: "error",
                message: 'No leads assigned due to quota limits or insufficient leads.'
            });
        }

        // Step 4: Bulk update leads and save assignment history
        const bulkLeadUpdates = assignmentResults.flatMap(({ telecallerId, leadIds }) =>
            leadIds.map((leadId) => ({
                updateOne: {
                    filter: { _id: leadId },
                    update: {
                        $set: { assignedTo: telecallerId, assignedDate: new Date() },
                    },
                },
            }))
        );

        await LeadUser.bulkWrite(bulkLeadUpdates, { session });

        // Create assignment history for tracking
        const assignmentHistory = assignmentResults.flatMap(({ telecallerId, leadIds }) =>
            leadIds.map((leadId) => ({
                leadId,
                telecallerId,
            }))
        );

        await LeadAssignmentHistory.insertMany(assignmentHistory, { session });

        // Commit the transaction
        await Promise.all(telecallers.map((telecaller) => telecaller.save({ session })));
        await session.commitTransaction();

        return res.status(201).json({
            code: 201, status_code: "success",
            data: assignmentResults,
            message: 'Leads assigned successfully.',
        });
    } catch (error) {
        console.error('Error during lead assignment:', error);
        await session.abortTransaction();
        return res.status(500).json({
            code: 500, status_code: "error",
            message: `An error occurred during lead assignment. ${error.message}`,
            error: error.message,
        });
    } finally {
        session.endSession();
    }
};


module.exports = { addLeadStudents, assignFilteredLeads };