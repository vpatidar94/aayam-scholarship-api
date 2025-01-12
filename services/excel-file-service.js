const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * To read excel file and return the data in form json
 * @param {*} file : single excel file
 * @returns : file data in form of json
 */
const readExcelFile = async (file) => {
    if (!file) {
        return { data: null, error: 'No file uploaded' };
    }

    // Full path to the uploaded file
    const filePath = path.join(__dirname, '..', file.path);
    try {
        // Read the Excel file
        const workbook = xlsx.readFile(filePath);

        // Get the first sheet in the workbook
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON format
        const data = xlsx.utils.sheet_to_json(sheet);

        // Delete the uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete file:', err);
            }
        });

        // Send the parsed data as JSON
        return { data: data, error: null };
    } catch (error) {
        return { data: null, error: 'Error reading the file: ' + err }
    }
};

module.exports = {
    readExcelFile,
}; 