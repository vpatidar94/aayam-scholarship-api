const Center = require("../models/test-center")

const testCenter = async (req, res) => {
    try {
      const { name, capacity, centerId, address } = req.body;
  
      // Create a new center instance
      const newCenter = new Center({
        name,
        capacity,
        centerId,
        address
      });
  
      // Save the center to the database
      const savedCenter = await newCenter.save();
  
      res.status(201).json(savedCenter);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  module.exports = testCenter;