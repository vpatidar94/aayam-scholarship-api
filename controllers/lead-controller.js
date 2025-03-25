const { default: mongoose } = require("mongoose");
const LeadUser = require("../models/lead-user");
const Telecaller = require('../models/telecaller-model');
const CallResponse = require('../models/call-response');
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
                        $set: { assignedTo: telecallerId, lastAssignedDate: new Date(), pending: true },
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


// get leads with filter and sort
const getLeads = async (req, res) => {
    try {
        const {
            status, city, district, stream, priority, assignedTo,
            search, sortBy = 'priority', sortOrder = 'desc', page = 1, limit = 10, onlyUnassigned,
            gender, class: studentClass, medium, leadSource,
            lastContactedFrom, lastContactedTo, followUpFrom, followUpTo
        } = req.query;

        const filters = {};

        if (status) filters.status = { $in: status.split(',') }; // Allow multiple statuses
        if (priority) filters.priority = { $in: priority.split(',') }; // Allow multiple priorities
        if (city) filters.city = city;
        if (district) filters.district = district;
        if (stream) filters.stream = stream;
        if (gender) filters.gender = gender;
        if (studentClass) filters.class = studentClass;
        if (medium) filters.medium = medium;
        if (leadSource) filters.leadSource = leadSource;

        if (onlyUnassigned === 'true') {
            filters.assignedTo = null; // Fetch only unassigned leads
        } else if (assignedTo) {
            filters.assignedTo = assignedTo; // Fetch leads assigned to a specific telecaller
        }

        // Date range filter for last contacted date
        if (lastContactedFrom || lastContactedTo) {
            filters.lastContactedDate = {};
            if (lastContactedFrom) filters.lastContactedDate.$gte = new Date(lastContactedFrom);
            if (lastContactedTo) filters.lastContactedDate.$lte = new Date(lastContactedTo);
        }

        // Date range filter for follow-up date
        if (followUpFrom || followUpTo) {
            filters.followUpDate = {};
            if (followUpFrom) filters.followUpDate.$gte = new Date(followUpFrom);
            if (followUpTo) filters.followUpDate.$lte = new Date(followUpTo);
        }

        // Search logic: Matches name, mobile, school, etc.
        if (search) {
            filters.$or = [
                { fullName: new RegExp(search, 'i') },
                { mobileNo: new RegExp(search, 'i') },
                { parentName: new RegExp(search, 'i') },
                { schoolName: new RegExp(search, 'i') },
            ];
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalLeads = await LeadUser.countDocuments(filters);

        // Fetch leads
        const leads = await LeadUser.find(filters)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('assignedTo', 'fullName')
            .populate('callResponses');

        return res.status(200).json({
            code: 200,
            status_code: "success",
            data: {
                totalLeads,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLeads / limit),
                leads
            },
            message: "Leads fetched successfully."
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        return res.status(500).json({
            code: 500,
            status_code: "error",
            message: "An error occurred while fetching leads."
        });
    }
};

// update/ add call response , lead data api 
const UpdateLeadCallResponse = async (req, res) => {
    const { leadId, telecallerId, callType, callDuration, response, notes, nextFollowUpDate, leadStatus } = req.body;

    if (!leadId || !telecallerId) {
        return res.status(400).json({ message: "Lead ID and Telecaller ID are required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let transactionCommitted = false;

    try {
        // 1. Add new CallResponse
        const newCallResponse = new CallResponse({
            leadId,
            telecallerId,
            callType,
            callDuration,
            response,
            notes,
            nextFollowUpDate,
            callDate: new Date()
        });

        await newCallResponse.save({ session });

        //  2. Update Lead with manual status
        const leadUpdate = {
            lastContactedDate: new Date(),
            contacted: true,  // Mark as contacted
            status: leadStatus,  //  Use the manually provided status
            pending: false,
            assignedTo: null,
        };

        if (nextFollowUpDate) {
            leadUpdate.followUpDate = nextFollowUpDate;
        }

        const updatedLead = await LeadUser.findByIdAndUpdate(leadId, leadUpdate, { session });

        //  3. Update Telecaller Stats
        const telecaller = await Telecaller.findById(telecallerId).session(session);
        let updatedTelecaller
        if (telecaller) {
            telecaller.callsMadeToday += 1;
            telecaller.totalCallsMade += 1;

            updatedTelecaller = await telecaller.save({ session });
        }

        //  Commit the transaction
        await session.commitTransaction();
        transactionCommitted = true;  // Mark as committed
        session.endSession();

        return res.status(201).json({
            code: 201,
            status_code: "success",
            data: { newCallResponse, updatedLead, updatedTelecaller },
            message: "Call response added successfully and lead updated",
        });

    } catch (error) {
        //  Only abort if the transaction wasn't committed
        if (!transactionCommitted) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error(error);
        return res.status(500).json({
            code: 500,
            status_code: "error",
            message: "Error adding call response", error
        });
    }
};


module.exports = {
    addLeadStudents,
    assignFilteredLeads,
    getLeads,
    UpdateLeadCallResponse,
};