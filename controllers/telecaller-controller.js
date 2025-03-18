const Telecaller = require("../models/telecaller-model");

const addTelecaller = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data
    console.log(mobileNo)
    try {
        const existingTelecaller = await Telecaller.findOne({ mobileNo });
        console.log(existingTelecaller)
        if (existingTelecaller) {
            return res.status(400).json({ code: 400, status_code: "error", message: " Telecaller already exists" });
        }

        const newTelecaller = new Telecaller({
            ...data
        })
        const savedTelecaller = await newTelecaller.save();
        return res.status(200).json({ data: savedTelecaller, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}


const getTelecallers = async (req, res) => {
    try {
        const {
            isAbsent,
            minLeads,
            maxLeads,
            sortBy = 'name',
            sortOrder = 'asc',
            limit = 10,
            page = 1
        } = req.query;

        const filters = {};

        // Apply filters
        if (isAbsent !== undefined) {
            filters.isAbsent = isAbsent === 'true';
        }

        if (minLeads) {
            filters.leadsAssignedToday = { $gte: parseInt(minLeads) };
        }

        if (maxLeads) {
            filters.leadsAssignedToday = {
                ...filters.leadsAssignedToday,
                $lte: parseInt(maxLeads)
            };
        }

        // Pagination and sorting
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const telecallers = await Telecaller.find(filters)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(pageSize);

        const total = await Telecaller.countDocuments(filters);

        res.status(200).json({
            code: 200,
            status_code: "success",
            data: telecallers,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            message: 'Telecallers retrieved successfully.'
        });

    } catch (error) {
        console.error('Error fetching telecallers:', error);
        res.status(500).json({
            code: 500,
            status_code: "error",
            message: 'Failed to retrieve telecallers.',
            error: error.message
        });
    }
};

module.exports = {
    addTelecaller,
    getTelecallers,
}